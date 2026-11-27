export interface DrawImageOptions {
  x: number;
  y: number;
  width?: number;
  height?: number;
  flipX?: boolean;
  alpha?: number;
  centered?: boolean;
}

export interface CameraState {
  x: number;
  y: number;
  shakeX?: number;
  shakeY?: number;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  setContext(ctx: CanvasRenderingContext2D): void {
    this.ctx = ctx;
  }

  clear(width: number, height: number, fillColor?: string): void {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, width, height);

    if (fillColor) {
      this.ctx.fillStyle = fillColor;
      this.ctx.fillRect(0, 0, width, height);
    }

    this.ctx.restore();
  }

  drawImage(image: HTMLImageElement, options: DrawImageOptions): void {
    const {
      x,
      y,
      width = image.width,
      height = image.height,
      flipX = false,
      alpha = 1,
      centered = false,
    } = options;

    const drawX = centered ? x - width / 2 : x;
    const drawY = centered ? y - height / 2 : y;

    this.ctx.save();
    this.ctx.globalAlpha = alpha;

    if (flipX) {
      this.ctx.translate(drawX + width, drawY);
      this.ctx.scale(-1, 1);
      this.ctx.drawImage(image, 0, 0, width, height);
    } else {
      this.ctx.drawImage(image, drawX, drawY, width, height);
    }

    this.ctx.restore();
  }

  drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor?: string,
    strokeColor?: string,
    lineWidth = 1
  ): void {
    this.ctx.save();

    if (fillColor) {
      this.ctx.fillStyle = fillColor;
      this.ctx.fillRect(x, y, width, height);
    }

    if (strokeColor) {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = lineWidth;
      this.ctx.strokeRect(x, y, width, height);
    }

    this.ctx.restore();
  }

  drawText(
    text: string,
    x: number,
    y: number,
    options?: {
      color?: string;
      font?: string;
      align?: CanvasTextAlign;
      baseline?: CanvasTextBaseline;
    }
  ): void {
    this.ctx.save();
    this.ctx.fillStyle = options?.color ?? "#ffffff";
    this.ctx.font = options?.font ?? "16px sans-serif";
    this.ctx.textAlign = options?.align ?? "left";
    this.ctx.textBaseline = options?.baseline ?? "top";
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  applyCamera(camera: CameraState): void {
    const offsetX = -(camera.x + (camera.shakeX ?? 0));
    const offsetY = -(camera.y + (camera.shakeY ?? 0));
    this.ctx.translate(offsetX, offsetY);
  }

  save(): void {
    this.ctx.save();
  }

  restore(): void {
    this.ctx.restore();
  }
}