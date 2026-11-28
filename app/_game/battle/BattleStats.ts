import {
    getNextStatStage,
    MAX_STAT_STAGE,
    type BattleMove,
    type StatBoostTarget,
} from "./BattleRules";

export interface BattleCombatant {
    id?: string | number;
    name: string;
    types: string[];
    spriteUrl: string;
    maxHp: number;
    currentHp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
    moves: BattleMove[];
    baseStats?: Partial<Record<StatBoostTarget, number>>;
    statStages?: Partial<Record<StatBoostTarget, number>>;
}

export interface PartySlotSummary {
    index: number;
    name: string;
    spriteUrl: string;
    currentHp: number;
    maxHp: number;
    fainted: boolean;
    isActive: boolean;
}

export const MAX_PARTY_SIZE = 6;

export const STAT_LABELS: Record<StatBoostTarget, string> = {
    attack: "Attack",
    defense: "Defense",
    specialAttack: "Sp. Atk",
    specialDefense: "Sp. Def",
    speed: "Speed",
};

export function createInitialStatStages(): Record<StatBoostTarget, number> {
    return {
        attack: 0,
        defense: 0,
        specialAttack: 0,
        specialDefense: 0,
        speed: 0,
    };
}

export function cloneParty(party: BattleCombatant[]): BattleCombatant[] {
    return party.slice(0, MAX_PARTY_SIZE).map((p) => ({
        ...p,
        types: [...p.types],
        moves: [...p.moves],
        currentHp: p.maxHp,
        baseStats: {
            attack: p.baseStats?.attack ?? p.attack,
            defense: p.baseStats?.defense ?? p.defense,
            specialAttack: p.baseStats?.specialAttack ?? p.specialAttack,
            specialDefense: p.baseStats?.specialDefense ?? p.specialDefense,
            speed: p.baseStats?.speed ?? p.speed,
        },
        statStages: {
            ...createInitialStatStages(),
            ...(p.statStages ?? {}),
        },
    }));
}

export function applySelfBoost(
    combatant: BattleCombatant,
    stat: StatBoostTarget,
    stagesDelta: number
): string {
    const currentStage = combatant.statStages?.[stat] ?? 0;
    const nextStage = getNextStatStage(currentStage, stagesDelta);

    combatant.statStages = {
        ...createInitialStatStages(),
        ...(combatant.statStages ?? {}),
        [stat]: nextStage,
    };

    const baseValue = combatant.baseStats?.[stat] ?? combatant[stat];
    combatant[stat] = Math.max(1, Math.round(baseValue * (1 + nextStage * 0.5)));

    const label = STAT_LABELS[stat] ?? stat;
    if (nextStage === currentStage && nextStage >= MAX_STAT_STAGE) {
        return `${label} de ${combatant.name} já está no estágio máximo (${MAX_STAT_STAGE}/${MAX_STAT_STAGE})!`;
    }

    return `${label} de ${combatant.name} subiu para o Estágio ${nextStage}/${MAX_STAT_STAGE}!`;
}