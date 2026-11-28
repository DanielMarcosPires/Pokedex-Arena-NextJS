import type { BattleStep } from "../battle/queue/TurnQueue";
import { getArenaLayout, type BattleSide, type RenderedMoveEffect } from "../battle/BattleRenderer";
import type { BattleCombatant } from "../battle/BattleStats";
import type { BattleMove } from "../battle/BattleRules";

export interface AttackStepContext {
    getCombatant: (side: BattleSide) => BattleCombatant | undefined;
    setStatusMessage: (msg: string) => void;
    setAttackTimer: (side: BattleSide, duration: number) => void;
    setActiveMoveEffect: (effect: RenderedMoveEffect | null) => void;
    onApplyResult: (
        defenderSide: BattleSide,
        attacker: BattleCombatant,
        defender: BattleCombatant,
        move: BattleMove,
        defenderLabel: string
    ) => void;
    emitState: () => void;
}

export function createReturnToChoosingStep(
    getPhase: () => string,
    getPlayerName: () => string | undefined,
    setChoosingPhase: (msg: string) => void,
    emitState: () => void
): BattleStep {
    return {
        duration: 0.2,
        execute: () => {
            const phase = getPhase();
            if (phase !== "finished" && phase !== "switching") {
                const name = getPlayerName() ?? "Pokémon";
                setChoosingPhase(`O que ${name} vai fazer?`);
                emitState();
            }
        },
    };
}

export function createAttackSteps(
    actorSide: BattleSide,
    move: BattleMove,
    ctx: AttackStepContext
): BattleStep[] {
    const defenderSide: BattleSide = actorSide === "player" ? "enemy" : "player";
    const isPureStatusMove = move.category === "status" && !move.selfBoost;

    return [
        {
            duration: isPureStatusMove ? 0.45 : 0.75,
            execute: () => {
                const attacker = ctx.getCombatant(actorSide);
                if (!attacker || attacker.currentHp <= 0) return;

                const canvas = document.querySelector("canvas");
                const { playerPos, enemyPos } = getArenaLayout(
                    canvas?.width ?? 800,
                    canvas?.height ?? 450
                );

                const actorPos = actorSide === "player" ? playerPos : enemyPos;
                const targetPos = actorSide === "player" ? enemyPos : playerPos;

                if (!isPureStatusMove) {
                    if (move.category !== "status") {
                        ctx.setAttackTimer(actorSide, 0.28);
                    }

                    ctx.setActiveMoveEffect({
                        moveName: move.name,
                        moveType: move.type,
                        moveCategory: move.category,
                        boostStat: move.selfBoost?.stat,
                        from: actorPos,
                        to: move.category === "status" ? actorPos : targetPos,
                        elapsed: 0,
                        duration: 0.55,
                    });
                } else {
                    ctx.setActiveMoveEffect(null);
                }

                ctx.setStatusMessage(`${attacker.name} usou ${move.name}!`);
                ctx.emitState();
            },
        },
        {
            duration: isPureStatusMove ? 0.65 : 1.05,
            execute: () => {
                const attacker = ctx.getCombatant(actorSide);
                const defender = ctx.getCombatant(defenderSide);
                if (
                    !attacker ||
                    attacker.currentHp <= 0 ||
                    !defender ||
                    defender.currentHp <= 0
                ) {
                    return;
                }

                const defenderLabel =
                    actorSide === "player" ? `${defender.name} inimigo` : defender.name;
                ctx.onApplyResult(defenderSide, attacker, defender, move, defenderLabel);
            },
        },
    ];
}