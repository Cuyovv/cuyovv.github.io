import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { formatCurrency } from '@/lib/stockUtils';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Must match the algorithm in useStockEngine.js exactly
function symbolSeed(symbol) {
  let h = 0x811c9dc5;
  for (let i = 0; i < symbol.length; i++) {
    h ^= symbol.charCodeAt(i);
    h = (h * 0x01000193) & 0xffffffff;
  }
  return Math.abs(h);
}

function rand(seed) {
  seed = ((seed >>> 16) ^ seed) * 0x45d9f3b;
  seed = ((seed >>> 16) ^ seed) * 0x45d9f3b;
  seed = (seed >>> 16) ^ seed;
  return (seed & 0x7fffffff) / 0x7fffffff;
}

function computeStockPrice(basePrice, symbol, epochInterval) {
  const sym = symbolSeed(symbol);
  const perStockVol = 0.12 + (sym % 100) / 100 * 0.18;

  const r1 = rand((sym ^ (epochInterval * 2654435761)) & 0x7fffffff);
  const r2 = rand((sym ^ (epochInterval * 2246822519)) & 0x7fffffff);
  const r3 = rand((sym ^ (Math.floor(epochInterval / 3) * 3266489917)) & 0x7fffffff);
  const r4 = rand((sym ^ (Math.floor(epochInterval / 7) * 668265263)) & 0x7fffffff);
  const r5 = rand((sym ^ (Math.floor(epochInterval / 17) * 1234567891)) & 0x7fffffff);

  const u1 = Math.max(1e-10, r1);
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * r2);
  const volMultiplier = r4 < 0.06 ? 3.0 : r4 < 0.18 ? 1.6 : 1.0;
  const trend = (r3 - 0.5) * perStockVol * 2.5;
  const macro = (r5 - 0.5) * perStockVol * 1.5;

  const deviation = (z * perStockVol * volMultiplier + trend + macro) * basePrice;
  return Math.max(1, basePrice + deviation);
}

const RANGES = [
  { label: '20m', intervals: 40, stepSize: 1 },
  { label: '1h',  intervals: 120, stepSize: 3 },
  { label: '3h',  intervals: 360, stepSize: 9 },
  { label: '6h',  intervals: 720, stepSize: 18 },
];

function generateHistory(basePrice, symbol, intervals, stepSize) {
  const currentInterval = Math.floor(Date.now() / 30000);
  const points = [];

  for (let i = intervals; i >= 0; i -= stepSize) {
    const interval = currentInterval - i;
    const price = computeStockPrice(basePrice, symbol, interval);

    const secondsAgo = i * 30;
    let label;
    if (secondsAgo === 0) label = 'Now';
    else if (secondsAgo < 60) label = `${secondsAgo}s`;
    else if (secondsAgo < 3600) label = `${Math.round(secondsAgo / 60)}m`;
    else label = `${(secondsAgo / 3600).toFixed(1)}h`;

    points.push({ time: label, price: parseFloat(price.toFixed(2)) });
  }

  return points;
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-muted-foreground">{payload[0]?.payload?.time}</p>
        <p className="font-mono font-bold text-sm">{formatCurrency(payload[0]?.value)}</p>
      </div>
    );
  }
  return null;
};

export default function StockChart({ open, onClose, stock }) {
  const [rangeIndex, setRangeIndex] = useState(0);
  const range = RANGES[rangeIndex];

  const data = useMemo(() => {
    if (!stock) return [];
    return generateHistory(stock.basePrice, stock.symbol, range.intervals, range.stepSize);
  }, [stock?.symbol, range, Math.floor(Date.now() / 30000)]);

  if (!stock) return null;

  const first = data[0]?.price || 0;
  const last = data[data.length - 1]?.price || 0;
  const change = last - first;
  const changePercent = ((change / first) * 100).toFixed(2);
  const isUp = change >= 0;
  const lineColor = isUp ? '#22c55e' : '#ef4444';
  const fillColor = isUp ? '#22c55e20' : '#ef444420';
  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));
  const padding = (maxPrice - minPrice) * 0.15 || 1;

  const tickInterval = Math.floor(data.length / 6);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono font-black text-xl" style={{ color: stock.color }}>
              {stock.symbol}
            </span>
            <span className="text-muted-foreground font-normal text-base">{stock.name}</span>
            <div className={`ml-auto flex items-center gap-1 text-sm font-mono ${isUp ? 'text-green-400' : 'text-red-400'}`}>
              {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isUp ? '+' : ''}{changePercent}%
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-3">
              <span className="font-mono font-black text-3xl">{formatCurrency(last)}</span>
              <span className={`font-mono text-sm mb-1 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                {isUp ? '+' : ''}{formatCurrency(change)}
              </span>
            </div>
            {/* Range selector */}
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

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={lineColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  interval={tickInterval}
                />
                <YAxis
                  domain={[minPrice - padding, maxPrice + padding]}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v.toFixed(0)}`}
                  width={55}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={first} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" opacity={0.35} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={lineColor}
                  strokeWidth={2}
                  fill="url(#priceGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: lineColor, stroke: 'hsl(var(--card))', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { label: 'Open', value: formatCurrency(first) },
              { label: 'High', value: formatCurrency(maxPrice) },
              { label: 'Low', value: formatCurrency(minPrice) },
              { label: 'Vol', value: `${(((maxPrice - minPrice) / first) * 100).toFixed(1)}%` },
            ].map(stat => (
              <div key={stat.label} className="bg-muted/50 rounded-lg p-2">
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                <p className="font-mono font-semibold text-sm">{stat.value}</p>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-muted-foreground text-center">
            Updates every 30s · {range.label} view · {data.length} data points
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}