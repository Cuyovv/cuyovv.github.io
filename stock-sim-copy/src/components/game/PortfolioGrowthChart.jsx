import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatCurrency } from '@/lib/stockUtils';
import { format, subDays } from 'date-fns';

const START_VALUE = 10000;

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const diff = val - START_VALUE;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="font-mono font-bold text-foreground">{formatCurrency(val)}</p>
      <p className={`font-mono mt-0.5 ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
      </p>
      <p className="text-muted-foreground mt-0.5">{payload[0].payload.label}</p>
    </div>
  );
}

export default function PortfolioGrowthChart({ portfolio, stocks, theme }) {
  const queryClient = useQueryClient();
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Calculate current total value
  const holdings = portfolio?.holdings || [];
  const holdingsValue = holdings.reduce((sum, h) => {
    const stock = stocks.find(s => s.symbol === h.stock_symbol);
    return sum + (stock ? stock.price * h.shares : 0);
  }, 0);
  const currentTotal = parseFloat(((portfolio?.cash_balance || 0) + holdingsValue).toFixed(2));

  // Fetch snapshots for the last 7 days
  const { data: snapshots = [] } = useQuery({
    queryKey: ['portfolio-snapshots'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.PortfolioSnapshot.filter({ created_by_id: user.id });
    },
    refetchInterval: 60000,
  });

  // Write/update today's snapshot whenever total value changes
  useEffect(() => {
    if (!portfolio || stocks.length === 0) return;
    const existing = snapshots.find(s => s.snapshot_date === todayStr);
    if (existing) {
      if (Math.abs(existing.total_value - currentTotal) > 0.01) {
        base44.entities.PortfolioSnapshot.update(existing.id, { total_value: currentTotal });
        queryClient.invalidateQueries({ queryKey: ['portfolio-snapshots'] });
      }
    } else if (snapshots.length > 0 || currentTotal !== START_VALUE) {
      base44.entities.PortfolioSnapshot.create({ total_value: currentTotal, snapshot_date: todayStr });
      queryClient.invalidateQueries({ queryKey: ['portfolio-snapshots'] });
    }
  }, [currentTotal, todayStr]);

  // Build a 7-day series, filling missing days from last known value
  const chartData = (() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return { dateStr: format(d, 'yyyy-MM-dd'), label: format(d, 'MMM d') };
    });

    let lastKnown = START_VALUE;
    return days.map(({ dateStr, label }) => {
      const snap = snapshots.find(s => s.snapshot_date === dateStr);
      if (snap) lastKnown = snap.total_value;
      return { label, value: lastKnown };
    });
  })();

  const allValues = chartData.map(d => d.value);
  const minVal = Math.min(...allValues, START_VALUE);
  const maxVal = Math.max(...allValues, START_VALUE);
  const padding = (maxVal - minVal) * 0.15 || 500;
  const isUp = currentTotal >= START_VALUE;

  return (
    <div className="rounded-xl border p-4" style={{ borderColor: theme?.primaryBorder, background: theme?.cardBg || 'hsl(var(--card))' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Portfolio Value — Last 7 Days</h3>
          <p className="text-xs text-muted-foreground mt-0.5">vs. $10,000 starting balance</p>
        </div>
        <div className="text-right">
          <p className="font-mono font-bold text-base" style={{ color: theme?.primary }}>{formatCurrency(currentTotal)}</p>
          <p className={`text-xs font-mono ${isUp ? 'text-green-400' : 'text-red-400'}`}>
            {isUp ? '+' : ''}{formatCurrency(currentTotal - START_VALUE)} all time
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="pgGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isUp ? '#22c55e' : '#ef4444'} stopOpacity={0.25} />
              <stop offset="95%" stopColor={isUp ? '#22c55e' : '#ef4444'} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
          <YAxis domain={[minVal - padding, maxVal + padding]} hide />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={START_VALUE} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeOpacity={0.4} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={isUp ? '#22c55e' : '#ef4444'}
            strokeWidth={2}
            fill="url(#pgGradient)"
            dot={false}
            activeDot={{ r: 4, fill: isUp ? '#22c55e' : '#ef4444' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}