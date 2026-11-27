import { PokemonType, MoveCategory, StatBoostTarget } from "../BattleRules";

export interface KnownMoveConfig {
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

export const KNOWN_MOVE_STATS: Record<string, KnownMoveConfig> = {
    tackle: {
        type: "normal",
        category: "physical",
        power: 40,
        accuracy: 100,
        description: "Investida física direta e confiável contra o alvo.",
    },
    scratch: {
        type: "normal",
        category: "physical",
        power: 40,
        accuracy: 100,
        description: "Arranha o oponente com garras afiadas.",
    },
    "quick-attack": {
        type: "normal",
        category: "physical",
        power: 40,
        accuracy: 100,
        description: "Ataque físico veloz com alta precisão.",
    },
    cut: {
        type: "normal",
        category: "physical",
        power: 50,
        accuracy: 95,
        description: "Corte físico preciso com lâminas ou garras.",
    },
    bind: {
        type: "normal",
        category: "physical",
        power: 35,
        accuracy: 85,
        description: "Prende e aperta o alvo com força física.",
    },
    slam: {
        type: "normal",
        category: "physical",
        power: 60,
        accuracy: 85,
        description: "Golpe físico pesado desferido contra o oponente.",
    },
    "swords-dance": {
        type: "normal",
        category: "status",
        power: 0,
        accuracy: 100,
        description: "Dança frenética que aumenta muito o Attack do usuário (+2).",
        selfBoost: {
            stat: "attack",
            stages: 2,
        },
    },
    "razor-wind": {
        type: "flying",
        category: "physical",
        power: 80,
        accuracy: 100,
        description: "Golpe físico de lâminas de vento; forte contra Planta e Inseto.",
    },
    ember: {
        type: "fire",
        category: "special",
        power: 40,
        accuracy: 100,
        description: "Lança pequenas chamas; super efetivo contra Planta, Inseto e Aço.",
    },
    flamethrower: {
        type: "fire",
        category: "special",
        power: 90,
        accuracy: 100,
        description: "Rajada intensa de fogo; forte contra Planta, Inseto e Aço.",
    },
    "fire-punch": {
        type: "fire",
        category: "physical",
        power: 75,
        accuracy: 100,
        description: "Soco envolto em chamas; forte contra Planta, Inseto e Aço.",
    },
    "ice-punch": {
        type: "normal",
        category: "physical",
        power: 75,
        accuracy: 100,
        description: "Soco congelante com força física (sem tipo Gelo no mapa atual).",
    },
    "thunder-punch": {
        type: "electric",
        category: "physical",
        power: 75,
        accuracy: 100,
        description: "Soco carregado de eletricidade; forte contra Água e Voador.",
    },
    "vine-whip": {
        type: "grass",
        category: "physical",
        power: 45,
        accuracy: 100,
        description: "Açoita o alvo com cipós; super efetivo contra Água e Terra.",
    },
    "water-gun": {
        type: "water",
        category: "special",
        power: 45,
        accuracy: 100,
        description: "Dispara um jato de água; super efetivo contra Fogo e Terra.",
    },
    thunderbolt: {
        type: "electric",
        category: "special",
        power: 90,
        accuracy: 100,
        description: "Descarga elétrica potente; forte contra Água e Voador, nulo em Terra.",
    },
    "iron-tail": {
        type: "steel",
        category: "physical",
        power: 75,
        accuracy: 75,
        description: "Golpeia com uma cauda metálica; forte contra Planta e Inseto.",
    },
};