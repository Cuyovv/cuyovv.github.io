import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { BarChart3, Trophy, ScrollText, Globe, ShoppingBag, Star, Medal } from 'lucide-react';
import { useStockEngine } from '@/lib/useStockEngine';
import { formatCurrency, UNLOCK_COST, PLATINUM_UNLOCK_COST, PRESTIGE_UNLOCK_COST } from '@/lib/stockUtils';
import { assignThemeForUser, getTheme } from '@/lib/themes';

import PortfolioHeader from '@/components/game/PortfolioHeader';
import StockTicker from '@/components/game/StockTicker';
import MarketGrid from '@/components/game/MarketGrid';
import TradeDialog from '@/components/game/TradeDialog';
import Leaderboard from '@/components/game/Leaderboard';
import TradeLog from '@/components/game/TradeLog';
import RealMarket from '@/components/game/RealMarket';
import MarketHeatmap from '@/components/game/MarketHeatmap';
import Shop from '@/components/game/Shop';
import StockChart from '@/components/game/StockChart';
import LiveChat from '@/components/game/LiveChat';
import PrestigePanel from '@/components/game/PrestigePanel';
import MandatoryResetOverlay from '@/components/game/MandatoryResetOverlay';
import PortfolioGrowthChart from '@/components/game/PortfolioGrowthChart';
import Achievements from '@/components/game/Achievements';
import { buildAchievementState, getNewAchievements } from '@/lib/achievements';
import MatrixRain from '@/components/game/backgrounds/MatrixRain';
import NebulaBg from '@/components/game/backgrounds/NebulaBg';
import CircuitBg from '@/components/game/backgrounds/CircuitBg';
import AuroraBg from '@/components/game/backgrounds/AuroraBg';

export default function Dashboard() {
  const { stocks, loading: stocksLoading, countdown } = useStockEngine();
  const [tradeDialog, setTradeDialog] = useState({ open: false, symbol: null, action: 'buy' });
  const [chartStock, setChartStock] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showMandatoryReset, setShowMandatoryReset] = useState(false);
  const queryClient = useQueryClient();

  // Get current user and check mandatory reset cookie
  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUserId(user.id);
      setCurrentUser(user);
      const cookieKey = `balance_patch_reset_${user.id}`;
      const alreadyReset = document.cookie.split(';').some(c => c.trim().startsWith(`${cookieKey}=true`));
      if (!alreadyReset) {
        setShowMandatoryReset(true);
      }
    });
  }, []);

  // Fetch or create portfolio
  const { data: portfolios = [], isLoading: portfolioLoading } = useQuery({
    queryKey: ['my-portfolio'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const existing = await base44.entities.Portfolio.filter({ created_by_id: user.id });
      if (existing.length === 0) {
        const assignedTheme = assignThemeForUser(user.id);
        const newPortfolio = await base44.entities.Portfolio.create({
          cash_balance: 10000,
          holdings: [],
          unlocked_stocks: [],
          total_value: 10000,
          player_name: user.full_name || 'Anonymous Trader',
          theme: assignedTheme,
        });
        return [newPortfolio];
      }
      return existing;
    },
  });

  const portfolio = portfolios[0];
  const themeKey = portfolio?.theme || (currentUserId ? assignThemeForUser(currentUserId) : 'emerald');
  const theme = getTheme(themeKey);

  // Achievement checker — runs after portfolio or stocks update
  const { data: trades = [] } = useQuery({
    queryKey: ['trade-history'],
    queryFn: () => base44.entities.TradeHistory.list('-created_date', 200),
  });

  useEffect(() => {
    if (!portfolio || stocks.length === 0) return;
    const state = buildAchievementState(portfolio, stocks, trades.length);
    const earnedIds = portfolio.achievement_ids || [];
    const newOnes = getNewAchievements(state, earnedIds);
    if (newOnes.length === 0) return;

    const updatedIds = [...earnedIds, ...newOnes.map(a => a.id)];
    base44.entities.Portfolio.update(portfolio.id, { achievement_ids: updatedIds });
    queryClient.invalidateQueries({ queryKey: ['my-portfolio'] });

    newOnes.forEach(ach => {
      toast.success(ach.label, { description: ach.description, icon: '🏆' });
      base44.entities.ActivityEvent.create({
        player_name: portfolio.player_name || 'Anonymous',
        event_type: 'achievement',
        message: `unlocked the achievement: ${ach.label}`,
        theme: portfolio.theme || 'emerald',
      });
    });
  }, [portfolio?.total_value, portfolio?.holdings?.length, trades.length, portfolio?.prestige_level, portfolio?.owned_items?.length]);

  // Update total value whenever stocks change
  useEffect(() => {
    if (!portfolio || stocks.length === 0) return;
    const holdingsValue = (portfolio.holdings || []).reduce((sum, h) => {
      const stock = stocks.find(s => s.symbol === h.stock_symbol);
      return sum + (stock ? stock.price * h.shares : 0);
    }, 0);
    const totalValue = (portfolio.cash_balance || 0) + holdingsValue;
    
    if (Math.abs(totalValue - (portfolio.total_value || 0)) > 0.01) {
      base44.entities.Portfolio.update(portfolio.id, { total_value: parseFloat(totalValue.toFixed(2)) });
    }
  }, [stocks, portfolio]);

  const executeTrade = useCallback(async (stock, action, shares) => {
    if (!portfolio) return;

    const totalCost = shares * stock.price;
    const currentHoldings = [...(portfolio.holdings || [])];
    const holdingIndex = currentHoldings.findIndex(h => h.stock_symbol === stock.symbol);

    if (action === 'buy') {
      if (totalCost > portfolio.cash_balance) {
        toast.error('Insufficient funds', { description: "You don't have enough cash for this trade." });
        return;
      }

      if (holdingIndex >= 0) {
        const existing = currentHoldings[holdingIndex];
        const totalShares = existing.shares + shares;
        const totalInvested = (existing.shares * existing.avg_buy_price) + totalCost;
        currentHoldings[holdingIndex] = {
          ...existing,
          shares: totalShares,
          avg_buy_price: parseFloat((totalInvested / totalShares).toFixed(2)),
        };
      } else {
        currentHoldings.push({
          stock_symbol: stock.symbol,
          shares: shares,
          avg_buy_price: stock.price,
        });
      }

      await base44.entities.Portfolio.update(portfolio.id, {
        cash_balance: parseFloat((portfolio.cash_balance - totalCost).toFixed(2)),
        holdings: currentHoldings,
      });

    } else {
      if (holdingIndex < 0 || currentHoldings[holdingIndex].shares < shares) {
        toast.error('Insufficient shares', { description: "You don't own enough shares." });
        return;
      }

      const remaining = currentHoldings[holdingIndex].shares - shares;
      if (remaining === 0) {
        currentHoldings.splice(holdingIndex, 1);
      } else {
        currentHoldings[holdingIndex] = { ...currentHoldings[holdingIndex], shares: remaining };
      }

      await base44.entities.Portfolio.update(portfolio.id, {
        cash_balance: parseFloat((portfolio.cash_balance + totalCost).toFixed(2)),
        holdings: currentHoldings,
      });
    }

    // Log trade
    await base44.entities.TradeHistory.create({
      stock_symbol: stock.symbol,
      action,
      shares,
      price_per_share: stock.price,
      total_amount: totalCost,
    });

    queryClient.invalidateQueries({ queryKey: ['my-portfolio'] });
    queryClient.invalidateQueries({ queryKey: ['trade-history'] });
    queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    setTradeDialog({ open: false, symbol: null, action: 'buy' });

    toast.success(`${action === 'buy' ? 'Bought' : 'Sold'} ${shares} ${stock.symbol}`, {
      description: `${action === 'buy' ? 'Spent' : 'Received'} ${formatCurrency(totalCost)}`,
    });

    // Post activity event for massive trades (>= $10,000)
    if (totalCost >= 10000 && portfolio?.player_name) {
      base44.entities.ActivityEvent.create({
        player_name: portfolio.player_name,
        event_type: 'big_trade',
        message: `${action === 'buy' ? 'bought' : 'sold'} ${shares} shares of ${stock.symbol} for ${formatCurrency(totalCost)}! 💸`,
        theme: portfolio.theme || 'emerald',
      });
    }
  }, [portfolio, queryClient]);

  const handleReset = useCallback(async () => {
    if (!portfolio) return;
    await base44.entities.Portfolio.update(portfolio.id, {
      cash_balance: 10000,
      holdings: [],
      total_value: 10000,
    });
    queryClient.invalidateQueries({ queryKey: ['my-portfolio'] });
    toast.success('Portfolio Reset', { description: 'Cash balance reset to $10,000.' });
  }, [portfolio, queryClient]);

  const handleUnlock = useCallback(async (symbol) => {
    if (!portfolio) return;
    const stockDef = stocks.find(s => s.symbol === symbol);
    const cost = stockDef?.tier === 'platinum' ? PLATINUM_UNLOCK_COST
      : stockDef?.tier === 'prestige' ? PRESTIGE_UNLOCK_COST
      : UNLOCK_COST;

    if (portfolio.cash_balance < cost) {
      toast.error('Insufficient funds', { description: `You need ${formatCurrency(cost)} to unlock this stock.` });
      return;
    }

    const unlocked = [...(portfolio.unlocked_stocks || []), symbol];
    await base44.entities.Portfolio.update(portfolio.id, {
      cash_balance: parseFloat((portfolio.cash_balance - cost).toFixed(2)),
      unlocked_stocks: unlocked,
    });

    queryClient.invalidateQueries({ queryKey: ['my-portfolio'] });
    toast.success('Stock Unlocked!', { description: `${symbol} is now available for trading.` });
  }, [portfolio, stocks, queryClient]);

  const handleMandatoryReset = useCallback(async () => {
    if (!portfolio) return;
    await base44.entities.Portfolio.update(portfolio.id, {
      cash_balance: 10000,
      holdings: [],
      total_value: 10000,
    });
    queryClient.invalidateQueries({ queryKey: ['my-portfolio'] });
    // Set cookie so this user never sees it again (1 year)
    const cookieKey = `balance_patch_reset_${currentUserId}`;
    document.cookie = `${cookieKey}=true; max-age=${60 * 60 * 24 * 365}; path=/`;
    setShowMandatoryReset(false);
  }, [portfolio, queryClient, currentUserId]);

  const handleTrade = (stock, action) => {
    setTradeDialog({ open: true, symbol: stock.symbol, action });
  };

  if (stocksLoading || portfolioLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading market data...</p>
        </div>
      </div>
    );
  }

  const activeBg = portfolio?.active_background;

  const themeStyle = {
    '--theme-primary': theme.primary,
    '--theme-primary-muted': theme.primaryMuted,
    '--theme-primary-border': theme.primaryBorder,
    '--theme-glow': theme.glow,
    background: theme.bg,
  };

  return (
    <div className="min-h-screen relative" style={themeStyle}>
      {activeBg === 'bg_matrix'  && <MatrixRain />}
      {activeBg === 'bg_nebula'  && <NebulaBg />}
      {activeBg === 'bg_circuit' && <CircuitBg />}
      {activeBg === 'bg_aurora'  && <AuroraBg />}
      <StockTicker stocks={stocks} theme={theme} />
      
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 relative z-10">
        <PortfolioHeader portfolio={portfolio} stocks={stocks} countdown={countdown} theme={theme} onReset={handleReset} />

        <MarketHeatmap stocks={stocks} />

        <PortfolioGrowthChart portfolio={portfolio} stocks={stocks} theme={theme} />

        <Tabs defaultValue="market" className="w-full">
          <TabsList className="w-full border" style={{ background: theme.primaryMuted, borderColor: theme.primaryBorder }}>
            <TabsTrigger value="market" className="flex-1 gap-1.5 data-[state=active]:bg-card">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Market</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex-1 gap-1.5 data-[state=active]:bg-card">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 gap-1.5 data-[state=active]:bg-card">
              <ScrollText className="w-4 h-4" />
              <span className="hidden sm:inline">Trades</span>
            </TabsTrigger>
            <TabsTrigger value="realmarket" className="flex-1 gap-1.5 data-[state=active]:bg-card">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Real Market</span>
            </TabsTrigger>
            <TabsTrigger value="shop" className="flex-1 gap-1.5 data-[state=active]:bg-card">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Shop</span>
            </TabsTrigger>
            <TabsTrigger value="prestige" className="flex-1 gap-1.5 data-[state=active]:bg-card">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Prestige</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex-1 gap-1.5 data-[state=active]:bg-card">
              <Medal className="w-4 h-4" />
              <span className="hidden sm:inline">Achievements</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="market" className="mt-4">
            <MarketGrid
              stocks={stocks}
              portfolio={portfolio}
              onTrade={handleTrade}
              onUnlock={handleUnlock}
              onChart={(stock) => setChartStock(stock)}
              theme={theme}
            />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-4">
            <Leaderboard stocks={stocks} currentUserId={currentUserId} />
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <TradeLog />
          </TabsContent>

          <TabsContent value="realmarket" className="mt-4">
            <RealMarket />
          </TabsContent>

          <TabsContent value="shop" className="mt-4">
            <Shop portfolio={portfolio} />
          </TabsContent>

          <TabsContent value="achievements" className="mt-4">
            <Achievements portfolio={portfolio} stocks={stocks} theme={theme} />
          </TabsContent>

          <TabsContent value="prestige" className="mt-4">
            <PrestigePanel
              portfolio={portfolio}
              stocks={stocks}
              onTrade={handleTrade}
              onUnlock={handleUnlock}
              theme={theme}
            />
          </TabsContent>
        </Tabs>
      </div>

      <StockChart
        open={!!chartStock}
        onClose={() => setChartStock(null)}
        stock={chartStock}
      />

      {showMandatoryReset && portfolio && (
        <MandatoryResetOverlay onAccept={handleMandatoryReset} />
      )}

      <LiveChat portfolio={portfolio} />

      <TradeDialog
        open={tradeDialog.open}
        onClose={() => setTradeDialog({ open: false, symbol: null, action: 'buy' })}
        stock={stocks.find(s => s.symbol === tradeDialog.symbol) || null}
        action={tradeDialog.action}
        cashBalance={portfolio?.cash_balance || 0}
        holdings={(portfolio?.holdings || []).find(h => h.stock_symbol === tradeDialog.symbol)}
        onExecute={executeTrade}
      />
    </div>
  );
}