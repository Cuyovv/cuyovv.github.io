import { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { STOCK_DEFINITIONS } from './stockUtils';

function symbolSeed(symbol) {
  let h = 0x811c9dc5;
  for (let i = 0; i < symbol.length; i++) {
    h ^= symbol.charCodeAt(i);
    h = (h * 0x01000193) & 0xffffffff;
  }
  return Math.abs(h);
}

// Fast deterministic noise — no loops, O(1) per call
function rand(seed) {
  seed = ((seed >>> 16) ^ seed) * 0x45d9f3b;
  seed = ((seed >>> 16) ^ seed) * 0x45d9f3b;
  seed = (seed >>> 16) ^ seed;
  return (seed & 0x7fffffff) / 0x7fffffff;
}

// Per-tier volatility config — tuned for 50-100% max gain potential
const TIER_VOL = { free: 0.022, premium: 0.032, platinum: 0.042, prestige: 0.035 };
// Price floor: never drop below 60% of base price
const TIER_FLOOR_RATIO = { free: 0.60, premium: 0.55, platinum: 0.50, prestige: 0.55 };

// Generate a deterministic price for a given symbol + epoch
function computeStockPrice(def, epochInterval) {
  const { basePrice, symbol, tier } = def;
  const sym = symbolSeed(symbol);
  const baseVol = TIER_VOL[tier] || 0.08;
  // Per-stock variance within ±30% of base vol
  const perStockVol = baseVol * (0.7 + (sym % 100) / 100 * 0.6);

  const r1 = rand((sym ^ (epochInterval * 2654435761)) & 0x7fffffff);
  const r2 = rand((sym ^ (epochInterval * 2246822519)) & 0x7fffffff);
  const r3 = rand((sym ^ (Math.floor(epochInterval / 4) * 3266489917)) & 0x7fffffff);
  const r4 = rand((sym ^ (Math.floor(epochInterval / 10) * 668265263)) & 0x7fffffff);
  const r5 = rand((sym ^ (Math.floor(epochInterval / 20) * 1234567891)) & 0x7fffffff);

  // Box-Muller Gaussian noise (short-term tick)
  const u1 = Math.max(1e-10, r1);
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * r2);

  // Rare volatility spike (news event) — dampened
  const volMultiplier = r4 < 0.04 ? 1.6 : r4 < 0.12 ? 1.2 : 1.0;

  // Medium-term trend (shifts ~every 4 intervals)
  const trend = (r3 - 0.5) * perStockVol * 1.2;

  // Slow macro cycle (~every 20 intervals)
  const macro = (r5 - 0.5) * perStockVol * 0.6;

  const deviation = (z * perStockVol * volMultiplier + trend + macro) * basePrice;
  // Floor: never below FLOOR_RATIO * basePrice (guaranteed 1000%+ upside possible)
  const floorRatio = TIER_FLOOR_RATIO[tier] || 0.20;
  const floor = basePrice * floorRatio;
  return Math.max(floor, basePrice + deviation);
}

function getCurrentInterval() {
  return Math.floor(Date.now() / 30000); // 30-second intervals
}

export function useStockEngine() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const intervalRef = useRef(null);

  const updatePrices = useCallback(() => {
    const currentInterval = getCurrentInterval();
    const previousInterval = currentInterval - 1;

    const updatedStocks = STOCK_DEFINITIONS.map(def => {
      const currentPrice = computeStockPrice(def, currentInterval);
      const previousPrice = computeStockPrice(def, previousInterval);

      // Last 3 interval-over-interval % changes (most recent first)
      const recentChanges = [1, 2, 3].map(offset => {
        const a = computeStockPrice(def, currentInterval - offset + 1);
        const b = computeStockPrice(def, currentInterval - offset);
        return parseFloat(((a - b) / b * 100).toFixed(2));
      });
      
      return {
        ...def,
        price: parseFloat(currentPrice.toFixed(2)),
        previous_price: parseFloat(previousPrice.toFixed(2)),
        change: parseFloat((currentPrice - previousPrice).toFixed(2)),
        changePercent: parseFloat(((currentPrice - previousPrice) / previousPrice * 100).toFixed(2)),
        recentChanges, // [latest, -1, -2]
      };
    });

    setStocks(updatedStocks);
    setLoading(false);
  }, []);

  useEffect(() => {
    updatePrices();

    // Update countdown every second
    const timer = setInterval(() => {
      const now = Date.now();
      const nextUpdate = (Math.floor(now / 30000) + 1) * 30000;
      const remaining = Math.ceil((nextUpdate - now) / 1000);
      setCountdown(remaining);

      // Check if we crossed a 30-second boundary
      if (remaining === 30) {
        updatePrices();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [updatePrices]);

  return { stocks, loading, countdown };
}