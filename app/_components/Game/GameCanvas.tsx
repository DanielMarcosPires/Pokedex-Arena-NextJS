"use client";

import { useEffect, useRef, useState } from "react";
import { Engine } from "@/app/_engine/core/Engine";
import {
  BattleScene,
  type BattleCombatant,
  type BattleMove,
} from "@/app/_game/scenes/BattleScene";

interface GameCanvasProps {
  width?: number;
  height?: number;
  player?: BattleCombatant;
  enemy?: BattleCombatant;
}

interface BattleHudState {
  phase: "choosing" | "executing" | "finished";
  moves: BattleMove[];
  selectedMoveIndex: number;
  message?: string;
}

const DEFAULT_PLAYER: BattleCombatant = {
  name: "Pikachu",
  spriteUrl:
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/25.png",
  maxHp: 95,
  currentHp: 95,
  attack: 55,
  defense: 40,
  speed: 90,
  moves: [
    { id: "thunderbolt", name: "Thunderbolt", power: 90, accuracy: 100 },
    { id: "quick-attack", name: "Quick Attack", power: 40, accuracy: 100 },
    { id: "iron-tail", name: "Iron Tail", power: 75, accuracy: 75 },
    { id: "slam", name: "Slam", power: 60, accuracy: 85 },
  ],
};

const DEFAULT_ENEMY: BattleCombatant = {
  name: "Charizard",
  spriteUrl:
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
  maxHp: 120,
  currentHp: 120,
  attack: 84,
  defense: 78,
  speed: 100,
  moves: [
    { id: "flamethrower", name: "Flamethrower", power: 90, accuracy: 100 },
    { id: "slash", name: "Slash", power: 70, accuracy: 100 },
    { id: "wing-attack", name: "Wing Attack", power: 60, accuracy: 100 },
  ],
};

export default function GameCanvas({
  width = 640,
  height = 400,
  player = DEFAULT_PLAYER,
  enemy = DEFAULT_ENEMY,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<BattleScene | null>(null);
  const [hud, setHud] = useState<BattleHudState>({
    phase: "choosing",
    moves: player.moves,
    selectedMoveIndex: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new Engine(canvas);
    const battleScene = new BattleScene(engine, player, enemy);
    sceneRef.current = battleScene;

    const unsubscribe = engine.events.on("battle:state", (payload: unknown) => {
      const state = payload as BattleHudState;
      setHud((prev) => ({
        ...prev,
        ...state,
      }));
    });

    let active = true;

    (async () => {
      await engine.setScene(battleScene);
      if (active) {
        engine.start();
      }
    })();

    return () => {
      active = false;
      unsubscribe();
      sceneRef.current = null;
      engine.stop();
    };
  }, [player, enemy]);

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-lg border border-slate-700 bg-slate-950 shadow-lg"
      />

      <div className="grid w-full grid-cols-2 gap-2">
        {hud.moves.map((move, index) => (
          <button
            key={move.id}
            type="button"
            disabled={hud.phase !== "choosing"}
            onClick={() => sceneRef.current?.selectMove(index)}
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-left text-sm text-slate-100 transition hover:border-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="font-medium">{move.name}</div>
            <div className="text-xs text-slate-400">Poder: {move.power}</div>
          </button>
        ))}
      </div>
    </div>
  );
}