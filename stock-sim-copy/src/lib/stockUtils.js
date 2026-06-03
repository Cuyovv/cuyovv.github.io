// Stock definitions - these are the 15 stocks in the game
export const STOCK_DEFINITIONS = [
  // Free tier — low base prices, moderate volatility
  { symbol: "NOVA", name: "Nova Energy", tier: "free", color: "#22c55e", sector: "Energy", basePrice: 45.00 },
  { symbol: "BYTE", name: "ByteStream Tech", tier: "free", color: "#3b82f6", sector: "Technology", basePrice: 120.00 },
  { symbol: "APEX", name: "Apex Motors", tier: "free", color: "#ef4444", sector: "Automotive", basePrice: 78.50 },
  { symbol: "LUNA", name: "Luna Biotech", tier: "free", color: "#a855f7", sector: "Healthcare", basePrice: 55.00 },
  { symbol: "IRON", name: "IronClad Mining", tier: "free", color: "#f97316", sector: "Mining", basePrice: 32.00 },
  // Premium tier — mid range
  { symbol: "CRYO", name: "CryoGen Labs", tier: "premium", color: "#06b6d4", sector: "Biotech", basePrice: 200.00 },
  { symbol: "VOLT", name: "VoltAge Systems", tier: "premium", color: "#eab308", sector: "Technology", basePrice: 150.00 },
  { symbol: "AQUA", name: "AquaDyn Corp", tier: "premium", color: "#14b8a6", sector: "Utilities", basePrice: 90.00 },
  { symbol: "STAR", name: "StarLink Aero", tier: "premium", color: "#ec4899", sector: "Aerospace", basePrice: 310.00 },
  { symbol: "OMNI", name: "OmniTrade Global", tier: "premium", color: "#8b5cf6", sector: "Finance", basePrice: 175.00 },
  // Platinum tier — high value
  { symbol: "ZEUS", name: "Zeus Capital Group", tier: "platinum", color: "#e5e4e2", sector: "Finance", basePrice: 1250.00 },
  { symbol: "QDOT", name: "QuantumDot AI", tier: "platinum", color: "#b9f2ff", sector: "AI & Quantum", basePrice: 2400.00 },
  { symbol: "SOL9", name: "Sol9 Fusion", tier: "platinum", color: "#ffd700", sector: "Energy", basePrice: 890.00 },
  { symbol: "NXUS", name: "Nexus BioSynth", tier: "platinum", color: "#d4af37", sector: "Biotech", basePrice: 1750.00 },
  { symbol: "VOID", name: "Void Systems", tier: "platinum", color: "#c0c0c0", sector: "Defense Tech", basePrice: 3100.00 },
  // Prestige tier — ultra-rare, unlocked only after prestiging
  { symbol: "MYTH", name: "Mythic Ventures", tier: "prestige", color: "#ff6b6b", sector: "VC", basePrice: 500.00 },
  { symbol: "AEON", name: "Aeon Quantum", tier: "prestige", color: "#c084fc", sector: "Quantum", basePrice: 750.00 },
  { symbol: "XENO", name: "Xenon BioTech", tier: "prestige", color: "#34d399", sector: "Biotech", basePrice: 420.00 },
  { symbol: "FLUX", name: "FluxCore Energy", tier: "prestige", color: "#fb923c", sector: "Energy", basePrice: 660.00 },
  { symbol: "VOID2", name: "Void Systems II", tier: "prestige", color: "#818cf8", sector: "Defense Tech", basePrice: 1100.00 },
];

export const UNLOCK_COST = 5000;
export const PLATINUM_UNLOCK_COST = 25000;
export const PRESTIGE_COST = 100000; // Net worth required to prestige
export const PRESTIGE_UNLOCK_COST = 10000; // Cost per prestige stock after prestiging

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value) {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function getPriceChangeColor(change) {
  if (change > 0) return 'text-green-400';
  if (change < 0) return 'text-red-400';
  return 'text-muted-foreground';
}

export function getPriceChangeBg(change) {
  if (change > 0) return 'bg-green-400/10 border-green-400/20';
  if (change < 0) return 'bg-red-400/10 border-red-400/20';
  return 'bg-muted border-border';
}