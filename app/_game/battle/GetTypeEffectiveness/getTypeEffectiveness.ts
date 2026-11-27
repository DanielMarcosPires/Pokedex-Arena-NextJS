export type PokemonType =
  | "normal"
  | "fire"
  | "water"
  | "grass"
  | "electric"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy";

export type MoveCategory = "physical" | "special" | "status";

export type StatBoostTarget =
  | "attack"
  | "defense"
  | "specialAttack"
  | "specialDefense"
  | "speed";

export interface BattleMove {
  id: string;
  name: string;
  type: PokemonType;
  category: MoveCategory;
  power: number;
  accuracy: number;
  description: string;
  selfBoost?: {
    stat: StatBoostTarget;
    stages: number;
  };
}

/**
 * Tabela: TYPE_CHART[tipoDoGolpe][tipoDoDefensor] = multiplicador
 * Quando não listado, o multiplicador padrão é 1.
 */
export const TYPE_CHART: Partial<Record<PokemonType, Partial<Record<PokemonType, number>>>> = {
  fire: {
    grass: 2,
    bug: 2,
    steel: 2,
    water: 0.5,
    fire: 0.5,
  },
  water: {
    fire: 2,
    ground: 2,
    water: 0.5,
    grass: 0.5,
  },
  grass: {
    water: 2,
    ground: 2,
    fire: 0.5,
    grass: 0.5,
    flying: 0.5,
    bug: 0.5,
    steel: 0.5,
  },
  electric: {
    water: 2,
    flying: 2,
    grass: 0.5,
    electric: 0.5,
    ground: 0,
  },
  flying: {
    grass: 2,
    bug: 2,
    electric: 0.5,
    steel: 0.5,
  },
  bug: {
    grass: 2,
    fire: 0.5,
    flying: 0.5,
    steel: 0.5,
  },
  steel: {
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    steel: 0.5,
  },
  normal: {
    steel: 0.5,
  },
};

export function getTypeEffectiveness(
  moveType: PokemonType,
  defenderTypes: string[]
): number {
  if (!defenderTypes || defenderTypes.length === 0) return 1;

  const chartForMove = TYPE_CHART[moveType] ?? {};
  return defenderTypes.reduce((multiplier, rawType) => {
    const defType = rawType.toLowerCase() as PokemonType;
    const factor = chartForMove[defType] ?? 1;
    return multiplier * factor;
  }, 1);
}