import type { Scene } from "@/app/_engine/start/Scene";
import type { Engine } from "@/app/_engine/core/Engine";
import { AssetLoader } from "@/app/_engine/graphics/AssetLoader";
import { getTurnOrder, resolveAttack, type BattleMove } from "../battle/BattleRules";
import {
    applySelfBoost,
    cloneParty,
    createInitialStatStages,
    type BattleCombatant,
    type PartySlotSummary,
} from "../battle/BattleStats";
import {
    renderBattleScene,
    type BattleSide,
    type RenderedMoveEffect,
} from "../battle/BattleRenderer";
import { TurnQueue } from "../battle/queue/TurnQueue";
import { createAttackSteps, createReturnToChoosingStep } from "./battleSteps";
import { resolveFaintOutcome, toPartySummary } from "./battleParty";
import { readChoosingInput } from "./emitBattleState/battleInput";

type BattlePhase = "choosing" | "executing" | "switching" | "finished";

const DEFAULT_MOVE: BattleMove = {
    id: "tackle",
    name: "Tackle",
    type: "normal",
    category: "physical",
    power: 40,
    accuracy: 100,
    description: "Investida física direta contra o alvo.",
};

export class BattleScene implements Scene {
    private engine: Engine;
    private assets = new AssetLoader();
    private turnQueue = new TurnQueue();
    private readonly initialPlayerParty: BattleCombatant[];
    private readonly initialEnemyParty: BattleCombatant[];
    private playerParty: BattleCombatant[] = [];
    private enemyParty: BattleCombatant[] = [];
    private activePlayerIndex = 0;
    private activeEnemyIndex = 0;
    private shake: Record<BattleSide, number> = { player: 0, enemy: 0 };
    private attackTimer: Record<BattleSide, number> = { player: 0, enemy: 0 };
    private activeMoveEffect: RenderedMoveEffect | null = null;
    private phase: BattlePhase = "choosing";
    private selectedMoveIndex = 0;
    private statusMessage = "Escolhe um golpe!";

    constructor(
        engine: Engine,
        playerParty: BattleCombatant | BattleCombatant[],
        enemyParty: BattleCombatant | BattleCombatant[]
    ) {
        this.engine = engine;
        this.initialPlayerParty = cloneParty(Array.isArray(playerParty) ? playerParty : [playerParty]);
        this.initialEnemyParty = cloneParty(Array.isArray(enemyParty) ? enemyParty : [enemyParty]);
    }

    private get player(): BattleCombatant {
        return this.playerParty[this.activePlayerIndex] ?? this.playerParty[0];
    }

    private get enemy(): BattleCombatant {
        return this.enemyParty[this.activeEnemyIndex] ?? this.enemyParty[0];
    }

    async init(): Promise<void> {
        this.resetBattleState();
        const entries = [
            ...this.playerParty.map((p, i) => ({ key: `player_${i}`, src: p.spriteUrl, crossOrigin: "anonymous" })),
            ...this.enemyParty.map((e, i) => ({ key: `enemy_${i}`, src: e.spriteUrl, crossOrigin: "anonymous" })),
        ].filter((e) => Boolean(e.src));
        await this.assets.loadImages(entries);
        this.emitBattleState();
    }

    restart(): void {
        this.resetBattleState();
    }

    selectMove(index: number): void {
        if (this.phase !== "choosing" || index < 0 || index >= this.player.moves.length) return;
        this.selectedMoveIndex = index;
        this.startTurn(this.player.moves[index]);
    }

    switchPlayerPokemon(targetIndex: number): void {
        if (this.phase !== "choosing" && this.phase !== "switching") return;
        if (targetIndex < 0 || targetIndex >= this.playerParty.length || targetIndex === this.activePlayerIndex) return;
        const target = this.playerParty[targetIndex];
        if (!target || target.currentHp <= 0) return;

        const wasForced = this.phase === "switching";
        this.activePlayerIndex = targetIndex;
        this.selectedMoveIndex = 0;
        this.turnQueue.reset();

        if (wasForced) {
            this.phase = "choosing";
            this.statusMessage = `Vai, ${target.name}! O que ${target.name} vai fazer?`;
            this.emitBattleState();
            return;
        }

        const enemyMove = this.enemy.moves[Math.floor(Math.random() * this.enemy.moves.length)] ?? DEFAULT_MOVE;
        this.statusMessage = `${target.name} entrou em campo!`;
        this.phase = "executing";
        this.turnQueue.setSteps(
            [{ duration: 0.6, execute: () => {} }, ...this.buildAttackSteps("enemy", enemyMove), this.buildReturnStep()],
            true
        );
    }

    private buildReturnStep() {
        return createReturnToChoosingStep(
            () => this.phase,
            () => this.player?.name,
            (msg) => {
                this.phase = "choosing";
                this.statusMessage = msg;
            },
            () => this.emitBattleState()
        );
    }

    private buildAttackSteps(actorSide: BattleSide, move: BattleMove) {
        return createAttackSteps(actorSide, move, {
            getCombatant: (side) => (side === "player" ? this.player : this.enemy),
            setStatusMessage: (msg) => (this.statusMessage = msg),
            setAttackTimer: (side, duration) => (this.attackTimer[side] = duration),
            setActiveMoveEffect: (effect) => (this.activeMoveEffect = effect),
            onApplyResult: (defSide, atk, def, m, label) => this.applyAttackResult(defSide, atk, def, m, label),
            emitState: () => this.emitBattleState(),
        });
    }

    private resetBattleState(): void {
        this.playerParty = cloneParty(this.initialPlayerParty);
        this.enemyParty = cloneParty(this.initialEnemyParty);
        this.activePlayerIndex = 0;
        this.activeEnemyIndex = 0;
        this.shake = { player: 0, enemy: 0 };
        this.attackTimer = { player: 0, enemy: 0 };
        this.activeMoveEffect = null;
        this.phase = "choosing";
        this.selectedMoveIndex = 0;
        this.turnQueue.reset();
        this.statusMessage = this.player ? `O que ${this.player.name} vai fazer?` : "Sem Pokémon na equipe!";
        this.emitBattleState();
    }

    private startTurn(playerMove: BattleMove): void {
        if (this.phase !== "choosing") return;
        const enemyMove = this.enemy.moves[Math.floor(Math.random() * this.enemy.moves.length)] ?? DEFAULT_MOVE;
        const order = getTurnOrder(this.player, this.enemy);
        const firstSide = order.first as BattleSide;
        const secondSide = order.second as BattleSide;

        this.phase = "executing";
        this.turnQueue.setSteps(
            [
                ...this.buildAttackSteps(firstSide, firstSide === "player" ? playerMove : enemyMove),
                ...this.buildAttackSteps(secondSide, secondSide === "player" ? playerMove : enemyMove),
                this.buildReturnStep(),
            ],
            true
        );
    }

    private applyAttackResult(
        defenderSide: BattleSide,
        attacker: BattleCombatant,
        defender: BattleCombatant,
        move: BattleMove,
        defenderLabel: string
    ): void {
        if (move.category === "status" && move.selfBoost) {
            this.statusMessage = applySelfBoost(attacker, move.selfBoost.stat, move.selfBoost.stages);
            this.emitBattleState();
            return;
        }

        const result = resolveAttack(attacker, defender, move);
        if (!result.hit) {
            this.statusMessage = `O ataque de ${attacker.name} falhou!`;
        } else if (move.category === "status") {
            this.statusMessage = `${attacker.name} usou ${move.name}!`;
        } else if (result.effectiveness === 0) {
            this.statusMessage = `Não teve efeito em ${defenderLabel}!`;
        } else {
            defender.currentHp = Math.max(0, defender.currentHp - result.damage);
            this.shake[defenderSide] = 0.3;
            const note = result.effectiveness > 1 ? " É super efetivo!" : result.effectiveness < 1 ? " Não é muito efetivo..." : "";
            this.statusMessage = `${attacker.name} causou ${result.damage} de dano em ${defenderLabel}!${note}`;
        }

        this.emitBattleState();
        if (defender.currentHp <= 0) this.handleFaint(defenderSide);
    }

    private handleFaint(faintedSide: BattleSide): void {
        const outcome = resolveFaintOutcome(
            faintedSide,
            this.playerParty,
            this.enemyParty,
            this.player,
            this.enemy,
            this.activeEnemyIndex
        );
        this.statusMessage = outcome.message;

        if (outcome.kind === "enemy-switch") {
            this.activeEnemyIndex = outcome.nextIndex;
            this.turnQueue.markEndTurnAfterFaintSwitch();
        } else if (outcome.kind === "player-switch") {
            this.turnQueue.reset();
            this.phase = "switching";
        } else {
            this.turnQueue.reset();
            this.phase = "finished";
        }
        this.emitBattleState();
    }

    private emitBattleState(): void {
        this.engine.events.emit("battle:state", {
            phase: this.phase,
            moves: this.player?.moves ?? [],
            selectedMoveIndex: this.selectedMoveIndex,
            playerHp: this.player?.currentHp ?? 0,
            playerMaxHp: this.player?.maxHp ?? 100,
            playerStatStages: this.player?.statStages ?? createInitialStatStages(),
            enemyHp: this.enemy?.currentHp ?? 0,
            enemyTypes: this.enemy?.types ?? [],
            enemyMaxHp: this.enemy?.maxHp ?? 100,
            playerParty: toPartySummary(this.playerParty, this.activePlayerIndex),
            enemyParty: toPartySummary(this.enemyParty, this.activeEnemyIndex),
            message: this.statusMessage,
        });
    }

    private tickTimers(dt: number): void {
        this.shake.player = Math.max(0, this.shake.player - dt);
        this.shake.enemy = Math.max(0, this.shake.enemy - dt);
        this.attackTimer.player = Math.max(0, this.attackTimer.player - dt);
        this.attackTimer.enemy = Math.max(0, this.attackTimer.enemy - dt);
        if (this.activeMoveEffect) {
            this.activeMoveEffect.elapsed += dt;
            if (this.activeMoveEffect.elapsed >= this.activeMoveEffect.duration) this.activeMoveEffect = null;
        }
    }

    update(dt: number): void {
        this.tickTimers(dt);
        if (this.phase === "choosing") {
            const action = readChoosingInput(this.engine.input, this.selectedMoveIndex, this.player.moves.length);
            if (action.type === "select") {
                this.selectedMoveIndex = action.index;
                this.emitBattleState();
            } else if (action.type === "confirm") {
                this.startTurn(this.player.moves[this.selectedMoveIndex]);
            }
            return;
        }
        if (this.phase === "executing") {
            this.turnQueue.update(dt, {
                isBlocked: () => this.phase === "finished" || this.phase === "switching",
                onTurnEndedAfterSwitch: () => {
                    this.phase = "choosing";
                    this.emitBattleState();
                },
                onQueueEmpty: () => {
                    this.phase = "choosing";
                    this.statusMessage = `O que ${this.player.name} vai fazer?`;
                    this.emitBattleState();
                },
            });
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        renderBattleScene(ctx, this.engine, this.assets, {
            width: ctx.canvas.width,
            height: ctx.canvas.height,
            phase: this.phase,
            statusMessage: this.statusMessage,
            selectedMoveName: this.player?.moves[this.selectedMoveIndex]?.name ?? "",
            activePlayerIndex: this.activePlayerIndex,
            activeEnemyIndex: this.activeEnemyIndex,
            player: this.player,
            enemy: this.enemy,
            shake: this.shake,
            attackTimer: this.attackTimer,
            activeMoveEffect: this.activeMoveEffect,
        });
    }

    destroy(): void {
        this.turnQueue.reset();
        this.assets.clear();
    }
}

export type { BattleMove, BattleCombatant, PartySlotSummary };