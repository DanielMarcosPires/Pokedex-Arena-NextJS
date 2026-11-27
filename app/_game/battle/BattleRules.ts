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