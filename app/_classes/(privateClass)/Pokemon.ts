export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface PokemonAbilitySummary {
  name: string;
  isHidden: boolean;
}

export interface PokeApiStatItem {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokeApiMoveVersionDetail {
  level_learned_at: number;
  move_learn_method: {
    name: string;
    url: string;
  };
  version_group: {
    name: string;
    url: string;
  };
}

export interface PokeApiMoveItem {
  move: {
    name: string;
    url: string;
  };
  version_group_details?: PokeApiMoveVersionDetail[];
}

export interface PokemonMoveSummary {
  name: string;
  levelLearnedAt: number;
  learnMethod: string;
}

export type Sprites = {
  back_default: string;
  back_shiny: string;
  front_default: string;
  front_shiny: string;
  other: {
    dream_world: {
      dream_default: string;
    };
    home: {
      front_default: string;
      front_shiny: string;
    };
    "official-artwork": {
      front_default: string;
      front_shiny: string;
    };
  };
};

export interface PokeApiPokemonResponse {
  id: number;
  name: string;
  types: Array<{
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }>;
  abilities: Array<{
    ability: { name: string; url: string };
    is_hidden: boolean;
    slot: number;
  }>;
  moves: PokeApiMoveItem[];
  stats: PokeApiStatItem[] | PokemonStats;
  sprites: Sprites;
}

function normalizeStats(stats: PokeApiStatItem[] | PokemonStats): PokemonStats {
  if (!Array.isArray(stats)) {
    return stats;
  }

  const byName = new Map(stats.map((item) => [item.stat.name, item.base_stat]));

  return {
    hp: byName.get("hp") ?? 0,
    attack: byName.get("attack") ?? 0,
    defense: byName.get("defense") ?? 0,
    specialAttack: byName.get("special-attack") ?? 0,
    specialDefense: byName.get("special-defense") ?? 0,
    speed: byName.get("speed") ?? 0,
  };
}

function normalizeMoves(moves: PokeApiMoveItem[] = []): PokemonMoveSummary[] {
  return moves.map((item) => {
    const latestDetail = item.version_group_details?.at(-1);

    return {
      name: item.move.name,
      levelLearnedAt: latestDetail?.level_learned_at ?? 0,
      learnMethod: latestDetail?.move_learn_method.name ?? "unknown",
    };
  });
}

export class Pokemon {
  public readonly serialId: string;
  public readonly name: string;
  public readonly types: string[];
  public readonly abilities: PokemonAbilitySummary[];
  public readonly moves: PokemonMoveSummary[];
  public readonly stats: PokemonStats;
  private readonly sprite: Sprites;

  constructor(pokemon: PokeApiPokemonResponse) {
    this.serialId = String(pokemon.id);
    this.name = pokemon.name;
    this.types = pokemon.types.map(({ type }) => type.name);
    this.abilities = pokemon.abilities.map((item) => ({
      name: item.ability.name,
      isHidden: item.is_hidden,
    }));
    this.moves = normalizeMoves(pokemon.moves);
    this.stats = normalizeStats(pokemon.stats);
    this.sprite = pokemon.sprites;
  }

  public getTypes(): string[] {
    return this.types;
  }

  public getSprites(): Sprites {
    return this.sprite;
  }
}