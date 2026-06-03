import { formatCurrency, getPriceChangeColor } from '@/lib/stockUtils';
import { Wallet, TrendingUp, BarChart3, Clock, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function PortfolioHeader({ portfolio, stocks, countdown, theme, onReset }) {
  const [showResetMsg, setShowResetMsg] = useState(false);
  const holdings = portfolio?.holdings || [];
  
  const holdingsValue = holdings.reduce((sum, h) => {
    const stock = stocks.find(s => s.symbol === h.stock_symbol);
    return sum + (stock ? stock.price * h.shares : 0);
  }, 0);

  const totalValue = (portfolio?.cash_balance || 10000) + holdingsValue;
  const totalPnL = totalValue - 10000;
  const totalPnLPercent = ((totalValue - 10000) / 10000) * 100;

  const stats = [
    { label: 'Total Value', value: formatCurrency(totalValue), icon: BarChart3, color: 'text-primary', themeColor: true },
    { label: 'Cash', value: formatCurrency(portfolio?.cash_balance || 10000), icon: Wallet, color: 'text-blue-400' },
    { label: 'Holdings', value: formatCurrency(holdingsValue), icon: TrendingUp, color: 'text-purple-400' },
    { label: 'Total P&L', value: formatCurrency(totalPnL), icon: TrendingUp, color: getPriceChangeColor(totalPnL) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight">
            STOCK<span style={{ color: theme?.primary }}>SIM</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">{theme?.label ? `${theme.label} Account` : 'Simulated Trading Game'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10"
            onClick={() => { onReset(); setShowResetMsg(true); setTimeout(() => setShowResetMsg(false), 5000); }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
          <div className="flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: theme?.primaryMuted, border: `1px solid ${theme?.primaryBorder}` }}>
            <Clock className="w-3.5 h-3.5 animate-pulse" style={{ color: theme?.primary }} />
            <span className="font-mono text-sm font-medium">{countdown}s</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showResetMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300"
          >
            <span className="font-semibold text-red-400">⚖️ Balance Patch Applied.</span>{' '}
            Yeah, we noticed. Making money was <em>way</em> too easy — so we wiped your gains and reset you back to $10,000. The market gods demand sacrifice. Get back to work.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl p-3 border"
            style={{ background: theme?.cardBg || 'hsl(var(--card))', borderColor: theme?.primaryBorder || 'hsl(var(--border))', boxShadow: i === 0 ? theme?.glow : undefined }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <stat.icon className={`w-3.5 h-3.5 ${stat.themeColor ? '' : stat.color}`} style={stat.themeColor ? { color: theme?.primary } : {}} />
              <span className="text-[11px] text-muted-foreground">{stat.label}</span>
            </div>
            <p className={`font-mono font-bold text-sm md:text-base ${stat.themeColor ? '' : stat.color}`} style={stat.themeColor ? { color: theme?.primary } : {}}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}