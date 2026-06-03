import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/stockUtils';
import { THEMES } from '@/lib/themes';
import { Check, Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// All purchasable cosmetic items
export const SHOP_ITEMS = [
  // Themes — unlockable (emerald is free/default)
  { id: 'theme_cyan',   type: 'theme',      themeKey: 'cyan',   label: 'Cyan Theme',    price: 2000,  description: 'Ice-blue dashboard accent' },
  { id: 'theme_violet', type: 'theme',      themeKey: 'violet', label: 'Violet Theme',  price: 2000,  description: 'Deep purple glow' },
  { id: 'theme_amber',  type: 'theme',      themeKey: 'amber',  label: 'Amber Theme',   price: 2000,  description: 'Golden warm tones' },
  { id: 'theme_rose',   type: 'theme',      themeKey: 'rose',   label: 'Rose Theme',    price: 2000,  description: 'Bold pink-red palette' },
  { id: 'theme_indigo', type: 'theme',      themeKey: 'indigo', label: 'Indigo Theme',  price: 2000,  description: 'Classic deep indigo' },
  { id: 'theme_orange', type: 'theme',      themeKey: 'orange', label: 'Orange Theme',  price: 2000,  description: 'Fiery orange energy' },
  { id: 'theme_teal',   type: 'theme',      themeKey: 'teal',   label: 'Teal Theme',    price: 2000,  description: 'Cool ocean teal' },
  { id: 'theme_lime',   type: 'theme',      themeKey: 'lime',   label: 'Lime Theme',    price: 2000,  description: 'Neon lime green' },
  { id: 'theme_sky',    type: 'theme',      themeKey: 'sky',    label: 'Sky Theme',     price: 2000,  description: 'Crisp sky blue' },
  { id: 'theme_pink',   type: 'theme',      themeKey: 'pink',   label: 'Pink Theme',    price: 2000,  description: 'Hot pink neon' },
  { id: 'theme_gold',   type: 'theme',      themeKey: 'gold',   label: 'Gold Theme',    price: 3000,  description: 'Shimmering gold' },
  { id: 'theme_red',    type: 'theme',      themeKey: 'red',    label: 'Red Theme',     price: 2000,  description: 'Blood red danger' },

  // Backgrounds
  { id: 'bg_matrix',    type: 'background', label: 'Matrix Rain',    price: 5000,  description: 'Falling green code rain overlay' },
  { id: 'bg_nebula',    type: 'background', label: 'Nebula',         price: 5000,  description: 'Deep space cosmic background' },
  { id: 'bg_circuit',   type: 'background', label: 'Circuit Board',  price: 5000,  description: 'Tech circuit line overlay' },
  { id: 'bg_aurora',    type: 'background', label: 'Aurora',         price: 8000,  description: 'Northern lights gradient' },

  // Titles
  { id: 'title_wolf',   type: 'title',      label: '🐺 Wolf of Sim Street', price: 3000,  description: 'Show this title on the leaderboard' },
  { id: 'title_bull',   type: 'title',      label: '🐂 The Bull',           price: 3000,  description: 'A classic trader title' },
  { id: 'title_whale',  type: 'title',      label: '🐋 Whale Alert',        price: 6000,  description: 'For the biggest portfolios' },
  { id: 'title_degen',  type: 'title',      label: '🎰 Certified Degen',    price: 4000,  description: 'You know what you are' },
  { id: 'title_legend', type: 'title',      label: '⭐ Market Legend',      price: 12000, description: 'The ultimate flex' },
];

const TYPE_LABELS = { theme: 'Themes', background: 'Backgrounds', title: 'Titles', inventory: 'My Items' };
const TYPES = ['theme', 'background', 'title', 'inventory'];

const BG_PREVIEWS = {
  bg_matrix:  'linear-gradient(135deg, #001a00 0%, #002600 100%)',
  bg_nebula:  'linear-gradient(135deg, #0a0018 0%, #150030 50%, #001830 100%)',
  bg_circuit: 'linear-gradient(135deg, #001020 0%, #001828 100%)',
  bg_aurora:  'linear-gradient(135deg, #001a10 0%, #00103a 50%, #0d001a 100%)',
};

function ItemCard({ item, owned, active, canAfford, onBuy, onEquip }) {
  const theme = item.themeKey ? THEMES[item.themeKey] : null;

  const previewBg = theme
    ? theme.bg
    : item.type === 'background'
    ? BG_PREVIEWS[item.id]
    : null;

  const previewBorder = theme ? `2px solid ${theme.primary}` : '2px solid hsl(var(--border))';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-3 flex flex-col gap-2 transition-colors ${
        active ? 'border-primary bg-primary/5' : owned ? 'border-green-500/30 bg-green-500/5' : 'border-border bg-card'
      }`}
    >
      {/* Preview swatch */}
      {previewBg && (
        <div
          className="w-full h-10 rounded-lg"
          style={{ background: previewBg, border: previewBorder }}
        />
      )}
      {item.type === 'title' && (
        <div className="w-full h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-semibold truncate px-2">
          {item.label}
        </div>
      )}

      <div className="flex-1">
        <p className="font-semibold text-sm leading-tight">{item.type !== 'title' ? item.label : 'Title'}</p>
        <p className="text-xs text-muted-foreground">{item.description}</p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-bold text-primary">{formatCurrency(item.price)}</span>
        {active ? (
          <span className="flex items-center gap-1 text-[10px] text-primary font-semibold"><Check className="w-3 h-3" /> Active</span>
        ) : owned ? (
          <button
            onClick={() => onEquip(item)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 hover:bg-green-500/25 font-semibold transition-colors"
          >
            Equip
          </button>
        ) : (
          <button
            onClick={() => onBuy(item)}
            disabled={!canAfford}
            className={`text-[11px] px-2.5 py-1 rounded-full font-semibold transition-colors flex items-center gap-1 ${
              canAfford
                ? 'bg-primary/15 text-primary hover:bg-primary/25'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {!canAfford && <Lock className="w-2.5 h-2.5" />}
            Buy
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function Shop({ portfolio, onPortfolioUpdate }) {
  const [activeType, setActiveType] = useState('theme');
  const queryClient = useQueryClient();

  const ownedItems = portfolio?.owned_items || [];
  const activeTheme = portfolio?.theme || 'emerald';
  const activeBackground = portfolio?.active_background || null;
  const activeTitle = portfolio?.active_title || null;

  const filteredItems = activeType === 'inventory'
    ? SHOP_ITEMS.filter(i => isOwned(i))
    : SHOP_ITEMS.filter(i => i.type === activeType);

  const isOwned = (item) => {
    if (item.type === 'theme' && item.themeKey === 'emerald') return true; // emerald is free
    return ownedItems.includes(item.id);
  };

  const isActive = (item) => {
    if (item.type === 'theme') return item.themeKey === activeTheme;
    if (item.type === 'background') return item.id === activeBackground;
    if (item.type === 'title') return item.id === activeTitle;
    return false;
  };

  const handleBuy = async (item) => {
    if (!portfolio) return;
    if (portfolio.cash_balance < item.price) {
      toast.error('Not enough cash!');
      return;
    }

    const newOwned = [...ownedItems, item.id];
    const updates = {
      cash_balance: parseFloat((portfolio.cash_balance - item.price).toFixed(2)),
      owned_items: newOwned,
    };

    // Auto-equip on purchase
    if (item.type === 'theme') updates.theme = item.themeKey;
    if (item.type === 'background') updates.active_background = item.id;
    if (item.type === 'title') updates.active_title = item.id;

    await base44.entities.Portfolio.update(portfolio.id, updates);
    queryClient.invalidateQueries({ queryKey: ['my-portfolio'] });
    toast.success(`Purchased & equipped: ${item.label}!`, { icon: '🛒' });
  };

  const handleEquip = async (item) => {
    if (!portfolio) return;
    const updates = {};
    if (item.type === 'theme') updates.theme = item.themeKey;
    if (item.type === 'background') updates.active_background = item.id;
    if (item.type === 'title') updates.active_title = item.id;

    await base44.entities.Portfolio.update(portfolio.id, updates);
    queryClient.invalidateQueries({ queryKey: ['my-portfolio'] });
    toast.success(`Equipped: ${item.label}!`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-display font-bold text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Cosmetics Shop
          </h2>
          <p className="text-xs text-muted-foreground">Spend your profits on visual upgrades</p>
        </div>
        <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5">
          <span className="text-xs text-muted-foreground">Cash:</span>
          <span className="font-mono font-bold text-sm text-primary">{formatCurrency(portfolio?.cash_balance || 0)}</span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5">
        {TYPES.map(t => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Items grid */}
      {activeType === 'inventory' && filteredItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No items purchased yet.</p>
          <p className="text-xs mt-1">Buy themes, backgrounds, and titles to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              owned={isOwned(item)}
              active={isActive(item)}
              canAfford={(portfolio?.cash_balance || 0) >= item.price}
              onBuy={handleBuy}
              onEquip={handleEquip}
            />
          ))}
        </div>
      )}
    </div>
  );
}