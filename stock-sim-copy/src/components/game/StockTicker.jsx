import { motion } from 'framer-motion';
import { formatCurrency, formatPercent, getPriceChangeColor } from '@/lib/stockUtils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StockTicker({ stocks, theme }) {
  const borderColor = theme?.primaryBorder || 'rgba(34,197,94,0.25)';
  const bg = theme?.primaryMuted || 'rgba(34,197,94,0.06)';
  return (
    <div className="overflow-hidden border-y py-2" style={{ borderColor, background: bg }}>
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {[...stocks, ...stocks].map((stock, i) => (
          <div key={`${stock.symbol}-${i}`} className="flex items-center gap-2 text-sm">
            <span className="font-mono font-semibold" style={{ color: stock.color }}>
              {stock.symbol}
            </span>
            <span className="font-mono text-foreground">
              {formatCurrency(stock.price)}
            </span>
            <span className={`flex items-center gap-0.5 font-mono text-xs ${getPriceChangeColor(stock.change)}`}>
              {stock.change > 0 ? <TrendingUp className="w-3 h-3" /> : stock.change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {formatPercent(stock.changePercent)}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}