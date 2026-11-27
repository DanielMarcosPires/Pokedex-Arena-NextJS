import type { BattleMove, MoveCategory, PokemonType } from "./BattleRules";
import type { PokemonMoveSummary } from "@/app/_classes/(privateClass)/Pokemon";
import { type KnownMoveConfig, KNOWN_MOVE_STATS } from "./Moves/Moves";
import type { BattleCombatant } from "../scenes/BattleScene";
import { getMoveInfo } from "@/api/_pokeAPI/data";

const pokeApiMoveCache = new Map<string, KnownMoveConfig>();

const FALLBACK_MOVES: BattleMove[] = [
    {
        id: "tackle-fallback",
        name: "Tackle",
        type: "normal",
        category: "physical",
        power: 40,
        accuracy: 100,
        description: "Investida física direta contra o oponente.",
    },
];

function extractStringUrl(value: unknown): string {
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed && trimmed !== "[object Object]") {
            return trimmed;
        }
    }
    return "";
}

function formatMoveLabel(slug: string): string {
    return slug
        .split("-")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function mapDamageClass(damageClass?: string): MoveCategory {
    if (damageClass === "special") return "special";
    if (damageClass === "status") return "status";
    return "physical";
}

function normalizePokemonType(rawType?: string): PokemonType {
    const validTypes: PokemonType[] = [
        "normal",
        "fire",
        "water",
        "grass",
        "electric",
        "ice",
        "fighting",
        "poison",
        "ground",
        "flying",
        "psychic",
        "bug",
        "rock",
        "ghost",
        "dragon",
        "dark",
        "steel",
        "fairy",
    ];
    const normalized = (rawType ?? "").toLowerCase() as PokemonType;
    return validTypes.includes(normalized) ? normalized : "normal";
}

function extractMoveDescription(data: any): string {
    const entries: Array<{ language?: { name?: string }; flavor_text?: string }> =
        data?.flavor_text_entries ?? [];

    const ptEntry = entries.find(
        (entry) => entry.language?.name === "pt" || entry.language?.name === "pt-BR"
    );
    const enEntry = entries.find((entry) => entry.language?.name === "en");

    const raw =
        ptEntry?.flavor_text ||
        enEntry?.flavor_text ||
        "Golpe obtido diretamente da PokéAPI.";

    return raw.replace(/[\n\f\r]+/g, " ").trim();
}

async function resolveMoveConfig(move: PokemonMoveSummary): Promise<KnownMoveConfig> {
    const slug = move.name.toLowerCase().replace(/\s+/g, "-");

    if (KNOWN_MOVE_STATS[slug]) {
        return KNOWN_MOVE_STATS[slug];
    }

    if (pokeApiMoveCache.has(slug)) {
        return pokeApiMoveCache.get(slug)!;
    }

    try {
        const data = await getMoveInfo(slug);
        const category = mapDamageClass(data?.damage_class?.name);

        const config: KnownMoveConfig = {
            type: normalizePokemonType(data?.type?.name),
            category,
            power: category === "status" ? 0 : Number(data?.power ?? 50),
            accuracy: Number(data?.accuracy ?? 100),
            description: extractMoveDescription(data),
        };

        pokeApiMoveCache.set(slug, config);
        return config;
    } catch {
        const fallback: KnownMoveConfig = {
            type: "normal",
            category: "physical",
            power: 50,
            accuracy: 95,
            description: "Ataque direto contra o oponente.",
        };
        pokeApiMoveCache.set(slug, fallback);
        return fallback;
    }
}

async function adaptMoves(moves: PokemonMoveSummary[]): Promise<BattleMove[]> {
    if (!moves || moves.length === 0) {
        return FALLBACK_MOVES;
    }

    const selected = moves.slice(0, 4);

    return Promise.all(
        selected.map(async (move, index) => {
            const config = await resolveMoveConfig(move);
            return {
                id: `${move.name}-${index}`,
                name: formatMoveLabel(move.name),
                type: config.type,
                category: config.category,
                power: config.power,
                accuracy: config.accuracy,
                description: config.description,
                selfBoost: config.selfBoost,
            };
        })
    );
}

function getStatValue(pokemon: any, statName: string, fallback: number): number {
    const camelCaseName = statName.replace(/-([a-z])/g, (_, char) =>
        char.toUpperCase()
    );

    if (typeof pokemon?.[statName] === "number") {
        return pokemon[statName];
    }
    if (typeof pokemon?.[camelCaseName] === "number") {
        return pokemon[camelCaseName];
    }

    if (pokemon?.stats && !Array.isArray(pokemon.stats)) {
        if (typeof pokemon.stats[statName] === "number") {
            return pokemon.stats[statName];
        }
        if (typeof pokemon.stats[camelCaseName] === "number") {
            return pokemon.stats[camelCaseName];
        }
    }

    if (Array.isArray(pokemon?.stats)) {
        const found = pokemon.stats.find(
            (item: any) =>
                item?.stat?.name === statName ||
                item?.name === statName ||
                item?.name === camelCaseName
        );
        if (typeof found?.base_stat === "number") return found.base_stat;
        if (typeof found?.value === "number") return found.value;
    }

    return fallback;
}

export async function toBattleCombatant(
    pokemon: any,
    side: "player" | "enemy"
): Promise<BattleCombatant> {
    const moves = await adaptMoves(pokemon?.moves ?? []);

    const rawTypes: string[] = Array.isArray(pokemon?.types)
        ? pokemon.types
            .map((t: any) => (typeof t === "string" ? t : t?.type?.name ?? t?.name))
            .filter(Boolean)
        : ["normal"];


    

    const rawId = String(pokemon?.id ?? pokemon?.serialId ?? "").trim();
    const numericId = /^\d+$/.test(rawId) ? rawId : "";

    const classicBackUrl = numericId
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${numericId}.png`
        : "";

    const classicFrontUrl = numericId
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${numericId}.png`
        : "";

    const officialArtworkUrl = numericId
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${numericId}.png`
        : "";

    // Se quiser AMBOS com sprite clássico:
    const playerCandidates: unknown[] = [
        classicBackUrl,
        classicFrontUrl,
        pokemon?.sprites?.back_default,
        pokemon?.sprites?.front_default,
        pokemon?.spriteUrl,
    ];

    const enemyCandidates: unknown[] = [
        classicFrontUrl,
        pokemon?.sprites?.front_default,
        officialArtworkUrl,
        pokemon?.spriteUrl,
    ];

    // Se quiser AMBOS com official-artwork grande, basta pôr officialArtworkUrl primeiro nos dois arrays!

    const candidates = side === "player" ? playerCandidates : enemyCandidates;

    const finalSpriteUrl =
        candidates.map(extractStringUrl).find((url) => url.length > 0) ?? "";

    const maxHp = Math.max(20, getStatValue(pokemon, "hp", 60));
    const attack = Math.max(10, getStatValue(pokemon, "attack", 55));
    const defense = Math.max(10, getStatValue(pokemon, "defense", 50));
    const specialAttack = Math.max(10, getStatValue(pokemon, "special-attack", 55));
    const specialDefense = Math.max(10, getStatValue(pokemon, "special-defense", 50));
    const speed = Math.max(10, getStatValue(pokemon, "speed", 50));

    const formattedName = pokemon?.name
        ? String(pokemon.name).charAt(0).toUpperCase() + String(pokemon.name).slice(1)
        : side === "player"
            ? "Jogador"
            : "Inimigo";

    return {
        name: formattedName,
        types: rawTypes.map((t) => t.toLowerCase()),
        spriteUrl: finalSpriteUrl,
        maxHp,
        currentHp: maxHp,
        attack,
        defense,
        specialAttack,
        specialDefense,
        speed,
        moves,
    };
}