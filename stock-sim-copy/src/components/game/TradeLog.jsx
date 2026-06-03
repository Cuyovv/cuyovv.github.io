import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollText, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '@/lib/stockUtils';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function TradeLog() {
  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['trade-history'],
    queryFn: () => base44.entities.TradeHistory.list('-created_date', 50),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <Card className="p-8 text-center">
        <ScrollText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No trades yet. Start trading to see your history!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <ScrollText className="w-5 h-5 text-muted-foreground" />
        <h2 className="font-display font-bold text-lg">Trade History</h2>
      </div>

      {trades.map((trade, index) => (
        <motion.div
          key={trade.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
        >
          <Card className="p-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              trade.action === 'buy' ? 'bg-green-500/10' : 'bg-red-500/10'
            }`}>
              {trade.action === 'buy' ? (
                <ArrowUpRight className="w-4 h-4 text-green-400" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-sm">{trade.stock_symbol}</span>
                <Badge variant="outline" className={`text-[9px] ${
                  trade.action === 'buy' ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'
                }`}>
                  {trade.action.toUpperCase()}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {trade.shares} shares @ {formatCurrency(trade.price_per_share)}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className={`font-mono font-semibold text-sm ${
                trade.action === 'buy' ? 'text-red-400' : 'text-green-400'
              }`}>
                {trade.action === 'buy' ? '-' : '+'}{formatCurrency(trade.total_amount)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {trade.created_date ? format(new Date(trade.created_date), 'MMM d, h:mm a') : ''}
              </p>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}