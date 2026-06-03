import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, TrendingUp, TrendingDown, Minus, LineChart } from 'lucide-react';
import { formatCurrency, formatPercent, getPriceChangeColor, getPriceChangeBg, PLATINUM_UNLOCK_COST, PRESTIGE_UNLOCK_COST } from '@/lib/stockUtils';

export default function StockCard({ stock, isUnlocked, onTrade, onUnlock, onChart, holdings, theme }) {
  const locked = (stock.tier === 'premium' || stock.tier === 'platinum' || stock.tier === 'prestige') && !isUnlocked;
  const isPlatinum = stock.tier === 'platinum';
  const isPrestige = stock.tier === 'prestige';
  const sharesOwned = holdings?.shares || 0;
  const avgPrice = holdings?.avg_buy_price || 0;
  const holdingValue = sharesOwned * stock.price;
  const holdingPnL = sharesOwned > 0 ? (stock.price - avgPrice) * sharesOwned : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`relative overflow-hidden p-4 transition-all duration-300 ${locked ? 'opacity-60' : ''}`}
        style={{ borderColor: theme?.primaryBorder, background: theme?.cardBg }}
      >
        {locked && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2">
            <Lock className="w-8 h-8" style={{ color: isPrestige ? '#c084fc' : isPlatinum ? '#e5e4e2' : 'hsl(var(--muted-foreground))' }} />
            <p className="text-sm font-medium" style={{ color: isPrestige ? '#c084fc' : isPlatinum ? '#e5e4e2' : 'hsl(var(--muted-foreground))' }}>
              {isPrestige ? '⭐ Prestige Stock' : isPlatinum ? '💎 Platinum Stock' : 'Premium Stock'}
            </p>
            <Button size="sm" variant="outline" onClick={() => onUnlock(stock.symbol)}
              className="text-xs"
              style={isPrestige ? { borderColor: '#a855f7', color: '#c084fc' } : isPlatinum ? { borderColor: '#d4af37', color: '#d4af37' } : {}}
            >
              Unlock for {isPrestige ? formatCurrency(PRESTIGE_UNLOCK_COST) : isPlatinum ? '$25,000' : '$5,000'}
            </Button>
          </div>
        )}

        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg" style={{ color: stock.color }}>
                {stock.symbol}
              </span>
              {stock.tier === 'premium' && isUnlocked && (
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">PRO</Badge>
              )}
              {stock.tier === 'platinum' && isUnlocked && (
                <Badge variant="outline" className="text-[10px]" style={{ borderColor: '#d4af37', color: '#d4af37' }}>💎 PLAT</Badge>
              )}
              {stock.tier === 'prestige' && isUnlocked && (
                <Badge variant="outline" className="text-[10px]" style={{ borderColor: '#a855f7', color: '#c084fc' }}>⭐ PREST</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{stock.name}</p>
            <p className="text-[10px] text-muted-foreground/60">{stock.sector}</p>
          </div>
          <div className="text-right">
            <p className="font-mono font-bold text-lg">{formatCurrency(stock.price)}</p>
            <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-mono border ${getPriceChangeBg(stock.change)}`}>
              {stock.change > 0 ? <TrendingUp className="w-3 h-3" /> : stock.change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              <span className={getPriceChangeColor(stock.change)}>
                {formatPercent(stock.changePercent)}
              </span>
            </div>
            {stock.recentChanges?.length > 0 && (
              <div className="flex items-center justify-end gap-1 mt-1">
                {stock.recentChanges.map((chg, i) => (
                  <span
                    key={i}
                    className={`text-[9px] font-mono px-1 py-0.5 rounded ${chg > 0 ? 'text-green-400 bg-green-500/10' : chg < 0 ? 'text-red-400 bg-red-500/10' : 'text-muted-foreground bg-muted/40'}`}
                    title={`${i === 0 ? 'Last' : i === 1 ? '2 updates ago' : '3 updates ago'}`}
                  >
                    {chg > 0 ? '+' : ''}{chg.toFixed(2)}%
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {sharesOwned > 0 && (
          <div className="bg-muted/50 rounded-lg p-2 mb-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shares</span>
              <span className="font-mono font-medium">{sharesOwned}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-muted-foreground">Value</span>
              <span className="font-mono font-medium">{formatCurrency(holdingValue)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-muted-foreground">P&L</span>
              <span className={`font-mono font-medium ${getPriceChangeColor(holdingPnL)}`}>
                {formatCurrency(holdingPnL)}
              </span>
            </div>
          </div>
        )}

        {!locked && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 text-white text-xs h-8"
              style={{ background: theme?.primary || '#22c55e' }}
              onClick={() => onTrade(stock, 'buy')}
            >
              Buy
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-8"
              onClick={() => onTrade(stock, 'sell')}
              disabled={sharesOwned === 0}
            >
              Sell
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => onChart(stock)}
              title="View chart"
            >
              <LineChart className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}