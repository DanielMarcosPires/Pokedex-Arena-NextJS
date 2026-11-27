export interface MoveEffectContext {
  ctx: CanvasRenderingContext2D;
  from: { x: number; y: number };
  to: { x: number; y: number };
  moveName: string; // ex.: "flamethrower" (slug)
  moveType: string; // ex.: "fire"
  progress: number; // 0 a 1 durante a animação do golpe
}