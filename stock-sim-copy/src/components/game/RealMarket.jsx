import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Approximate real prices & volatility as of early 2026
const STOCKS = [
  { symbol: 'AAPL',  name: 'Apple',      color: '#a8b0bb', base2026: 248,  vol: 0.018, trend: 0.0003 },
  { symbol: 'MSFT',  name: 'Microsoft',  color: '#00a4ef', base2026: 415,  vol: 0.016, trend: 0.0004 },
  { symbol: 'NVDA',  name: 'NVIDIA',     color: '#76b900', base2026: 138,  vol: 0.035, trend: 0.0008 },
  { symbol: 'GOOGL', name: 'Alphabet',   color: '#4285f4', base2026: 192,  vol: 0.017, trend: 0.0003 },
  { symbol: 'AMZN',  name: 'Amazon',     color: '#ff9900', base2026: 225,  vol: 0.019, trend: 0.0005 },
  { symbol: 'TSLA',  name: 'Tesla',      color: '#cc0000', base2026: 345,  vol: 0.042, trend: 0.0006 },
  { symbol: 'META',  name: 'Meta',       color: '#0866ff', base2026: 610,  vol: 0.022, trend: 0.0005 },
  { symbol: 'NFLX',  name: 'Netflix',    color: '#e50914', base2026: 1050, vol: 0.021, trend: 0.0004 },
  { symbol: 'BRK.B', name: 'Berkshire',  color: '#8b6914', base2026: 480,  vol: 0.011, trend: 0.0002 },
  { symbol: 'JPM',   name: 'JPMorgan',   color: '#005eb8', base2026: 262,  vol: 0.015, trend: 0.0003 },
  { symbol: 'AMD',   name: 'AMD',        color: '#ed1c24', base2026: 112,  vol: 0.038, trend: 0.0005 },
  { symbol: 'PLTR',  name: 'Palantir',   color: '#7c3aed', base2026: 92,   vol: 0.045, trend: 0.001  },
];

const RANGES = [
  { label: '1D',  days: 1,   points: 78,  stepMs: 5 * 60 * 1000 },
  { label: '1W',  days: 7,   points: 7 * 7, stepMs: 60 * 60 * 1000 },
  { label: '1M',  days: 30,  points: 30,  stepMs: 24 * 60 * 60 * 1000 },
  { label: '6M',  days: 180, points: 180, stepMs: 24 * 60 * 60 * 1000 },
  { label: '1Y',  days: 365, points: 52,  stepMs: 7 * 24 * 60 * 60 * 1000 },
];

// Deterministic seeded random (mulberry32)
function seededRand(seed) {
  let t = seed + 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// Generate a realistic price walk anchored to base2026, going BACKWARDS from now
function generatePriceHistory(stock, range) {
  const { base2026, vol, trend, symbol } = stock;
  const now = new Date('2026-06-02T16:00:00');
  const totalMs = range.days * 24 * 60 * 60 * 1000;
  const start = new Date(now - totalMs);

  const points = [];
  let price = base2026;
  const n = range.points;

  // Walk backwards: compute starting price then walk forward
  let seedBase = 0;
  for (let c = 0; c < symbol.length; c++) seedBase += symbol.charCodeAt(c) * (c + 1);

  // Reverse-simulate to find starting price
  const reverseSteps = n;
  let startPrice = base2026;
  for (let i = 0; i < reverseSteps; i++) {
    const r1 = seededRand(seedBase + i * 3);
    const r2 = seededRand(seedBase + i * 3 + 1);
    const z = Math.sqrt(-2 * Math.log(Math.max(r1, 1e-10))) * Math.cos(2 * Math.PI * r2);
    startPrice = startPrice / Math.exp((trend - 0.5 * vol * vol) + vol * z);
  }
  startPrice = Math.max(startPrice, 1);

  price = startPrice;
  for (let i = 0; i <= n; i++) {
    const t = new Date(start.getTime() + (i / n) * totalMs);
    const r1 = seededRand(seedBase + i * 3 + 1000);
    const r2 = seededRand(seedBase + i * 3 + 1001);
    const z = Math.sqrt(-2 * Math.log(Math.max(r1, 1e-10))) * Math.cos(2 * Math.PI * r2);
    price = price * Math.exp((trend - 0.5 * vol * vol) + vol * z);
    price = Math.max(price, 1);

    let label;
    if (range.days === 1) label = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    else if (range.days <= 7) label = t.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    else if (range.days <= 30) label = t.toLocaleDateString([], { month: 'short', day: 'numeric' });
    else label = t.toLocaleDateString([], { month: 'short', day: 'numeric' });

    points.push({ time: label, price: parseFloat(price.toFixed(2)), raw: t });
  }

  // Force last point to base2026
  points[points.length - 1].price = base2026;

  return points;
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-muted-foreground">{payload[0]?.payload?.time}</p>
        <p className="font-mono font-bold text-sm">${payload[0]?.value?.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

function StockPanel({ stock, rangeIndex }) {
  const range = RANGES[rangeIndex];
  const data = useMemo(() => generatePriceHistory(stock, range), [stock.symbol, rangeIndex]);

  const first = data[0]?.price;
  const last = data[data.length - 1]?.price;
  const change = last - first;
  const changePct = ((change / first) * 100);
  const isUp = change >= 0;
  const lineColor = isUp ? '#22c55e' : '#ef4444';
  const minP = Math.min(...data.map(p => p.price));
  const maxP = Math.max(...data.map(p => p.price));
  const pad = (maxP - minP) * 0.15 || 1;

  const tickInterval = Math.max(1, Math.floor(data.length / 5));

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3 hover:border-border/80 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-base" style={{ color: stock.color }}>{stock.symbol}</span>
            <span className="text-xs text-muted-foreground">{stock.name}</span>
          </div>
          <p className="font-mono font-bold text-xl">${last.toFixed(2)}</p>
        </div>
        <div className={`flex items-center gap-1 text-xs font-mono font-semibold px-2 py-1 rounded-full ${isUp ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isUp ? '+' : ''}{changePct.toFixed(2)}%
        </div>
      </div>

      <div className="h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 4, left: 0, bottom: 2 }}>
            <defs>
              <linearGradient id={`grad-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide interval={tickInterval} />
            <YAxis domain={[minP - pad, maxP + pad]} hide />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={first} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.3} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={lineColor}
              strokeWidth={1.5}
              fill={`url(#grad-${stock.symbol})`}
              dot={false}
              activeDot={{ r: 3, fill: lineColor, stroke: 'hsl(var(--card))', strokeWidth: 1.5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Open', value: `$${first.toFixed(2)}` },
          { label: 'High', value: `$${maxP.toFixed(2)}` },
          { label: 'Low',  value: `$${minP.toFixed(2)}` },
        ].map(s => (
          <div key={s.label} className="bg-muted/40 rounded-lg py-1.5">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
            <p className="font-mono text-xs font-semibold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RealMarket() {
  const [rangeIndex, setRangeIndex] = useState(2);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-lg">Real Stock Market</h2>
          <p className="text-xs text-muted-foreground">Simulated 2026 prices based on real-world market data</p>
        </div>
        <div className="flex gap-1">
          {RANGES.map((r, i) => (
            <button
              key={r.label}
              onClick={() => setRangeIndex(i)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                i === rangeIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {STOCKS.map(stock => (
          <StockPanel key={stock.symbol} stock={stock} rangeIndex={rangeIndex} />
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Prices are estimated simulations anchored to real 2026 market data · For entertainment only
      </p>
    </div>
  );
}