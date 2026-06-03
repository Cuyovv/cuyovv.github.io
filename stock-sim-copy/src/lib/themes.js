// Per-account visual themes. Stock prices are always shared/global.
// Each theme defines a unique color palette for the dashboard.

export const THEMES = {
  emerald: {
    label: 'Emerald',
    primary: '#22c55e',
    primaryMuted: 'rgba(34,197,94,0.12)',
    primaryBorder: 'rgba(34,197,94,0.25)',
    accent: '#16a34a',
    glow: '0 0 24px rgba(34,197,94,0.15)',
    bg: 'linear-gradient(135deg, #0a130d 0%, #0d1f12 100%)',
    cardBg: 'rgba(15,30,18,0.9)',
    badge: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  cyan: {
    label: 'Cyan',
    primary: '#06b6d4',
    primaryMuted: 'rgba(6,182,212,0.12)',
    primaryBorder: 'rgba(6,182,212,0.25)',
    accent: '#0891b2',
    glow: '0 0 24px rgba(6,182,212,0.15)',
    bg: 'linear-gradient(135deg, #05111a 0%, #071c25 100%)',
    cardBg: 'rgba(7,25,35,0.9)',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  violet: {
    label: 'Violet',
    primary: '#8b5cf6',
    primaryMuted: 'rgba(139,92,246,0.12)',
    primaryBorder: 'rgba(139,92,246,0.25)',
    accent: '#7c3aed',
    glow: '0 0 24px rgba(139,92,246,0.15)',
    bg: 'linear-gradient(135deg, #0d0a18 0%, #150f28 100%)',
    cardBg: 'rgba(18,12,35,0.9)',
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  },
  amber: {
    label: 'Amber',
    primary: '#f59e0b',
    primaryMuted: 'rgba(245,158,11,0.12)',
    primaryBorder: 'rgba(245,158,11,0.25)',
    accent: '#d97706',
    glow: '0 0 24px rgba(245,158,11,0.15)',
    bg: 'linear-gradient(135deg, #150f02 0%, #1c1403 100%)',
    cardBg: 'rgba(22,16,3,0.9)',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  rose: {
    label: 'Rose',
    primary: '#f43f5e',
    primaryMuted: 'rgba(244,63,94,0.12)',
    primaryBorder: 'rgba(244,63,94,0.25)',
    accent: '#e11d48',
    glow: '0 0 24px rgba(244,63,94,0.15)',
    bg: 'linear-gradient(135deg, #180610 0%, #210a16 100%)',
    cardBg: 'rgba(24,6,14,0.9)',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
  indigo: {
    label: 'Indigo',
    primary: '#6366f1',
    primaryMuted: 'rgba(99,102,241,0.12)',
    primaryBorder: 'rgba(99,102,241,0.25)',
    accent: '#4f46e5',
    glow: '0 0 24px rgba(99,102,241,0.15)',
    bg: 'linear-gradient(135deg, #09091a 0%, #0e0e26 100%)',
    cardBg: 'rgba(10,10,28,0.9)',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  orange: {
    label: 'Orange',
    primary: '#f97316',
    primaryMuted: 'rgba(249,115,22,0.12)',
    primaryBorder: 'rgba(249,115,22,0.25)',
    accent: '#ea580c',
    glow: '0 0 24px rgba(249,115,22,0.15)',
    bg: 'linear-gradient(135deg, #160a02 0%, #1e0f03 100%)',
    cardBg: 'rgba(22,10,2,0.9)',
    badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  },
  teal: {
    label: 'Teal',
    primary: '#14b8a6',
    primaryMuted: 'rgba(20,184,166,0.12)',
    primaryBorder: 'rgba(20,184,166,0.25)',
    accent: '#0d9488',
    glow: '0 0 24px rgba(20,184,166,0.15)',
    bg: 'linear-gradient(135deg, #021310 0%, #031d18 100%)',
    cardBg: 'rgba(3,20,16,0.9)',
    badge: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  },
  lime: {
    label: 'Lime',
    primary: '#a3e635',
    primaryMuted: 'rgba(163,230,53,0.12)',
    primaryBorder: 'rgba(163,230,53,0.25)',
    accent: '#84cc16',
    glow: '0 0 24px rgba(163,230,53,0.15)',
    bg: 'linear-gradient(135deg, #0a1200 0%, #121c00 100%)',
    cardBg: 'rgba(12,20,0,0.9)',
    badge: 'bg-lime-500/10 text-lime-400 border-lime-500/20',
  },
  sky: {
    label: 'Sky',
    primary: '#38bdf8',
    primaryMuted: 'rgba(56,189,248,0.12)',
    primaryBorder: 'rgba(56,189,248,0.25)',
    accent: '#0ea5e9',
    glow: '0 0 24px rgba(56,189,248,0.15)',
    bg: 'linear-gradient(135deg, #020d18 0%, #03152a 100%)',
    cardBg: 'rgba(3,16,30,0.9)',
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  },
  pink: {
    label: 'Pink',
    primary: '#ec4899',
    primaryMuted: 'rgba(236,72,153,0.12)',
    primaryBorder: 'rgba(236,72,153,0.25)',
    accent: '#db2777',
    glow: '0 0 24px rgba(236,72,153,0.15)',
    bg: 'linear-gradient(135deg, #180510 0%, #230720 100%)',
    cardBg: 'rgba(24,5,16,0.9)',
    badge: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  },
  gold: {
    label: 'Gold',
    primary: '#fbbf24',
    primaryMuted: 'rgba(251,191,36,0.12)',
    primaryBorder: 'rgba(251,191,36,0.25)',
    accent: '#f59e0b',
    glow: '0 0 24px rgba(251,191,36,0.20)',
    bg: 'linear-gradient(135deg, #140e00 0%, #1e1500 100%)',
    cardBg: 'rgba(20,14,0,0.9)',
    badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  red: {
    label: 'Red',
    primary: '#ef4444',
    primaryMuted: 'rgba(239,68,68,0.12)',
    primaryBorder: 'rgba(239,68,68,0.25)',
    accent: '#dc2626',
    glow: '0 0 24px rgba(239,68,68,0.15)',
    bg: 'linear-gradient(135deg, #180202 0%, #240303 100%)',
    cardBg: 'rgba(24,2,2,0.9)',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
};

const THEME_KEYS = Object.keys(THEMES);

// Assign a deterministic theme based on user ID so it's consistent
export function assignThemeForUser(userId) {
  if (!userId) return 'emerald';
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) & 0x7fffffff;
  }
  return THEME_KEYS[hash % THEME_KEYS.length];
}

export function getTheme(themeKey) {
  return THEMES[themeKey] || THEMES.emerald;
}