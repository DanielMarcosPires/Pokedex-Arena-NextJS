export interface MoveTypeTheme {
    cardBg: string;
    cardSelectedBg: string;
    border: string;
    badge: string;
    accentText: string;
}

const DEFAULT_TYPE_THEME: MoveTypeTheme = {
    cardBg: "bg-slate-800/85 hover:bg-slate-800",
    cardSelectedBg: "bg-slate-700/80",
    border: "border-slate-600/80",
    badge: "bg-slate-700 text-slate-100 border-slate-500/60",
    accentText: "text-slate-200",
};

const MOVE_TYPE_THEMES: Record<string, MoveTypeTheme> = {
    normal: {
        cardBg: "bg-stone-800/75 hover:bg-stone-800/95",
        cardSelectedBg: "bg-stone-700/85",
        border: "border-stone-500/60",
        badge: "bg-stone-600 text-stone-100 border-stone-400/50",
        accentText: "text-stone-200",
    },
    fire: {
        cardBg: "bg-orange-950/65 hover:bg-orange-950/85",
        cardSelectedBg: "bg-orange-900/75",
        border: "border-orange-500/60",
        badge: "bg-orange-600 text-white border-orange-400/60",
        accentText: "text-orange-300",
    },
    water: {
        cardBg: "bg-sky-950/65 hover:bg-sky-950/85",
        cardSelectedBg: "bg-sky-900/75",
        border: "border-sky-500/60",
        badge: "bg-sky-600 text-white border-sky-400/60",
        accentText: "text-sky-300",
    },
    electric: {
        cardBg: "bg-amber-950/65 hover:bg-amber-950/85",
        cardSelectedBg: "bg-amber-900/75",
        border: "border-amber-400/60",
        badge: "bg-amber-400 text-slate-950 border-amber-300",
        accentText: "text-amber-300",
    },
    grass: {
        cardBg: "bg-emerald-950/65 hover:bg-emerald-950/85",
        cardSelectedBg: "bg-emerald-900/75",
        border: "border-emerald-500/60",
        badge: "bg-emerald-600 text-white border-emerald-400/60",
        accentText: "text-emerald-300",
    },
    ice: {
        cardBg: "bg-cyan-950/65 hover:bg-cyan-950/85",
        cardSelectedBg: "bg-cyan-900/75",
        border: "border-cyan-400/60",
        badge: "bg-cyan-500 text-slate-950 border-cyan-300",
        accentText: "text-cyan-300",
    },
    fighting: {
        cardBg: "bg-rose-950/65 hover:bg-rose-950/85",
        cardSelectedBg: "bg-rose-900/75",
        border: "border-rose-500/60",
        badge: "bg-rose-700 text-white border-rose-400/60",
        accentText: "text-rose-300",
    },
    poison: {
        cardBg: "bg-fuchsia-950/65 hover:bg-fuchsia-950/85",
        cardSelectedBg: "bg-fuchsia-900/75",
        border: "border-fuchsia-500/60",
        badge: "bg-fuchsia-700 text-white border-fuchsia-400/60",
        accentText: "text-fuchsia-300",
    },
    ground: {
        cardBg: "bg-yellow-950/65 hover:bg-yellow-950/85",
        cardSelectedBg: "bg-yellow-900/75",
        border: "border-yellow-600/60",
        badge: "bg-amber-700 text-amber-100 border-amber-500/60",
        accentText: "text-amber-300",
    },
    flying: {
        cardBg: "bg-indigo-950/65 hover:bg-indigo-950/85",
        cardSelectedBg: "bg-indigo-900/75",
        border: "border-indigo-400/60",
        badge: "bg-indigo-500 text-white border-indigo-300/60",
        accentText: "text-indigo-300",
    },
    psychic: {
        cardBg: "bg-pink-950/65 hover:bg-pink-950/85",
        cardSelectedBg: "bg-pink-900/75",
        border: "border-pink-500/60",
        badge: "bg-pink-600 text-white border-pink-400/60",
        accentText: "text-pink-300",
    },
    bug: {
        cardBg: "bg-lime-950/65 hover:bg-lime-950/85",
        cardSelectedBg: "bg-lime-900/75",
        border: "border-lime-500/60",
        badge: "bg-lime-600 text-slate-950 border-lime-300",
        accentText: "text-lime-300",
    },
    rock: {
        cardBg: "bg-amber-950/55 hover:bg-amber-950/75",
        cardSelectedBg: "bg-amber-900/65",
        border: "border-stone-500/60",
        badge: "bg-stone-700 text-amber-100 border-stone-500",
        accentText: "text-stone-300",
    },
    ghost: {
        cardBg: "bg-violet-950/70 hover:bg-violet-950/90",
        cardSelectedBg: "bg-violet-900/80",
        border: "border-violet-500/60",
        badge: "bg-violet-700 text-white border-violet-400/60",
        accentText: "text-violet-300",
    },
    dragon: {
        cardBg: "bg-blue-950/70 hover:bg-blue-950/90",
        cardSelectedBg: "bg-blue-900/80",
        border: "border-blue-500/60",
        badge: "bg-blue-700 text-white border-blue-400/60",
        accentText: "text-blue-300",
    },
    dark: {
        cardBg: "bg-zinc-900/85 hover:bg-zinc-900",
        cardSelectedBg: "bg-zinc-800/90",
        border: "border-zinc-500/60",
        badge: "bg-zinc-700 text-zinc-100 border-zinc-500",
        accentText: "text-zinc-300",
    },
    steel: {
        cardBg: "bg-slate-900/80 hover:bg-slate-900",
        cardSelectedBg: "bg-slate-800/90",
        border: "border-slate-400/60",
        badge: "bg-slate-600 text-white border-slate-400/60",
        accentText: "text-slate-300",
    },
    fairy: {
        cardBg: "bg-rose-950/55 hover:bg-rose-950/75",
        cardSelectedBg: "bg-rose-900/65",
        border: "border-pink-400/60",
        badge: "bg-pink-500 text-white border-pink-300/60",
        accentText: "text-pink-200",
    },
};

export function getMoveTypeTheme(type?: string): MoveTypeTheme {
    if (!type) return DEFAULT_TYPE_THEME;
    return MOVE_TYPE_THEMES[type.toLowerCase().trim()] ?? DEFAULT_TYPE_THEME;
}