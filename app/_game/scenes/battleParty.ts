import type { BattleCombatant, PartySlotSummary } from "../battle/BattleStats";

export type FaintOutcome =
    | { kind: "enemy-switch"; nextIndex: number; message: string }
    | { kind: "player-switch"; message: string }
    | { kind: "finished"; winner: "player" | "enemy"; message: string };

export function hasAlivePokemon(party: BattleCombatant[]): boolean {
    return party.some((p) => p.currentHp > 0);
}

export function findNextAliveIndex(party: BattleCombatant[], startAfter = -1): number {
    for (let offset = 1; offset <= party.length; offset++) {
        const idx = (startAfter + offset) % party.length;
        if (party[idx].currentHp > 0) return idx;
    }
    return -1;
}

export function toPartySummary(
    party: BattleCombatant[],
    activeIdx: number
): PartySlotSummary[] {
    return party.map((p, index) => ({
        index,
        name: p.name,
        spriteUrl: p.spriteUrl,
        currentHp: p.currentHp,
        maxHp: p.maxHp,
        fainted: p.currentHp <= 0,
        isActive: index === activeIdx,
    }));
}

export function resolveFaintOutcome(
    faintedSide: "player" | "enemy",
    playerParty: BattleCombatant[],
    enemyParty: BattleCombatant[],
    activePlayer: BattleCombatant,
    activeEnemy: BattleCombatant,
    activeEnemyIndex: number
): FaintOutcome {
    if (faintedSide === "enemy") {
        const nextIdx = findNextAliveIndex(enemyParty, activeEnemyIndex);
        if (nextIdx !== -1) {
            return {
                kind: "enemy-switch",
                nextIndex: nextIdx,
                message: `${activeEnemy.name} inimigo desmaiou! Oponente enviou ${enemyParty[nextIdx].name}!`,
            };
        }
        return {
            kind: "finished",
            winner: "player",
            message: "Todos os Pokémon inimigos desmaiaram! Vitória!",
        };
    }

    if (hasAlivePokemon(playerParty)) {
        return {
            kind: "player-switch",
            message: `${activePlayer.name} desmaiou! Escolha outro Pokémon da equipe.`,
        };
    }

    return {
        kind: "finished",
        winner: "enemy",
        message: "Todos os seus Pokémon desmaiaram! Derrota!",
    };
}