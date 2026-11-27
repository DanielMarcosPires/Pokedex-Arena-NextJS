import type { Scene } from "@/app/_engine/start/Scene";
import type { Engine } from "@/app/_engine/core/Engine";
import { AssetLoader } from "@/app/_engine/graphics/AssetLoader";

export interface BattleMove {
  id: string;
  name: string;
  power: number;
  accuracy: number;
}

export interface BattleCombatant {
  name: string;
  spriteUrl: string;
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  speed: number;
  moves: BattleMove[];
}

type BattlePhase = "choosing" | "executing" | "finished";

export class BattleScene implements Scene {
  private engine: Engine;
  private assets = new AssetLoader();

  private player: BattleCombatant;
  private enemy: BattleCombatant;

  private phase: BattlePhase = "choosing";
  private selectedMoveIndex = 0;
  private statusMessage = "Escolhe um golpe!";
  private stepTimer = 0;
  private pendingAction: (() => void) | null = null;

  constructor(engine: Engine, player: BattleCombatant, enemy: BattleCombatant) {
    this.engine = engine;
    this.player = { ...player, currentHp: player.maxHp };
    this.enemy = { ...enemy, currentHp: enemy.maxHp };
  }

  async init(): Promise<void> {
    await this.assets.loadImages([
      { key: "player", src: this.player.spriteUrl, crossOrigin: "anonymous" },
      { key: "enemy", src: this.enemy.spriteUrl, crossOrigin: "anonymous" },
    ]);

    this.phase = "choosing";
    this.selectedMoveIndex = 0;
    this.statusMessage = `O que ${this.player.name} vai fazer?`;
    this.engine.events.emit("battle:state", {
      phase: this.phase,
      moves: this.player.moves,
      selectedMoveIndex: this.selectedMoveIndex,
      playerHp: this.player.currentHp,
      playerMaxHp: this.player.maxHp,
      enemyHp: this.enemy.currentHp,
      enemyMaxHp: this.enemy.maxHp,
    });
  }

  selectMove(index: number): void {
    if (this.phase !== "choosing") return;
    if (index < 0 || index >= this.player.moves.length) return;

    this.selectedMoveIndex = index;
    this.startTurn(this.player.moves[index]);
  }

  private startTurn(playerMove: BattleMove): void {
    this.phase = "executing";
    const enemyMove =
      this.enemy.moves[Math.floor(Math.random() * this.enemy.moves.length)] ?? {
        id: "tackle",
        name: "Tackle",
        power: 40,
        accuracy: 100,
      };

    const playerFirst = this.player.speed >= this.enemy.speed;

    const firstStep = playerFirst
      ? () => this.applyAttack(this.player, this.enemy, playerMove)
      : () => this.applyAttack(this.enemy, this.player, enemyMove);

    const secondStep = playerFirst
      ? () => this.applyAttack(this.enemy, this.player, enemyMove)
      : () => this.applyAttack(this.player, this.enemy, playerMove);

    this.statusMessage = playerFirst
      ? `${this.player.name} usou ${playerMove.name}!`
      : `${this.enemy.name} inimigo usou ${enemyMove.name}!`;

    this.stepTimer = 0.9;
    this.pendingAction = () => {
      firstStep();

      if (this.player.currentHp <= 0 || this.enemy.currentHp <= 0) {
        this.finishBattle();
        return;
      }

      this.stepTimer = 1.0;
      this.pendingAction = () => {
        secondStep();
        if (this.player.currentHp <= 0 || this.enemy.currentHp <= 0) {
          this.finishBattle();
          return;
        }

        this.phase = "choosing";
        this.statusMessage = `O que ${this.player.name} vai fazer?`;
        this.emitBattleState();
      };
    };
  }

  private applyAttack(
    attacker: BattleCombatant,
    defender: BattleCombatant,
    move: BattleMove
  ): void {
    const rawDamage =
      ((move.power * (attacker.attack / Math.max(1, defender.defense))) / 5) + 2;
    const damage = Math.max(1, Math.round(rawDamage));

    defender.currentHp = Math.max(0, defender.currentHp - damage);
    this.statusMessage = `${attacker.name} causou ${damage} de dano em ${defender.name}!`;
    this.emitBattleState();
  }

  private finishBattle(): void {
    this.phase = "finished";
    this.pendingAction = null;
    this.statusMessage =
      this.enemy.currentHp <= 0
        ? `${this.enemy.name} inimigo desmaiou! Vitória!`
        : `${this.player.name} desmaiou! Derrota!`;
    this.emitBattleState();
  }

  private emitBattleState(): void {
    this.engine.events.emit("battle:state", {
      phase: this.phase,
      moves: this.player.moves,
      selectedMoveIndex: this.selectedMoveIndex,
      playerHp: this.player.currentHp,
      playerMaxHp: this.player.maxHp,
      enemyHp: this.enemy.currentHp,
      enemyMaxHp: this.enemy.maxHp,
      message: this.statusMessage,
    });
  }

  update(dt: number): void {
    const { input } = this.engine;

    if (this.phase === "choosing") {
      const len = this.player.moves.length;
      if (len > 0) {
        if (input.justPressed("up") || input.justPressed("left")) {
          this.selectedMoveIndex = (this.selectedMoveIndex - 1 + len) % len;
        }
        if (input.justPressed("down") || input.justPressed("right")) {
          this.selectedMoveIndex = (this.selectedMoveIndex + 1) % len;
        }
        if (input.justPressed("confirm")) {
          this.startTurn(this.player.moves[this.selectedMoveIndex]);
        }
      }
      return;
    }

    if (this.phase === "executing" && this.stepTimer > 0) {
      this.stepTimer = Math.max(0, this.stepTimer - dt);
      if (this.stepTimer === 0 && this.pendingAction) {
        const next = this.pendingAction;
        this.pendingAction = null;
        next();
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { renderer } = this.engine;
    const { width, height } = ctx.canvas;

    renderer.clear(width, height, "#1e293b");

    // Área superior e inferior do cenário
    renderer.drawRect(0, 0, width, height - 96, "#334155");
    renderer.drawRect(0, height - 96, width, 96, "#0f172a", "#475569", 2);

    const enemyImg = this.assets.getImage("enemy");
    const playerImg = this.assets.getImage("player");

    if (enemyImg) {
      renderer.drawImage(enemyImg, {
        x: width - 160,
        y: 120,
        width: 112,
        height: 112,
        centered: true,
      });
    }

    if (playerImg) {
      renderer.drawImage(playerImg, {
        x: 150,
        y: height - 165,
        width: 128,
        height: 128,
        centered: true,
      });
    }

    this.drawHpBox(renderer, 24, 24, this.enemy);
    this.drawHpBox(renderer, width - 254, height - 185, this.player);

    renderer.drawText(this.statusMessage, 20, height - 74, {
      color: "#f8fafc",
      font: "15px sans-serif",
    });

    if (this.phase === "choosing") {
      const moveLabel = this.player.moves[this.selectedMoveIndex]?.name ?? "";
      renderer.drawText(`Golpe selecionado: ${moveLabel} (Enter para atacar)`, 20, height - 42, {
        color: "#38bdf8",
        font: "13px sans-serif",
      });
    }
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
    this.pendingAction = null;
    this.assets.clear();
  }
}