import { StatBoostTarget } from "../BattleRules";
import {
    drawSprite,
    ensureSpriteSheet,
    getCleanFrameCanvas,
    type SpriteFrame,
} from "./SpriteSheetCache";

export type { SpriteFrame };

export interface Point2D {
    x: number;
    y: number;
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
    moveCategory?: "physical" | "special" | "status";
    boostStat?: StatBoostTarget;
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

const STAT_BOOST_COLORS: Record<StatBoostTarget, string> = {
    attack: "#f97316",
    defense: "#38bdf8",
    specialAttack: "#c084fc",
    specialDefense: "#34d399",
    speed: "#facc15",
};

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

const normalizeSlug = (name: string): string =>
    (name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

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

function drawStatBoostEnergy(
    ctx: CanvasRenderingContext2D,
    center: Point2D,
    stat: StatBoostTarget,
    t: number
): void {
    const color = STAT_BOOST_COLORS[stat] ?? "#38bdf8";
    const alpha = Math.sin(t * Math.PI);

    ctx.save();
    ctx.globalAlpha = clamp01(alpha * 0.85);

    const radius = 26 + t * 22;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    const particles = 8;
    for (let i = 0; i < particles; i++) {
        const angle = (i / particles) * Math.PI * 2 + t * 2.2;
        const spreadX = Math.cos(angle) * 28;
        const riseY = 24 - t * 52 - (i % 3) * 6;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(center.x + spreadX, center.y + riseY, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function drawScaledSprite(
    ctx: CanvasRenderingContext2D,
    sheet: HTMLImageElement,
    frame: SpriteFrame,
    center: Point2D,
    scale: number,
    alpha: number
): void {
    const dw = frame.sw * scale;
    const dh = frame.sh * scale;
    drawSprite(ctx, sheet, frame, center.x, center.y, dw, dh, 0, alpha);
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
        const idx = Math.min(
            config.explosionFrames.length - 1,
            Math.floor(t * config.explosionFrames.length)
        );
        drawScaledSprite(
            ctx,
            sheet,
            config.explosionFrames[idx],
            to,
            2.2 + Math.sin(t * Math.PI) * 0.9,
            1 - t * 0.35
        );
    } else {
        drawCircle(ctx, to, 14 + Math.sin(t * Math.PI) * 26, glow, (1 - t) * 0.85);
    }

    if (sheet && config.punchFrame) {
        const impactPop = Math.sin(Math.min(1, t * 1.4) * Math.PI);
        const jitterX = t > 0.25 && t < 0.85 ? Math.sin(t * 60) * 3 : 0;
        drawScaledSprite(
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
    moveCategory,
    boostStat,
    progress,
}: MoveEffectParams): void {
    const t = clamp01(progress);

    if (moveCategory === "status") {
        if (boostStat) {
            drawStatBoostEnergy(ctx, from, boostStat, t);
        }
        return;
    }

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
    ctx.fillText(
        `sx:${crop.sx} sy:${crop.sy} sw:${crop.sw} sh:${crop.sh}`,
        boxX + pad,
        boxY + pad + dh + 15
    );
    ctx.restore();
}