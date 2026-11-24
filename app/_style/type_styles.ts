export type PokemonTypeKey =
  | "grass"
  | "poison"
  | "fire"
  | "water"
  | "electric"
  | "bug"
  | "normal"
  | "flying"
  | "ice"
  | "fighting"
  | "ground"
  | "psychic"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy";

export type HexColor = `#${string}`;

export interface TypeStyle {
  readonly badge: string;
  readonly cardBg: string;
  readonly gradientHex: HexColor;
}

export type TypeStylesMap = Record<PokemonTypeKey, TypeStyle> &
  Record<string, TypeStyle | undefined>;

export const TYPE_STYLES: TypeStylesMap = {
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
  ice: {
    badge: "bg-cyan-400 text-slate-950",
    cardBg: "bg-cyan-950/40 border-cyan-400/40",
    gradientHex: "#22d3ee",
  },
  fighting: {
    badge: "bg-red-700 text-white",
    cardBg: "bg-red-950/40 border-red-500/40",
    gradientHex: "#b91c1c",
  },
  ground: {
    badge: "bg-amber-700 text-white",
    cardBg: "bg-amber-950/40 border-amber-600/40",
    gradientHex: "#b45309",
  },
  psychic: {
    badge: "bg-pink-600 text-white",
    cardBg: "bg-pink-950/40 border-pink-500/40",
    gradientHex: "#db2777",
  },
  rock: {
    badge: "bg-yellow-800 text-white",
    cardBg: "bg-yellow-950/40 border-yellow-700/40",
    gradientHex: "#854d0e",
  },
  ghost: {
    badge: "bg-violet-800 text-white",
    cardBg: "bg-violet-950/40 border-violet-500/40",
    gradientHex: "#5b21b6",
  },
  dragon: {
    badge: "bg-indigo-700 text-white",
    cardBg: "bg-indigo-950/40 border-indigo-500/40",
    gradientHex: "#4338ca",
  },
  dark: {
    badge: "bg-zinc-800 text-white",
    cardBg: "bg-zinc-950/60 border-zinc-600/40",
    gradientHex: "#27272a",
  },
  steel: {
    badge: "bg-slate-500 text-white",
    cardBg: "bg-slate-900/50 border-slate-400/40",
    gradientHex: "#64748b",
  },
  fairy: {
    badge: "bg-rose-400 text-slate-950",
    cardBg: "bg-rose-950/40 border-rose-400/40",
    gradientHex: "#fb7185",
  },
};

export const DEFAULT_STYLE: TypeStyle = {
  badge: "bg-slate-600 text-white",
  cardBg: "bg-slate-900/40 border-slate-700",
  gradientHex: "#475569",
};