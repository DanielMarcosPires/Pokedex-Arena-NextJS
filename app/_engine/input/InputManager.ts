export type InputAction =
  | "up"
  | "down"
  | "left"
  | "right"
  | "confirm"
  | "cancel"
  | "menu";

export type KeyBindingMap = Record<InputAction, string[]>;

export const DEFAULT_KEY_BINDINGS: KeyBindingMap = {
  up: ["ArrowUp", "KeyW"],
  down: ["ArrowDown", "KeyS"],
  left: ["ArrowLeft", "KeyA"],
  right: ["ArrowRight", "KeyD"],
  confirm: ["Enter", "Space", "KeyZ"],
  cancel: ["Escape", "Backspace", "KeyX"],
  menu: ["KeyM", "Tab"],
};

export class InputManager {
  private bindings: KeyBindingMap;
  private downKeys = new Set<string>();
  private pressedThisFrame = new Set<string>();
  private releasedThisFrame = new Set<string>();
  private attached = false;

  constructor(bindings: KeyBindingMap = DEFAULT_KEY_BINDINGS) {
    this.bindings = bindings;
  }

  attach(target: Window = window): void {
    if (this.attached) return;

    target.addEventListener("keydown", this.handleKeyDown);
    target.addEventListener("keyup", this.handleKeyUp);
    target.addEventListener("blur", this.handleBlur);
    this.attached = true;
  }

  detach(target: Window = window): void {
    if (!this.attached) return;

    target.removeEventListener("keydown", this.handleKeyDown);
    target.removeEventListener("keyup", this.handleKeyUp);
    target.removeEventListener("blur", this.handleBlur);
    this.resetAll();
    this.attached = false;
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    const code = event.code;

    if (
      code === "ArrowUp" ||
      code === "ArrowDown" ||
      code === "ArrowLeft" ||
      code === "ArrowRight" ||
      code === "Space"
    ) {
      event.preventDefault();
    }

    if (!this.downKeys.has(code)) {
      this.pressedThisFrame.add(code);
    }
    this.downKeys.add(code);
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    const code = event.code;
    this.downKeys.delete(code);
    this.releasedThisFrame.add(code);
  };

  private handleBlur = (): void => {
    this.resetAll();
  };

  isDown(action: InputAction): boolean {
    return this.bindings[action].some((code) => this.downKeys.has(code));
  }

  justPressed(action: InputAction): boolean {
    return this.bindings[action].some((code) => this.pressedThisFrame.has(code));
  }

  justReleased(action: InputAction): boolean {
    return this.bindings[action].some((code) => this.releasedThisFrame.has(code));
  }

  endFrame(): void {
    this.pressedThisFrame.clear();
    this.releasedThisFrame.clear();
  }

  resetAll(): void {
    this.downKeys.clear();
    this.pressedThisFrame.clear();
    this.releasedThisFrame.clear();
  }

  setBindings(bindings: KeyBindingMap): void {
    this.bindings = bindings;
  }
}