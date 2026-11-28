import type { Engine } from "@/app/_engine/core/Engine";
import type { AssetLoader } from "@/app/_engine/graphics/AssetLoader";
import {
    renderDebugCrop,
    renderMoveEffect,
    type Point2D,
} from "./Moves/MoveEffects";
import type { StatBoostTarget } from "./BattleRules";
import { BattleCombatant } from "../scenes/BattleScene";

export type BattleSide = "player" | "enemy";
export type RendererPhase = "choosing" | "executing" | "switching" | "finished";

export interface RenderedMoveEffect {
    moveName: string;
    moveType: string;
    moveCategory?: "physical" | "special" | "status";
    boostStat?: StatBoostTarget;
    from: Point2D;
    to: Point2D;
    elapsed: number;
    duration: number;
}

export interface ArenaLayout {
    hudHeight: number;
    arenaHeight: number;
    playerPos: Point2D;
    enemyPos: Point2D;
}

export interface BattleRenderState {
    width: number;
    height: number;
    phase: RendererPhase;
    statusMessage: string;
    selectedMoveName: string;
    activePlayerIndex: number;
    activeEnemyIndex: number;
    player?: BattleCombatant;
    enemy?: BattleCombatant;
    shake: Record<BattleSide, number>;
    attackTimer: Record<BattleSide, number>;
    activeMoveEffect: RenderedMoveEffect | null;
}

export function getArenaLayout(width: number, height: number): ArenaLayout {
    const hudHeight = 96;
    const arenaHeight = height - hudHeight;
    return {
        hudHeight,
        arenaHeight,
        playerPos: { x: 150, y: arenaHeight - 72 },
        enemyPos: { x: width - 165, y: 126 },
    };
}

function getLungeOffset(
    timer: number,
    maxDuration: number,
    dirX: number,
    dirY: number
): Point2D {
    if (timer <= 0 || maxDuration <= 0) return { x: 0, y: 0 };

    const progress = 1 - timer / maxDuration;
    const wave = Math.sin(progress * Math.PI);
    return { x: wave * 28 * dirX, y: wave * 14 * dirY };
}

function drawHpBox(
    renderer: Engine["renderer"],
    x: number,
    y: number,
    combatant: BattleCombatant
): void {
    const boxW = 230;
    const boxH = 56;
    const ratio = Math.max(0, Math.min(1, combatant.currentHp / combatant.maxHp));
    const barColor = ratio > 0.5 ? "#22c55e" : ratio > 0.2 ? "#eab308" : "#ef4444";

    renderer.drawRect(x, y, boxW, boxH, "#0f172a", "#94a3b8", 2);
    renderer.drawText(
        `${combatant.name}  ${combatant.currentHp}/${combatant.maxHp}`,
        x + 10,
        y + 8,
        { color: "#f8fafc", font: "13px sans-serif" }
    );
    renderer.drawRect(x + 10, y + 30, boxW - 20, 12, "#1e293b");
    renderer.drawRect(x + 10, y + 30, (boxW - 20) * ratio, 12, barColor);
}

export function renderBattleScene(
    ctx: CanvasRenderingContext2D,
    engine: Engine,
    assets: AssetLoader,
    state: BattleRenderState
): void {
    const { renderer } = engine;
    const { width, height, phase, statusMessage, player, enemy, shake, attackTimer, activeMoveEffect } = state;
    const { hudHeight, arenaHeight, playerPos, enemyPos } = getArenaLayout(width, height);

    const enemyShakeX = shake.enemy > 0 ? Math.sin(shake.enemy * 75) * 6 : 0;
    const playerShakeX = shake.player > 0 ? Math.sin(shake.player * 75) * 6 : 0;
    const playerLunge = getLungeOffset(attackTimer.player, 0.28, 1, -1);
    const enemyLunge = getLungeOffset(attackTimer.enemy, 0.28, -1, 1);

    renderer.clear(width, height, "#1e293b");
    renderer.drawRect(0, 0, width, arenaHeight, "#334155");
    renderer.drawRect(0, arenaHeight, width, hudHeight, "#0f172a", "#475569", 2);

    const enemyImg = assets.getImage(`enemy_${state.activeEnemyIndex}`);
    const playerImg = assets.getImage(`player_${state.activePlayerIndex}`);

    if (enemyImg && enemy && enemy.currentHp > 0) {
        renderer.drawImage(enemyImg, {
            x: enemyPos.x + enemyShakeX + enemyLunge.x,
            y: enemyPos.y + enemyLunge.y,
            width: 116,
            height: 116,
            centered: true,
        });
    }

    if (playerImg && player && player.currentHp > 0) {
        renderer.drawImage(playerImg, {
            x: playerPos.x + playerShakeX + playerLunge.x,
            y: playerPos.y + playerLunge.y,
            width: 144,
            height: 144,
            centered: true,
        });
    }

    if (activeMoveEffect) {
        renderMoveEffect({
            ctx,
            from: activeMoveEffect.from,
            to: activeMoveEffect.to,
            moveName: activeMoveEffect.moveName,
            moveType: activeMoveEffect.moveType,
            moveCategory: activeMoveEffect.moveCategory,
            boostStat: activeMoveEffect.boostStat,
            progress: activeMoveEffect.elapsed / activeMoveEffect.duration,
        });
    }

    if (enemy) {
        drawHpBox(renderer, 24, 24, enemy);
    }
    if (player) {
        drawHpBox(renderer, width - 254, arenaHeight - 80, player);
    }

    renderer.drawText(statusMessage, 20, arenaHeight + 22, {
        color: "#f8fafc",
        font: "15px sans-serif",
    });

    if (phase === "choosing") {
        renderer.drawText(
            `Golpe selecionado: ${state.selectedMoveName} (Enter para atacar ou clique num slot para trocar)`,
            20,
            arenaHeight + 54,
            { color: "#38bdf8", font: "13px sans-serif" }
        );
    } else if (phase === "switching") {
        renderer.drawText(
            "Selecione um Pokémon vivo nos seus 6 slots para continuar!",
            20,
            arenaHeight + 54,
            { color: "#fbbf24", font: "13px sans-serif" }
        );
    }

    renderDebugCrop(ctx, {
        enabled: true,
        sx: 245,
        sy: 808,
        sw: 24,
        sh: 24,
        scale: 3,
    });
}