import type { Scene } from "../start/Scene";
import { EventBus } from "./EventBus";
import { Renderer } from "../graphics/Renderer";
import { InputManager } from "../input/InputManager";

export class Engine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentScene: Scene | null = null;
  private rafId: number | null = null;
  private lastTime = 0;
  private accumulator = 0;
  private readonly fixedStep = 1000 / 60;

  public readonly events = new EventBus();
  public readonly renderer: Renderer;
  public readonly input = new InputManager();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Não foi possível inicializar o contexto 2D do canvas.");
    }
    this.ctx = context;
    this.renderer = new Renderer(this.ctx);
  }

  async setScene(scene: Scene) {
    this.currentScene?.destroy?.();
    this.currentScene = scene;
    this.accumulator = 0;
    await this.currentScene.init();
  }

  start() {
    if (this.rafId !== null) return;
    this.input.attach(window);
    this.lastTime = performance.now();

    const loop = (now: number) => {
      const frameDelta = Math.min(now - this.lastTime, 100);
      this.lastTime = now;
      this.accumulator += frameDelta;

      while (this.accumulator >= this.fixedStep) {
        this.currentScene?.update(this.fixedStep / 1000);
        this.input.endFrame();
        this.accumulator -= this.fixedStep;
      }

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.currentScene?.render(this.ctx);

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.input.detach(window);
    this.currentScene?.destroy?.();
    this.currentScene = null;
  }
}