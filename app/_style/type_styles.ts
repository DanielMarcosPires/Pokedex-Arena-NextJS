export const TYPE_STYLES: Record<
  string,
  { badge: string; cardBg: string; gradientHex: string }
> = {
  grass: {
    badge: "bg-emerald-600 text-white",
    cardBg: "bg-emerald-950/40 border-emerald-500/40",
    gradientHex: "#16a34a",
  },
  poison: {
    badge: "bg-purple-600 text-white",
    cardBg: "bg-purple-950/40 border-purple-500/40",
    gradientHex: "#9333ea",
  },
  fire: {
    badge: "bg-orange-600 text-white",
    cardBg: "bg-orange-950/40 border-orange-500/40",
    gradientHex: "#ea580c",
  },
  water: {
    badge: "bg-sky-600 text-white",
    cardBg: "bg-sky-950/40 border-sky-500/40",
    gradientHex: "#0284c7",
  },
  electric: {
    badge: "bg-amber-400 text-slate-950",
    cardBg: "bg-amber-950/40 border-amber-400/40",
    gradientHex: "#facc15",
  },
  bug: {
    badge: "bg-lime-600 text-white",
    cardBg: "bg-lime-950/40 border-lime-500/40",
    gradientHex: "#65a30d",
  },
  normal: {
    badge: "bg-stone-500 text-white",
    cardBg: "bg-stone-800/40 border-stone-500/40",
    gradientHex: "#78716c",
  },
  flying: {
    badge: "bg-indigo-500 text-white",
    cardBg: "bg-indigo-950/40 border-indigo-400/40",
    gradientHex: "#6366f1",
  },
};

export const DEFAULT_STYLE = {
  badge: "bg-slate-600 text-white",
  cardBg: "bg-slate-900/40 border-slate-700",
  gradientHex: "#475569",
};
