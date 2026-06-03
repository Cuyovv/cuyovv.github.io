import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Star, Lock, Zap, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, PRESTIGE_COST, PRESTIGE_UNLOCK_COST, STOCK_DEFINITIONS } from '@/lib/stockUtils';
import StockCard from './StockCard';

const PRESTIGE_BADGE_LABELS = ['', '⭐', '⭐⭐', '⭐⭐⭐', '🌟', '💫'];

export default function PrestigePanel({ portfolio, stocks, onTrade, onUnlock, theme }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const totalValue = (portfolio?.total_value || 0);
  const prestigeLevel = portfolio?.prestige_level || 0;
  const canPrestige = totalValue >= PRESTIGE_COST;
  const hasPrestiged = prestigeLevel > 0;

  const prestigeStocks = stocks.filter(s => s.tier === 'prestige');
  const unlockedSymbols = portfolio?.unlocked_stocks || [];
  const holdings = portfolio?.holdings || [];

  const handlePrestige = async () => {
    if (!canPrestige || loading) return;
    setLoading(true);
    try {
      const newLevel = prestigeLevel + 1;
      await base44.entities.Portfolio.update(portfolio.id, {
        cash_balance: 10000,
        holdings: [],
        unlocked_stocks: [],
        total_value: 10000,
        prestige_level: newLevel,
      });
      queryClient.invalidateQueries({ queryKey: ['my-portfolio'] });

      // Post activity event
      base44.entities.ActivityEvent.create({
        player_name: portfolio.player_name || 'Anonymous',
        event_type: 'prestige',
        message: `reached Prestige Level ${newLevel}! 🏆`,
        theme: portfolio.theme || 'emerald',
      });

      toast.success(`⭐ Prestige ${newLevel} Achieved!`, {
        description: 'Portfolio reset to $10,000. Prestige stocks are now available!',
      });
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Prestige Status */}
      <Card className="p-5 border" style={{ borderColor: '#a855f755', background: 'hsl(var(--card))' }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.4)' }}>
            <Star className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-display font-bold text-lg">Prestige System</h2>
              {prestigeLevel > 0 && (
                <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                  {PRESTIGE_BADGE_LABELS[Math.min(prestigeLevel, 5)]} Level {prestigeLevel}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Reach <span className="text-purple-300 font-semibold">{formatCurrency(PRESTIGE_COST)}</span> total net worth to prestige.
              Your portfolio resets to $10,000, but you unlock exclusive <span className="text-purple-300 font-semibold">Prestige Stocks</span>.
            </p>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Net Worth</span>
                <span className="font-mono">{formatCurrency(totalValue)} / {formatCurrency(PRESTIGE_COST)}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (totalValue / PRESTIGE_COST) * 100)}%`,
                    background: canPrestige ? '#a855f7' : 'linear-gradient(90deg, #6366f1, #a855f7)',
                  }}
                />
              </div>
            </div>

            {/* Action */}
            <div className="mt-4">
              {!confirming ? (
                <Button
                  disabled={!canPrestige}
                  onClick={() => setConfirming(true)}
                  className="gap-2"
                  style={canPrestige ? { background: '#a855f7', color: '#fff' } : {}}
                >
                  <Zap className="w-4 h-4" />
                  {canPrestige ? 'Prestige Now' : `Need ${formatCurrency(PRESTIGE_COST - totalValue)} more`}
                </Button>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <p className="text-xs text-yellow-300 flex-1">This will reset your cash and all holdings to $10,000. Are you sure?</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setConfirming(false)}>Cancel</Button>
                    <Button size="sm" className="text-xs h-7 bg-purple-600 hover:bg-purple-500 text-white" onClick={handlePrestige} disabled={loading}>
                      {loading ? 'Prestiging...' : 'Confirm'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Prestige Stocks */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-display font-bold text-base">⭐ Prestige Stocks</h3>
          {hasPrestiged ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>
              {formatCurrency(PRESTIGE_UNLOCK_COST)} to unlock each
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full text-muted-foreground bg-muted">
              Prestige to unlock
            </span>
          )}
        </div>
        {!hasPrestiged ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {prestigeStocks.map(stock => (
              <Card key={stock.symbol} className="p-4 opacity-50 relative overflow-hidden" style={{ borderColor: 'rgba(168,85,247,0.2)' }}>
                <div className="absolute inset-0 bg-background/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-1">
                  <Lock className="w-6 h-6 text-purple-400" />
                  <p className="text-xs text-purple-300 font-medium">Prestige Required</p>
                </div>
                <div className="font-mono font-bold" style={{ color: stock.color }}>{stock.symbol}</div>
                <div className="text-xs text-muted-foreground">{stock.name}</div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {prestigeStocks.map(stock => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                isUnlocked={unlockedSymbols.includes(stock.symbol)}
                onTrade={onTrade}
                onUnlock={onUnlock}
                onChart={() => {}}
                holdings={holdings.find(h => h.stock_symbol === stock.symbol)}
                theme={theme}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}