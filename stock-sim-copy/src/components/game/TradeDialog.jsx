import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, getPriceChangeColor } from '@/lib/stockUtils';

export default function TradeDialog({ open, onClose, stock, action, cashBalance, holdings, onExecute }) {
  const [shares, setShares] = useState(1);
  
  if (!stock) return null;

  const maxBuy = Math.floor(cashBalance / stock.price);
  const maxSell = holdings?.shares || 0;
  const maxShares = action === 'buy' ? maxBuy : maxSell;
  const totalCost = shares * stock.price;
  const isBuy = action === 'buy';

  const handleExecute = () => {
    if (shares > 0 && shares <= maxShares) {
      onExecute(stock, action, shares);
      setShares(1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className={isBuy ? 'text-green-400' : 'text-red-400'}>
              {isBuy ? 'Buy' : 'Sell'}
            </span>
            <span className="font-mono" style={{ color: stock.color }}>{stock.symbol}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Price</span>
            <span className="font-mono font-semibold">{formatCurrency(stock.price)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{isBuy ? 'Cash Available' : 'Shares Owned'}</span>
            <span className="font-mono font-semibold">
              {isBuy ? formatCurrency(cashBalance) : maxSell}
            </span>
          </div>

          <div className="space-y-2">
            <Label>Number of Shares</Label>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" size="icon" className="h-9 w-9 shrink-0"
                onClick={() => setShares(Math.max(1, shares - 1))}
              >-</Button>
              <Input
                type="number"
                value={shares}
                onChange={(e) => setShares(Math.max(1, Math.min(maxShares, parseInt(e.target.value) || 1)))}
                className="text-center font-mono"
                min={1}
                max={maxShares}
              />
              <Button 
                variant="outline" size="icon" className="h-9 w-9 shrink-0"
                onClick={() => setShares(Math.min(maxShares, shares + 1))}
              >+</Button>
            </div>
            <Button 
              variant="ghost" size="sm" className="text-xs text-muted-foreground w-full"
              onClick={() => setShares(maxShares)}
            >
              Max: {maxShares} shares
            </Button>
          </div>

          <div className="bg-muted rounded-lg p-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-mono font-bold text-lg">{formatCurrency(totalCost)}</span>
            </div>
            {isBuy && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Remaining Cash</span>
                <span className="font-mono">{formatCurrency(cashBalance - totalCost)}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleExecute}
            disabled={shares <= 0 || shares > maxShares}
            className={isBuy ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {isBuy ? 'Buy' : 'Sell'} {shares} Share{shares !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}