import { motion } from 'framer-motion';
import { formatPercent } from '@/lib/stockUtils';

export default function MarketHeatmap({ stocks }) {
  if (!stocks?.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest">Market Heatmap</p>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5">
        {stocks.map((stock) => {
          const pct = stock.changePercent || 0;
          const isUp = pct >= 0;
          const intensity = Math.min(Math.abs(pct) / 5, 1); // 5% = full saturation

          const bg = isUp
            ? `rgba(34, 197, 94, ${0.12 + intensity * 0.55})`
            : `rgba(239, 68, 68, ${0.12 + intensity * 0.55})`;
          const border = isUp
            ? `rgba(34, 197, 94, ${0.25 + intensity * 0.5})`
            : `rgba(239, 68, 68, ${0.25 + intensity * 0.5})`;
          const textColor = isUp
            ? `rgb(${Math.round(134 - intensity * 60)}, ${Math.round(239 - intensity * 30)}, ${Math.round(172 - intensity * 60)})`
            : `rgb(${Math.round(252 - intensity * 30)}, ${Math.round(165 - intensity * 80)}, ${Math.round(165 - intensity * 80)})`;

          return (
            <motion.div
              key={stock.symbol}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg p-2 flex flex-col items-center justify-center text-center cursor-default select-none"
              style={{ background: bg, border: `1px solid ${border}`, minHeight: '56px' }}
              title={`${stock.name} — ${formatPercent(pct)}`}
            >
              <span className="font-mono font-bold text-[10px] leading-tight truncate w-full text-center" style={{ color: stock.color }}>
                {stock.symbol}
              </span>
              <span className="font-mono font-semibold text-[10px] mt-0.5" style={{ color: textColor }}>
                {pct >= 0 ? '+' : ''}{formatPercent(pct)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}