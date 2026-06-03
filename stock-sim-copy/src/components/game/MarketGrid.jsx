import StockCard from './StockCard';

export default function MarketGrid({ stocks, portfolio, onTrade, onUnlock, onChart, theme }) {
  const unlockedSymbols = portfolio?.unlocked_stocks || [];
  const holdings = portfolio?.holdings || [];

  const freeStocks = stocks.filter(s => s.tier === 'free');
  const premiumStocks = stocks.filter(s => s.tier === 'premium');
  const platinumStocks = stocks.filter(s => s.tier === 'platinum');

  const cardProps = (stock, alwaysUnlocked = false) => ({
    key: stock.symbol,
    stock,
    isUnlocked: alwaysUnlocked || unlockedSymbols.includes(stock.symbol),
    onTrade,
    onUnlock,
    onChart,
    holdings: holdings.find(h => h.stock_symbol === stock.symbol),
    theme,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-lg mb-3">Market</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {freeStocks.map(stock => <StockCard {...cardProps(stock, true)} />)}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-display font-bold text-lg">Premium Stocks</h2>
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">$5,000 to unlock each</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {premiumStocks.map(stock => <StockCard {...cardProps(stock)} />)}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-display font-bold text-lg">
            💎 Platinum Stocks
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(212,175,55,0.12)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.3)' }}>
            $25,000 to unlock each
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {platinumStocks.map(stock => <StockCard {...cardProps(stock)} />)}
        </div>
      </div>
    </div>
  );
}