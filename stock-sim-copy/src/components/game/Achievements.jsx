import { ACHIEVEMENTS, buildAchievementState } from '@/lib/achievements';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Trophy, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Achievements({ portfolio, stocks, theme }) {
  const { data: trades = [] } = useQuery({
    queryKey: ['trade-history'],
    queryFn: () => base44.entities.TradeHistory.list('-created_date', 200),
  });

  const earnedIds = portfolio?.achievement_ids || [];
  const state = buildAchievementState(portfolio, stocks, trades.length);

  const groups = [
    { label: 'Net Worth', ids: ['worth_15k','worth_25k','worth_50k','worth_100k','worth_250k','worth_1m'] },
    { label: 'Trading', ids: ['first_trade','trades_10','trades_50','trades_100'] },
    { label: 'Portfolio', ids: ['hold_3','hold_5'] },
    { label: 'Unlocks', ids: ['premium_unlock','plat_unlock'] },
    { label: 'Prestige', ids: ['prestige_1','prestige_3','prestige_5'] },
    { label: 'Shop', ids: ['first_buy','collector'] },
  ];

  const totalEarned = ACHIEVEMENTS.filter(a => earnedIds.includes(a.id) || a.check(state)).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5" style={{ color: theme?.primary }} />
            Achievements
          </h2>
          <p className="text-xs text-muted-foreground">{totalEarned} / {ACHIEVEMENTS.length} unlocked</p>
        </div>
        {/* Progress bar */}
        <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(totalEarned / ACHIEVEMENTS.length) * 100}%`, background: theme?.primary }}
          />
        </div>
      </div>

      {groups.map(group => {
        const items = ACHIEVEMENTS.filter(a => group.ids.includes(a.id));
        return (
          <div key={group.label}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.label}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {items.map((ach, i) => {
                const unlocked = earnedIds.includes(ach.id) || ach.check(state);
                return (
                  <motion.div
                    key={ach.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={cn(
                      'rounded-xl border p-3 flex items-start gap-3 transition-all',
                      unlocked
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-border bg-card opacity-60'
                    )}
                    style={unlocked ? { borderColor: theme?.primaryBorder, background: theme?.primaryMuted } : {}}
                  >
                    <div className={cn('text-2xl leading-none mt-0.5', !unlocked && 'grayscale opacity-40')}>
                      {unlocked ? ach.label.split(' ')[0] : <Lock className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className={cn('text-sm font-semibold leading-tight', unlocked ? 'text-foreground' : 'text-muted-foreground')}>
                        {ach.label.split(' ').slice(1).join(' ')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ach.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}