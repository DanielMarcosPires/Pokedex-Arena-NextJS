import type { Renderer } from "../graphics/Renderer";
import type { InputManager } from "../input/InputManager";
import type { EventBus } from "../core/EventBus";

export interface SceneContext {
  renderer: Renderer;
  input: InputManager;
  events: EventBus;
}

export interface Scene {
  init(context?: SceneContext): void | Promise<void>;
  update(dt: number, context?: SceneContext): void;
  render(ctx: CanvasRenderingContext2D, context?: SceneContext): void;
  destroy?(context?: SceneContext): void;
}