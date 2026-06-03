import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Crown, User } from 'lucide-react';
import { formatCurrency } from '@/lib/stockUtils';
import { motion } from 'framer-motion';

const rankIcons = {
  0: <Crown className="w-5 h-5 text-yellow-400" />,
  1: <Medal className="w-5 h-5 text-gray-300" />,
  2: <Medal className="w-5 h-5 text-amber-600" />,
};

export default function Leaderboard({ stocks, currentUserId }) {
  const { data: portfolios = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => base44.entities.Portfolio.list('-total_value', 50),
    refetchInterval: 15000,
  });

  // Calculate real-time values
  const rankedPlayers = portfolios
    .map(p => {
      const holdingsValue = (p.holdings || []).reduce((sum, h) => {
        const stock = stocks.find(s => s.symbol === h.stock_symbol);
        return sum + (stock ? stock.price * h.shares : 0);
      }, 0);
      const totalValue = (p.cash_balance || 0) + holdingsValue;
      return {
        ...p,
        liveTotal: totalValue,
        pnl: totalValue - 10000,
      };
    })
    .sort((a, b) => b.liveTotal - a.liveTotal);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <h2 className="font-display font-bold text-lg">Leaderboard</h2>
        <Badge variant="outline" className="text-[10px] ml-auto">{rankedPlayers.length} players</Badge>
      </div>

      {rankedPlayers.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <p>No players yet. Start trading to appear on the leaderboard!</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {rankedPlayers.map((player, index) => {
            const isCurrentUser = player.created_by_id === currentUserId;
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`p-3 flex items-center gap-3 transition-all ${isCurrentUser ? 'border-primary/40 bg-primary/5' : ''}`}>
                  <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    {rankIcons[index] || (
                      <span className="font-mono text-sm text-muted-foreground font-bold">
                        #{index + 1}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">
                        {player.player_name || 'Anonymous Trader'}
                      </p>
                      {isCurrentUser && (
                        <Badge className="text-[9px] bg-primary/20 text-primary border-0">YOU</Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      P&L: <span className={player.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {formatCurrency(player.pnl)}
                      </span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-sm">{formatCurrency(player.liveTotal)}</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}