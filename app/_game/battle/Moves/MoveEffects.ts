export interface Point2D {
    x: number;
    y: number;
}

export interface SpriteFrame {
    sx: number;
    sy: number;
    sw: number;
    sh: number;
}

export interface ElementalPunchConfig {
    punchFrame: SpriteFrame;
    explosionFrames: SpriteFrame[];
}

export interface MoveEffectParams {
    ctx: CanvasRenderingContext2D;
    from: Point2D;
    to: Point2D;
    moveName: string;
    moveType: string;
    progress: number; // 0 -> 1
}

export interface DebugCropConfig {
    enabled: boolean;
    sx: number;
    sy: number;
    sw: number;
    sh: number;
    scale?: number;
}

const SPRITE_SHEET_PATH = "/sprites/moveEffects_sprite.png";

let cachedSheet: HTMLImageElement | null = null;
let sheetLoading = false;
const frameCanvasCache = new Map<string, HTMLCanvasElement>();

const PUNCH_SPRITE: SpriteFrame = { sx: 245, sy: 808, sw: 24, sh: 24 };

const ELEMENTAL_PUNCH_MOVES: Record<string, ElementalPunchConfig> = {
    "fire-punch": {
        punchFrame: PUNCH_SPRITE,
        explosionFrames: [{ sx: 121, sy: 203, sw: 23, sh: 31 }],
    },
    "thunder-punch": {
        punchFrame: PUNCH_SPRITE,
        explosionFrames: [{ sx: 121, sy: 203, sw: 23, sh: 31 }],
    },
};

const TYPE_GLOW: Record<string, string> = {
    fire: "#ff6d00",
    water: "#0284c7",
    electric: "#eab308",
    grass: "#16a34a",
    ice: "#06b6d4",
    fighting: "#dc2626",
    normal: "#cbd5e1",
};

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

const normalizeSlug = (name: string): string =>
    (name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function ensureSpriteSheet(): HTMLImageElement | null {
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

function getCleanFrameCanvas(
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
    const octx = canvas.getContext("2d");
    if (!octx) return canvas;

    octx.drawImage(sheet, frame.sx, frame.sy, frame.sw, frame.sh, 0, 0, frame.sw, frame.sh);
    const imgData = octx.getImageData(0, 0, frame.sw, frame.sh);
    const data = imgData.data;
    const [bgR, bgG, bgB] = [data[0], data[1], data[2]];

    for (let i = 0; i < data.length; i += 4) {
        const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
        const isBlack = r <= 12 && g <= 12 && b <= 12;
        if (isBlack || Math.hypot(r - bgR, g - bgG, b - bgB) <= tolerance) {
            data[i + 3] = 0;
        }
    }

    octx.putImageData(imgData, 0, 0);
    frameCanvasCache.set(key, canvas);
    return canvas;
}

function drawSprite(
    ctx: CanvasRenderingContext2D,
    sheet: HTMLImageElement,
    frame: SpriteFrame,
    center: Point2D,
    scale: number,
    alpha: number
): void {
    const clean = getCleanFrameCanvas(sheet, frame);
    const w = frame.sw * scale;
    const h = frame.sh * scale;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = clamp01(alpha);
    ctx.drawImage(clean, center.x - w / 2, center.y - h / 2, w, h);
    ctx.restore();
}

function drawCircle(
    ctx: CanvasRenderingContext2D,
    center: Point2D,
    radius: number,
    color: string,
    alpha: number
): void {
    ctx.save();
    ctx.globalAlpha = clamp01(alpha);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawElementalPunch(
    ctx: CanvasRenderingContext2D,
    sheet: HTMLImageElement | null,
    config: ElementalPunchConfig,
    to: Point2D,
    moveType: string,
    t: number
): void {
    const glow = TYPE_GLOW[(moveType || "normal").toLowerCase()] ?? TYPE_GLOW.normal;

    if (sheet && config.explosionFrames.length > 0) {
        const idx = Math.min(config.explosionFrames.length - 1, Math.floor(t * config.explosionFrames.length));
        drawSprite(ctx, sheet, config.explosionFrames[idx], to, 2.2 + Math.sin(t * Math.PI) * 0.9, 1 - t * 0.35);
    } else {
        drawCircle(ctx, to, 14 + Math.sin(t * Math.PI) * 26, glow, (1 - t) * 0.85);
    }

    if (sheet && config.punchFrame) {
        const impactPop = Math.sin(Math.min(1, t * 1.4) * Math.PI);
        const jitterX = t > 0.25 && t < 0.85 ? Math.sin(t * 60) * 3 : 0;
        drawSprite(
            ctx,
            sheet,
            config.punchFrame,
            { x: to.x + jitterX, y: to.y },
            2.1 + impactPop * 0.35,
            1 - Math.max(0, (t - 0.75) * 4)
        );
    }
}

export function renderMoveEffect({
    ctx,
    from,
    to,
    moveName,
    moveType,
    progress,
}: MoveEffectParams): void {
    const t = clamp01(progress);
    const punchConfig = ELEMENTAL_PUNCH_MOVES[normalizeSlug(moveName)];

    if (punchConfig) {
        drawElementalPunch(ctx, ensureSpriteSheet(), punchConfig, to, moveType, t);
        return;
    }

    const glow = TYPE_GLOW[(moveType || "normal").toLowerCase()] ?? TYPE_GLOW.normal;
    const travel = clamp01(t * 1.25);
    drawCircle(
        ctx,
        { x: from.x + (to.x - from.x) * travel, y: from.y + (to.y - from.y) * travel },
        12,
        glow,
        1 - t * 0.7
    );
}

export function renderDebugCrop(ctx: CanvasRenderingContext2D, crop: DebugCropConfig): void {
    if (!crop.enabled) return;
    const sheet = ensureSpriteSheet();
    if (!sheet) return;

    const scale = crop.scale ?? 3;
    const [dw, dh, pad] = [crop.sw * scale, crop.sh * scale, 10];
    const totalW = Math.max(dw + pad * 2, 185);
    const totalH = dh + pad * 2 + 22;
    const boxX = Math.max(16, ctx.canvas.width - totalW - 20);
    const boxY = 24;

    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.fillRect(boxX, boxY, totalW, totalH);
    ctx.strokeRect(boxX, boxY, totalW, totalH);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(getCleanFrameCanvas(sheet, crop), boxX + pad, boxY + pad, dw, dh);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "11px monospace";
    ctx.fillText(`sx:${crop.sx} sy:${crop.sy} sw:${crop.sw} sh:${crop.sh}`, boxX + pad, boxY + pad + dh + 15);
    ctx.restore();
}