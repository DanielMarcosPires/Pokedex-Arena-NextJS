import type { BattleCombatant, BattleMove } from "../scenes/BattleScene";

export interface AttackResult {
  hit: boolean;
  damage: number;
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

export function rollAccuracy(accuracy: number, rng: () => number = Math.random): boolean {
  const clamped = Math.max(0, Math.min(100, accuracy));
  return rng() * 100 <= clamped;
}

export function calculateDamage(
  attacker: BattleCombatant,
  defender: BattleCombatant,
  move: BattleMove
): number {
  const rawDamage =
    (move.power * (attacker.attack / Math.max(1, defender.defense))) / 5 + 2;
  return Math.max(1, Math.round(rawDamage));
}

export function resolveAttack(
  attacker: BattleCombatant,
  defender: BattleCombatant,
  move: BattleMove,
  rng: () => number = Math.random
): AttackResult {
  const hit = rollAccuracy(move.accuracy, rng);
  if (!hit) {
    return { hit: false, damage: 0 };
  }

  return {
    hit: true,
    damage: calculateDamage(attacker, defender, move),
  };
}