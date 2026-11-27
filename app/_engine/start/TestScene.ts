import type { Scene } from "./Scene";
import type { Engine } from "../core/Engine";

export class TestScene implements Scene {
  private engine: Engine;
  private x = 120;
  private y = 120;
  private readonly size = 36;
  private readonly speed = 220; // pixels por segundo
  private pulseTimer = 0;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  init(): void {
    this.x = 120;
    this.y = 120;
    this.pulseTimer = 0;
  }

  update(dt: number): void {
    const { input, events } = this.engine;

    let moveX = 0;
    let moveY = 0;

    if (input.isDown("left")) moveX -= 1;
    if (input.isDown("right")) moveX += 1;
    if (input.isDown("up")) moveY -= 1;
    if (input.isDown("down")) moveY += 1;

    // Normaliza diagonal para não andar mais rápido na diagonal
    if (moveX !== 0 && moveY !== 0) {
      const invSqrt2 = Math.SQRT1_2;
      moveX *= invSqrt2;
      moveY *= invSqrt2;
    }

    this.x += moveX * this.speed * dt;
    this.y += moveY * this.speed * dt;

    if (input.justPressed("confirm")) {
      this.pulseTimer = 0.25;
      events.emit("test:confirm", { x: this.x, y: this.y });
    }

    if (this.pulseTimer > 0) {
      this.pulseTimer = Math.max(0, this.pulseTimer - dt);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { renderer } = this.engine;
    const { width, height } = ctx.canvas;

    renderer.clear(width, height, "#0f172a");

    // Mantém o bloco dentro dos limites do canvas
    this.x = Math.max(0, Math.min(this.x, width - this.size));
    this.y = Math.max(0, Math.min(this.y, height - this.size));

    const color = this.pulseTimer > 0 ? "#34d399" : "#38bdf8";
    renderer.drawRect(this.x, this.y, this.size, this.size, color, "#f8fafc", 2);

    renderer.drawText(
      "WASD / Setas para mover · Enter / Espaço para testar evento",
      16,
      16,
      { color: "#cbd5e1", font: "14px sans-serif" }
    );
  }

  destroy(): void {
    this.pulseTimer = 0;
  }
}