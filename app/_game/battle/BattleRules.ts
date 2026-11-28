import type { BattleCombatant } from "../scenes/BattleScene";
import {
    getTypeEffectiveness,
    type BattleMove,
    type MoveCategory,
    type PokemonType,
    type StatBoostTarget,
} from "./GetTypeEffectiveness/getTypeEffectiveness";

export type { BattleMove, MoveCategory, PokemonType, StatBoostTarget };

export interface AttackResult {
    hit: boolean;
    damage: number;
    effectiveness: number;
    boostedStat?: StatBoostTarget;
}

export function getTurnOrder(
    player: BattleCombatant,
    enemy: BattleCombatant
): { first: "player" | "enemy"; second: "player" | "enemy" } {
    if (player.speed >= enemy.speed) {
        return { first: "player", second: "enemy" };
    }
    return { first: "enemy", second: "player" };
}

export function rollAccuracy(
    accuracy: number,
    rng: () => number = Math.random
): boolean {
    const clamped = Math.max(0, Math.min(100, accuracy));
    return rng() * 100 <= clamped;
}

export function calculateDamage(
    attacker: BattleCombatant,
    defender: BattleCombatant,
    move: BattleMove,
    effectiveness = 1
): number {
    if (move.category === "status" || move.power <= 0 || effectiveness === 0) {
        return 0;
    }

    const isSpecial = move.category === "special";
    const atk = isSpecial ? attacker.specialAttack : attacker.attack;
    const def = isSpecial ? defender.specialDefense : defender.defense;

    const rawDamage = (move.power * (atk / Math.max(1, def))) / 5 + 2;
    return Math.max(1, Math.round(rawDamage * effectiveness));
}

export function resolveAttack(
    attacker: BattleCombatant,
    defender: BattleCombatant,
    move: BattleMove,
    rng: () => number = Math.random
): AttackResult {
    const hit = rollAccuracy(move.accuracy, rng);
    if (!hit) {
        return { hit: false, damage: 0, effectiveness: 1 };
    }

    if (move.category === "status" && move.selfBoost) {
        const { stat, stages } = move.selfBoost;
        const factor =
            stages > 0 ? 1 + stages * 0.5 : 1 / (1 + Math.abs(stages) * 0.5);
        attacker[stat] = Math.max(1, Math.round(attacker[stat] * factor));

        return {
            hit: true,
            damage: 0,
            effectiveness: 1,
            boostedStat: stat,
        };
    }

    const effectiveness = getTypeEffectiveness(move.type, defender.types);
    const damage = calculateDamage(attacker, defender, move, effectiveness);

    return {
        hit: true,
        damage,
        effectiveness,
    };
}

export const MAX_STAT_STAGE = 5;

export function getNextStatStage(currentStage: number, delta: number): number {
    return Math.max(0, Math.min(MAX_STAT_STAGE, currentStage + delta));
}

export function getMoveEffectiveness(
    moveType: string,
    defenderTypes: string[]
): number {
    if (!moveType || !defenderTypes.length) return 1;
    return getTypeEffectiveness(
        moveType as PokemonType,
        defenderTypes as PokemonType[]
    );
}

export function getEffectivenessBadge(multiplier: number): {
    label: string;
    className: string;
} | null {
    if (multiplier >= 2) {
        return {
            label: multiplier >= 4 ? "SUPER EFETIVO (4x)" : "SUPER EFETIVO (2x)",
            className: "border-emerald-400/60 bg-emerald-500/20 text-emerald-200",
        };
    }
    if (multiplier === 0) {
        return {
            label: "SEM EFEITO (0x)",
            className: "border-slate-600 bg-slate-800/80 text-slate-400",
        };
    }
    if (multiplier < 1) {
        return {
            label: `POUCO EFETIVO (${multiplier}x)`,
            className: "border-amber-500/40 bg-amber-500/10 text-amber-200/90",
        };
    }
    return null;
}