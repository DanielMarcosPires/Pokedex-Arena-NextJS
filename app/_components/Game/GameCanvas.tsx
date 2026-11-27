"use client";

import { useEffect, useRef, useState } from "react";
import { Engine } from "@/app/_engine/core/Engine";
import { TestScene } from "@/app/_engine/start/TestScene";

interface GameCanvasProps {
  width?: number;
  height?: number;
}

export default function GameCanvas({ width = 640, height = 400 }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [lastAction, setLastAction] = useState<string>("Aguardando ação...");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new Engine(canvas);
    const scene = new TestScene(engine);

    const unsubscribe = engine.events.on("test:confirm", (payload: unknown) => {
      const pos = payload as { x: number; y: number };
      setLastAction(`Confirm em (${Math.round(pos.x)}, ${Math.round(pos.y)})`);
    });

    let active = true;

    (async () => {
      await engine.setScene(scene);
      if (active) {
        engine.start();
      }
    })();

    return () => {
      active = false;
      unsubscribe();
      engine.stop();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-lg border border-slate-700 bg-slate-950 shadow-lg"
      />
      <p className="text-xs text-slate-400">{lastAction}</p>
    </div>
  );
}