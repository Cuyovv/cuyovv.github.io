// Achievement definitions — each checked against current portfolio state

export const ACHIEVEMENTS = [
  // Net worth milestones
  { id: 'worth_15k',   label: '📈 First Gains',      description: 'Reach a net worth of $15,000',    check: (p) => p.totalValue >= 15000 },
  { id: 'worth_25k',   label: '💰 Quarter Rich',      description: 'Reach a net worth of $25,000',    check: (p) => p.totalValue >= 25000 },
  { id: 'worth_50k',   label: '🤑 Half a Hundo',      description: 'Reach a net worth of $50,000',    check: (p) => p.totalValue >= 50000 },
  { id: 'worth_100k',  label: '💎 Six Figures',       description: 'Reach a net worth of $100,000',   check: (p) => p.totalValue >= 100000 },
  { id: 'worth_250k',  label: '🚀 To The Moon',       description: 'Reach a net worth of $250,000',   check: (p) => p.totalValue >= 250000 },
  { id: 'worth_1m',    label: '👑 Millionaire',        description: 'Reach a net worth of $1,000,000', check: (p) => p.totalValue >= 1000000 },

  // Trading activity
  { id: 'first_trade', label: '🎯 First Trade',       description: 'Execute your first trade',        check: (p) => (p.tradeCount || 0) >= 1 },
  { id: 'trades_10',   label: '📊 Active Trader',     description: 'Execute 10 trades',               check: (p) => (p.tradeCount || 0) >= 10 },
  { id: 'trades_50',   label: '⚡ Power Trader',      description: 'Execute 50 trades',               check: (p) => (p.tradeCount || 0) >= 50 },
  { id: 'trades_100',  label: '🔥 Trading Machine',   description: 'Execute 100 trades',              check: (p) => (p.tradeCount || 0) >= 100 },

  // Diversification
  { id: 'hold_3',      label: '🌐 Diversified',       description: 'Hold 3 different stocks at once', check: (p) => (p.holdingCount || 0) >= 3 },
  { id: 'hold_5',      label: '🏦 Portfolio Pro',     description: 'Hold 5 different stocks at once', check: (p) => (p.holdingCount || 0) >= 5 },

  // Unlocks
  { id: 'premium_unlock', label: '⭐ Premium Access',   description: 'Unlock a premium stock',         check: (p) => (p.unlockedCount || 0) >= 1 },
  { id: 'plat_unlock',    label: '💠 Platinum Tier',    description: 'Unlock a platinum stock',        check: (p) => (p.platinumUnlocked || false) },

  // Prestige
  { id: 'prestige_1',  label: '🏆 Prestige I',        description: 'Reach Prestige Level 1',          check: (p) => (p.prestigeLevel || 0) >= 1 },
  { id: 'prestige_3',  label: '🌟 Prestige III',       description: 'Reach Prestige Level 3',          check: (p) => (p.prestigeLevel || 0) >= 3 },
  { id: 'prestige_5',  label: '🌠 Prestige V',         description: 'Reach Prestige Level 5',          check: (p) => (p.prestigeLevel || 0) >= 5 },

  // Shop
  { id: 'first_buy',   label: '🛒 Window Shopper',    description: 'Purchase your first shop item',   check: (p) => (p.ownedCount || 0) >= 1 },
  { id: 'collector',   label: '🎨 Collector',          description: 'Own 5 shop items',               check: (p) => (p.ownedCount || 0) >= 5 },
];

/**
 * Compute the achievement state object from portfolio + trade count
 */
export function buildAchievementState(portfolio, stocks, tradeCount) {
  const holdings = portfolio?.holdings || [];
  const holdingsValue = holdings.reduce((sum, h) => {
    const stock = stocks.find(s => s.symbol === h.stock_symbol);
    return sum + (stock ? stock.price * h.shares : 0);
  }, 0);
  const totalValue = (portfolio?.cash_balance || 0) + holdingsValue;
  const unlockedStocks = portfolio?.unlocked_stocks || [];
  const platinumSymbols = ['NVDA', 'TSLA', 'META', 'AMZN', 'MSFT']; // from stockUtils

  return {
    totalValue,
    tradeCount: tradeCount || 0,
    holdingCount: holdings.length,
    unlockedCount: unlockedStocks.length,
    platinumUnlocked: unlockedStocks.some(s => platinumSymbols.includes(s)),
    prestigeLevel: portfolio?.prestige_level || 0,
    ownedCount: (portfolio?.owned_items || []).length,
  };
}

/**
 * Returns array of newly unlocked achievement IDs (not in previousIds)
 */
export function getNewAchievements(state, earnedIds) {
  return ACHIEVEMENTS.filter(a => !earnedIds.includes(a.id) && a.check(state));
}