export interface SpriteFrame {
    sx: number;
    sy: number;
    sw: number;
    sh: number;
}

export const SPRITE_SHEET_PATH = "/MoveEffects_sprite.png";

let cachedSheet: HTMLImageElement | null = null;
let sheetLoading = false;
const frameCanvasCache = new Map<string, HTMLCanvasElement>();

export function ensureSpriteSheet(): HTMLImageElement | null {
    if (typeof window === "undefined") return null;
    if (cachedSheet?.complete && cachedSheet.naturalWidth > 0) return cachedSheet;

    if (!cachedSheet && !sheetLoading) {
        sheetLoading = true;
        const img = new Image();
        img.src = SPRITE_SHEET_PATH;
        img.onload = () => {
            cachedSheet = img;
            frameCanvasCache.clear();
            sheetLoading = false;
        };
        img.onerror = () => {
            sheetLoading = false;
        };
    }

    return null;
}

function isBackgroundColor(r: number, g: number, b: number, tolerance: number): boolean {
    const isNearWhite = r >= 255 - tolerance && g >= 255 - tolerance && b >= 255 - tolerance;
    const isNearBlack = r <= tolerance && g <= tolerance && b <= tolerance;
    const isLightChecker =
        Math.abs(r - g) <= 6 &&
        Math.abs(g - b) <= 6 &&
        r >= 180 &&
        r <= 245;

    return isNearWhite || isNearBlack || isLightChecker;
}

export function getCleanFrameCanvas(
    sheet: HTMLImageElement,
    frame: SpriteFrame,
    tolerance = 28
): HTMLCanvasElement {
    const key = `${frame.sx},${frame.sy},${frame.sw},${frame.sh},${tolerance}`;
    const cached = frameCanvasCache.get(key);
    if (cached) return cached;

    const canvas = document.createElement("canvas");
    canvas.width = frame.sw;
    canvas.height = frame.sh;

    const fctx = canvas.getContext("2d");
    if (!fctx) return canvas;

    fctx.drawImage(
        sheet,
        frame.sx,
        frame.sy,
        frame.sw,
        frame.sh,
        0,
        0,
        frame.sw,
        frame.sh
    );

    const imageData = fctx.getImageData(0, 0, frame.sw, frame.sh);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha === 0) continue;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (isBackgroundColor(r, g, b, tolerance)) {
            data[i + 3] = 0;
        }
    }

    fctx.putImageData(imageData, 0, 0);
    frameCanvasCache.set(key, canvas);
    return canvas;
}

export function drawSprite(
    ctx: CanvasRenderingContext2D,
    sheet: HTMLImageElement,
    frame: SpriteFrame,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
    angle = 0,
    alpha = 1
): void {
    const cleanFrame = getCleanFrameCanvas(sheet, frame);

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.translate(dx, dy);
    if (angle !== 0) ctx.rotate(angle);
    ctx.drawImage(cleanFrame, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
}