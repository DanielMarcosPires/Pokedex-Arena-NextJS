import type { Scene } from "@/app/_engine/start/Scene";
import type { Engine } from "@/app/_engine/core/Engine";
import { AssetLoader } from "@/app/_engine/graphics/AssetLoader";
import {
    getTurnOrder,
    resolveAttack,
    type BattleMove,
} from "../battle/BattleRules";
import {
    renderMoveEffect,
    renderDebugCrop,
    type Point2D,
} from "../battle/Moves/MoveEffects";

type Side = "player" | "enemy";
type BattlePhase = "choosing" | "executing" | "switching" | "finished";

interface ActiveMoveEffect {
    moveName: string;
    moveType: string;
    from: Point2D;
    to: Point2D;
    elapsed: number;
    duration: number;
}

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

interface BattleStep {
    duration: number;
    execute: () => void;
}

const MAX_PARTY_SIZE = 6;

const STAT_LABELS: Record<string, string> = {
    attack: "Attack",
    defense: "Defense",
    specialAttack: "Sp. Atk",
    specialDefense: "Sp. Def",
    speed: "Speed",
};

const DEFAULT_MOVE: BattleMove = {
    id: "tackle",
    name: "Tackle",
    type: "normal",
    category: "physical",
    power: 40,
    accuracy: 100,
    description: "Investida física direta contra o alvo.",
};

function cloneParty(party: BattleCombatant[]): BattleCombatant[] {
    return party.slice(0, MAX_PARTY_SIZE).map((p) => ({
        ...p,
        types: [...p.types],
        moves: [...p.moves],
        currentHp: p.maxHp,
    }));
}

export class BattleScene implements Scene {
    private engine: Engine;
    private assets = new AssetLoader();

    private readonly initialPlayerParty: BattleCombatant[];
    private readonly initialEnemyParty: BattleCombatant[];

    private playerParty: BattleCombatant[] = [];
    private enemyParty: BattleCombatant[] = [];
    private activePlayerIndex = 0;
    private activeEnemyIndex = 0;

    private shake: Record<Side, number> = { player: 0, enemy: 0 };
    private attackTimer: Record<Side, number> = { player: 0, enemy: 0 };
    private activeMoveEffect: ActiveMoveEffect | null = null;

    private phase: BattlePhase = "choosing";
    private selectedMoveIndex = 0;
    private statusMessage = "Escolhe um golpe!";
    private stepQueue: BattleStep[] = [];
    private stepTimer = 0;

    constructor(
        engine: Engine,
        playerParty: BattleCombatant | BattleCombatant[],
        enemyParty: BattleCombatant | BattleCombatant[]
    ) {
        this.engine = engine;
        this.initialPlayerParty = cloneParty(
            Array.isArray(playerParty) ? playerParty : [playerParty]
        );
        this.initialEnemyParty = cloneParty(
            Array.isArray(enemyParty) ? enemyParty : [enemyParty]
        );
    }

    private get player(): BattleCombatant {
        return this.playerParty[this.activePlayerIndex] ?? this.playerParty[0];
    }

    private get enemy(): BattleCombatant {
        return this.enemyParty[this.activeEnemyIndex] ?? this.enemyParty[0];
    }

    private hasAlivePokemon(party: BattleCombatant[]): boolean {
        return party.some((p) => p.currentHp > 0);
    }

    private findNextAliveIndex(party: BattleCombatant[], startAfter = -1): number {
        for (let offset = 1; offset <= party.length; offset++) {
            const idx = (startAfter + offset) % party.length;
            if (party[idx].currentHp > 0) return idx;
        }
        return -1;
    }

    async init(): Promise<void> {
        this.resetBattleState();
        await this.loadAllPartySprites();
        this.emitBattleState();
    }

    private async loadAllPartySprites(): Promise<void> {
        const entries: { key: string; src: string; crossOrigin?: string }[] = [];

        this.playerParty.forEach((p, i) => {
            if (p.spriteUrl) {
                entries.push({ key: `player_${i}`, src: p.spriteUrl, crossOrigin: "anonymous" });
            }
        });

        this.enemyParty.forEach((e, i) => {
            if (e.spriteUrl) {
                entries.push({ key: `enemy_${i}`, src: e.spriteUrl, crossOrigin: "anonymous" });
            }
        });

        await this.assets.loadImages(entries);
    }

    restart(): void {
        this.resetBattleState();
    }

    selectMove(index: number): void {
        if (this.phase !== "choosing") return;
        if (index < 0 || index >= this.player.moves.length) return;

        this.selectedMoveIndex = index;
        this.startTurn(this.player.moves[index]);
    }

    /**
     * Troca o Pokémon ativo do jogador.
     * Se for troca voluntária na fase "choosing", gasta o turno e o oponente ataca depois.
     * Se for troca após desmaio ("switching"), apenas entra o novo Pokémon e volta a escolher.
     */
    switchPlayerPokemon(targetIndex: number): void {
        if (this.phase !== "choosing" && this.phase !== "switching") return;
        if (targetIndex < 0 || targetIndex >= this.playerParty.length) return;
        if (targetIndex === this.activePlayerIndex) return;

        const target = this.playerParty[targetIndex];
        if (!target || target.currentHp <= 0) return;

        const wasForcedSwitch = this.phase === "switching";
        this.activePlayerIndex = targetIndex;
        this.selectedMoveIndex = 0;
        this.stepQueue = [];
        this.stepTimer = 0;

        if (wasForcedSwitch) {
            this.phase = "choosing";
            this.statusMessage = `Vai, ${target.name}! O que ${target.name} vai fazer?`;
            this.emitBattleState();
            return;
        }

        // Troca voluntária: anuncia entrada e deixa o oponente atacar
        const enemyMove =
            this.enemy.moves[Math.floor(Math.random() * this.enemy.moves.length)] ??
            DEFAULT_MOVE;

        this.statusMessage = `${target.name} entrou em campo!`;
        this.phase = "executing";
        this.stepQueue = [
            { duration: 0.6, execute: () => { } },
            ...this.createAttackSteps("enemy", enemyMove),
            {
                duration: 0.2,
                execute: () => {
                    if (this.phase !== "finished") {
                        this.phase = "choosing";
                        this.statusMessage = `O que ${this.player.name} vai fazer?`;
                        this.emitBattleState();
                    }
                },
            },
        ];
        this.stepTimer = 0;
        this.runNextStep();
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
        this.stepQueue = [];
        this.stepTimer = 0;
        this.statusMessage = this.player
            ? `O que ${this.player.name} vai fazer?`
            : "Sem Pokémon na equipe!";
        this.emitBattleState();
    }

    private getArenaLayout(width: number, height: number) {
        const hudHeight = 96;
        const arenaHeight = height - hudHeight;
        return {
            hudHeight,
            arenaHeight,
            playerPos: { x: 150, y: arenaHeight - 72 } as Point2D,
            enemyPos: { x: width - 165, y: 126 } as Point2D,
        };
    }

    private startTurn(playerMove: BattleMove): void {
        if (this.phase !== "choosing") return;

        const enemyMove =
            this.enemy.moves[Math.floor(Math.random() * this.enemy.moves.length)] ??
            DEFAULT_MOVE;

        const order = getTurnOrder(this.player, this.enemy);
        const firstSide = order.first as Side;
        const secondSide = order.second as Side;

        this.stepQueue = [
            ...this.createAttackSteps(firstSide, firstSide === "player" ? playerMove : enemyMove),
            ...this.createAttackSteps(secondSide, secondSide === "player" ? playerMove : enemyMove),
            {
                duration: 0.2,
                execute: () => {
                    if (this.phase !== "finished" && this.phase !== "switching") {
                        this.phase = "choosing";
                        this.statusMessage = `O que ${this.player.name} vai fazer?`;
                        this.emitBattleState();
                    }
                },
            },
        ];

        this.phase = "executing";
        this.stepTimer = 0;
        this.runNextStep();
    }

    private createAttackSteps(actorSide: Side, move: BattleMove): BattleStep[] {
        const defenderSide: Side = actorSide === "player" ? "enemy" : "player";

        return [
            {
                duration: 0.75,
                execute: () => {
                    // Se o atacante desmaiou antes de agir neste turno, pula o ataque
                    const attacker = actorSide === "player" ? this.player : this.enemy;
                    if (!attacker || attacker.currentHp <= 0) return;

                    const canvas = document.querySelector("canvas");
                    const { playerPos, enemyPos } = this.getArenaLayout(
                        canvas?.width ?? 800,
                        canvas?.height ?? 450
                    );

                    this.attackTimer[actorSide] = 0.28;
                    this.activeMoveEffect = {
                        moveName: move.name,
                        moveType: move.type,
                        from: actorSide === "player" ? playerPos : enemyPos,
                        to: actorSide === "player" ? enemyPos : playerPos,
                        elapsed: 0,
                        duration: 0.55,
                    };
                    this.statusMessage = `${attacker.name} usou ${move.name}!`;
                    this.emitBattleState();
                },
            },
            {
                duration: 1.05,
                execute: () => {
                    const attacker = actorSide === "player" ? this.player : this.enemy;
                    const defender = defenderSide === "player" ? this.player : this.enemy;
                    if (!attacker || attacker.currentHp <= 0 || !defender || defender.currentHp <= 0) {
                        return;
                    }

                    const defenderLabel =
                        actorSide === "player" ? `${defender.name} inimigo` : defender.name;
                    this.applyAttackResult(defenderSide, attacker, defender, move, defenderLabel);
                },
            },
        ];
    }

    private applyAttackResult(
        defenderSide: Side,
        attacker: BattleCombatant,
        defender: BattleCombatant,
        move: BattleMove,
        defenderLabel: string
    ): void {
        const result = resolveAttack(attacker, defender, move);

        if (!result.hit) {
            this.statusMessage = `O ataque de ${attacker.name} falhou!`;
        } else if (result.boostedStat) {
            const label = STAT_LABELS[result.boostedStat] ?? result.boostedStat;
            this.statusMessage = `${label} de ${attacker.name} subiu!`;
        } else if (result.effectiveness === 0) {
            this.statusMessage = `Não teve efeito em ${defenderLabel}!`;
        } else {
            defender.currentHp = Math.max(0, defender.currentHp - result.damage);
            this.shake[defenderSide] = 0.3;

            const note =
                result.effectiveness > 1
                    ? " É super efetivo!"
                    : result.effectiveness < 1
                        ? " Não é muito efetivo..."
                        : "";

            this.statusMessage = `${attacker.name} causou ${result.damage} de dano em ${defenderLabel}!${note}`;
        }

        this.emitBattleState();

        if (defender.currentHp <= 0) {
            this.handleFaint(defenderSide);
        }
    }

    private handleFaint(faintedSide: Side): void {
        if (faintedSide === "enemy") {
            const nextEnemyIdx = this.findNextAliveIndex(
                this.enemyParty,
                this.activeEnemyIndex
            );

            if (nextEnemyIdx !== -1) {
                const faintedName = this.enemy.name;
                this.activeEnemyIndex = nextEnemyIdx;
                const nextEnemy = this.enemyParty[nextEnemyIdx];
                this.statusMessage = `${faintedName} inimigo desmaiou! Oponente enviou ${nextEnemy.name}!`;
                this.emitBattleState();
                return;
            }

            this.finishBattle("player");
            return;
        }

        // Jogador perdeu o Pokémon ativo
        if (this.hasAlivePokemon(this.playerParty)) {
            this.stepQueue = [];
            this.stepTimer = 0;
            this.phase = "switching";
            this.statusMessage = `${this.player.name} desmaiou! Escolha outro Pokémon da equipe.`;
            this.emitBattleState();
            return;
        }

        this.finishBattle("enemy");
    }

    private toPartySummary(party: BattleCombatant[], activeIdx: number): PartySlotSummary[] {
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

    private runNextStep(): void {
        if (this.phase === "finished" || this.phase === "switching") return;

        const next = this.stepQueue.shift();
        if (!next) {
            this.phase = "choosing";
            this.statusMessage = `O que ${this.player.name} vai fazer?`;
            this.emitBattleState();
            return;
        }

        next.execute();
        if (this.phase === "finished" || this.phase === "switching") return;

        this.stepTimer = next.duration;
    }

    private finishBattle(winner: Side): void {
        this.phase = "finished";
        this.stepQueue = [];
        this.stepTimer = 0;
        this.statusMessage =
            winner === "player"
                ? "Todos os Pokémon inimigos desmaiaram! Vitória!"
                : "Todos os seus Pokémon desmaiaram! Derrota!";
        this.emitBattleState();
    }

    private emitBattleState(): void {
        this.engine.events.emit("battle:state", {
            phase: this.phase,
            moves: this.player?.moves ?? [],
            selectedMoveIndex: this.selectedMoveIndex,
            playerHp: this.player?.currentHp ?? 0,
            playerMaxHp: this.player?.maxHp ?? 100,
            enemyHp: this.enemy?.currentHp ?? 0,
            enemyMaxHp: this.enemy?.maxHp ?? 100,
            playerParty: this.toPartySummary(this.playerParty, this.activePlayerIndex),
            enemyParty: this.toPartySummary(this.enemyParty, this.activeEnemyIndex),
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
            if (this.activeMoveEffect.elapsed >= this.activeMoveEffect.duration) {
                this.activeMoveEffect = null;
            }
        }
    }

    update(dt: number): void {
        this.tickTimers(dt);

        const currentPhase: BattlePhase = this.phase;

        if (currentPhase === "choosing") {
            this.handleChoosingInput(this.engine.input);
            return;
        }

        if (currentPhase === "executing" && this.stepTimer > 0) {
            this.stepTimer = Math.max(0, this.stepTimer - dt);
            if (this.stepTimer === 0) {
                this.runNextStep();
            }
        }
    }

    private handleChoosingInput(input: Engine["input"]): void {
        const len = this.player.moves.length;
        if (len === 0) return;

        if (input.justPressed("up") || input.justPressed("left")) {
            this.selectedMoveIndex = (this.selectedMoveIndex - 1 + len) % len;
            this.emitBattleState();
        }

        if (input.justPressed("down") || input.justPressed("right")) {
            this.selectedMoveIndex = (this.selectedMoveIndex + 1) % len;
            this.emitBattleState();
        }

        if (input.justPressed("confirm")) {
            this.startTurn(this.player.moves[this.selectedMoveIndex]);
        }
    }

    private getLungeOffset(
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

    render(ctx: CanvasRenderingContext2D): void {
        const { renderer } = this.engine;
        const { width, height } = ctx.canvas;
        const { hudHeight, arenaHeight, playerPos, enemyPos } = this.getArenaLayout(
            width,
            height
        );

        const enemyShakeX = this.shake.enemy > 0 ? Math.sin(this.shake.enemy * 75) * 6 : 0;
        const playerShakeX = this.shake.player > 0 ? Math.sin(this.shake.player * 75) * 6 : 0;
        const playerLunge = this.getLungeOffset(this.attackTimer.player, 0.28, 1, -1);
        const enemyLunge = this.getLungeOffset(this.attackTimer.enemy, 0.28, -1, 1);

        renderer.clear(width, height, "#1e293b");
        renderer.drawRect(0, 0, width, arenaHeight, "#334155");
        renderer.drawRect(0, arenaHeight, width, hudHeight, "#0f172a", "#475569", 2);

        const enemyImg = this.assets.getImage(`enemy_${this.activeEnemyIndex}`);
        const playerImg = this.assets.getImage(`player_${this.activePlayerIndex}`);

        if (enemyImg && this.enemy?.currentHp > 0) {
            renderer.drawImage(enemyImg, {
                x: enemyPos.x + enemyShakeX + enemyLunge.x,
                y: enemyPos.y + enemyLunge.y,
                width: 116,
                height: 116,
                centered: true,
            });
        }

        if (playerImg && this.player?.currentHp > 0) {
            renderer.drawImage(playerImg, {
                x: playerPos.x + playerShakeX + playerLunge.x,
                y: playerPos.y + playerLunge.y,
                width: 144,
                height: 144,
                centered: true,
            });
        }

        if (this.activeMoveEffect) {
            renderMoveEffect({
                ctx,
                from: this.activeMoveEffect.from,
                to: this.activeMoveEffect.to,
                moveName: this.activeMoveEffect.moveName,
                moveType: this.activeMoveEffect.moveType,
                progress: this.activeMoveEffect.elapsed / this.activeMoveEffect.duration,
            });
        }

        if (this.enemy) {
            this.drawHpBox(renderer, 24, 24, this.enemy);
        }
        if (this.player) {
            this.drawHpBox(renderer, width - 254, arenaHeight - 80, this.player);
        }

        renderer.drawText(this.statusMessage, 20, arenaHeight + 22, {
            color: "#f8fafc",
            font: "15px sans-serif",
        });

        if (this.phase === "choosing") {
            const moveLabel = this.player?.moves[this.selectedMoveIndex]?.name ?? "";
            renderer.drawText(
                `Golpe selecionado: ${moveLabel} (Enter para atacar ou clique num slot para trocar)`,
                20,
                arenaHeight + 54,
                { color: "#38bdf8", font: "13px sans-serif" }
            );
        } else if (this.phase === "switching") {
            renderer.drawText(
                "Selecione um Pokémon vivo nos seus 6 slots para continuar!",
                20,
                arenaHeight + 54,
                { color: "#fbbf24", font: "13px sans-serif" }
            );
        }

        renderDebugCrop(ctx, {
            enabled: false,
            sx: 245,
            sy: 808,
            sw: 24,
            sh: 24,
            scale: 3,
        });
    }

    private drawHpBox(
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

    destroy(): void {
        this.stepQueue = [];
        this.stepTimer = 0;
        this.assets.clear();
    }
}

export { BattleMove };