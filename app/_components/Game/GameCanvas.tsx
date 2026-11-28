"use client";


import { useEffect, useRef, useState } from "react";
import { Engine } from "@/app/_engine/core/Engine";
import {
    getMoveEffectiveness,
    getEffectivenessBadge,
    type BattleMove,
} from "@/app/_game/battle/BattleRules";
import { toBattleCombatant } from "@/app/_game/battle/BattleAdapter";
import { ObjectPokemon } from "@/app/_classes/objectPokemon";
import { PartySlotSummary, BattleScene } from "@/app/_game/scenes/BattleScene";
import { getMoveTypeTheme } from "@/app/_game/battle/Moves/MoveStyles";



interface HudState {
    phase: "choosing" | "executing" | "switching" | "finished";
    moves: BattleMove[];
    selectedMoveIndex: number;
    playerHp: number;
    playerMaxHp: number;
    enemyHp: number;
    enemyMaxHp: number;
    enemyTypes: string[];
    playerParty: PartySlotSummary[];
    enemyParty: PartySlotSummary[];
    message: string;
}

const INITIAL_HUD: HudState = {
    phase: "choosing",
    moves: [],
    selectedMoveIndex: 0,
    playerHp: 100,
    playerMaxHp: 100,
    enemyHp: 100,
    enemyMaxHp: 100,
    enemyTypes: [],
    playerParty: [],
    enemyParty: [],
    message: "",
};

function toFrontSpriteUrl(url?: string): string {
    if (!url) return "";
    return url.replace("/back/", "/");
}

function renderSlotHpBar(slot: PartySlotSummary) {
    if (slot.fainted) {
        return <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-slate-800" />;
    }

    const ratio = Math.max(0, Math.min(1, slot.currentHp / slot.maxHp));
    const barColor =
        ratio > 0.5 ? "bg-emerald-500" : ratio > 0.2 ? "bg-amber-400" : "bg-rose-500";

    return (
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-slate-950/80">
            <div
                className={`h-full transition-all ${barColor}`}
                style={{ width: `${ratio * 100}%` }}
            />
        </div>
    );
}

function mergeHudState(prev: HudState, payload: unknown): HudState {
    if (!payload || typeof payload !== "object") return prev;
    const data = payload as Partial<HudState>;

    return {
        phase: data.phase ?? prev.phase,
        moves: Array.isArray(data.moves) ? data.moves : prev.moves,
        selectedMoveIndex:
            typeof data.selectedMoveIndex === "number" ? data.selectedMoveIndex : prev.selectedMoveIndex,
        playerHp: typeof data.playerHp === "number" ? data.playerHp : prev.playerHp,
        playerMaxHp: typeof data.playerMaxHp === "number" ? data.playerMaxHp : prev.playerMaxHp,
        enemyHp: typeof data.enemyHp === "number" ? data.enemyHp : prev.enemyHp,
        enemyMaxHp: typeof data.enemyMaxHp === "number" ? data.enemyMaxHp : prev.enemyMaxHp,
        playerParty: Array.isArray(data.playerParty) ? data.playerParty : prev.playerParty,
        enemyParty: Array.isArray(data.enemyParty) ? data.enemyParty : prev.enemyParty,
        enemyTypes: Array.isArray(data.enemyTypes) ? data.enemyTypes : prev.enemyTypes,
        message: typeof data.message === "string" ? data.message : prev.message,
    };
}

function getMoveButtonClass(isSelected: boolean): string {
    const base =
        "flex min-h-16 w-full items-center justify-between rounded-md border px-5 py-3.5 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
    return isSelected
        ? `${base} border-sky-400 bg-sky-500/20 text-sky-200`
        : `${base} border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-500`;
}

function getEnemySlotClass(slot: PartySlotSummary): string {
    if (slot.fainted) {
        return "border-slate-800 bg-slate-950/60 text-slate-500 opacity-50";
    }
    if (slot.isActive) {
        return "border-rose-400/70 bg-rose-500/15 text-rose-100";
    }
    return "border-slate-700/80 bg-slate-800/70 text-slate-300";
}

function getPlayerSlotClass(slot: PartySlotSummary, isSwitching: boolean): string {
    if (slot.fainted) {
        return "border-slate-800 bg-slate-950/60 text-slate-500 opacity-50";
    }
    if (slot.isActive) {
        return "border-sky-400 bg-sky-500/20 text-sky-100";
    }
    if (isSwitching) {
        return "border-amber-400/70 bg-amber-500/10 text-amber-100 hover:border-amber-300";
    }
    return "border-slate-700 bg-slate-800 text-slate-200 hover:border-sky-400/70";
}

export function GameCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const sceneRef = useRef<BattleScene | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hud, setHud] = useState<HudState>(INITIAL_HUD);

    useEffect(() => {
        let cancelled = false;
        let engine: Engine | null = null;

        async function setupBattle() {
            const canvas = canvasRef.current;
            if (!canvas) return;

            try {
                setLoading(true);
                setError(null);

                const pokemons = await ObjectPokemon();
                if (cancelled) return;

                if (!pokemons || pokemons.length < 2) {
                    throw new Error("Não foi possível obter Pokémon suficientes para iniciar a batalha.");
                }

                const playerSlice = pokemons.slice(0, 6);
                const enemySlice =
                    pokemons.length >= 12
                        ? pokemons.slice(6, 12)
                        : [...pokemons.slice(1, 6), pokemons[0]].slice(0, 6);

                const [playerParty, enemyParty] = await Promise.all([
                    Promise.all(playerSlice.map((p) => toBattleCombatant(p, "player"))),
                    Promise.all(enemySlice.map((p) => toBattleCombatant(p, "enemy"))),
                ]);
                if (cancelled) return;

                engine = new Engine(canvas);
                const scene = new BattleScene(engine, playerParty, enemyParty);
                sceneRef.current = scene;

                engine.events.on("battle:state", (payload: unknown) => {
                    if (!cancelled) {
                        setHud((prev) => mergeHudState(prev, payload));
                    }
                });

                await scene.init();
                if (cancelled) return;

                engine.setScene(scene);
                engine.start();
                setLoading(false);
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Erro ao iniciar a batalha.");
                    setLoading(false);
                }
            }
        }

        setupBattle();

        return () => {
            cancelled = true;
            sceneRef.current = null;
            engine?.stop();
        };
    }, []);

    if (error) {
        return (
            <div className="rounded border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-200">
                {error}
            </div>
        );
    }

    const canSwitch = hud.phase === "choosing" || hud.phase === "switching";
    const isSwitching = hud.phase === "switching";
    const alivePlayerCount = hud.playerParty.filter((p) => !p.fainted).length;
    const aliveEnemyCount = hud.enemyParty.filter((p) => !p.fainted).length;

    return (
        <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-4 px-2 lg:grid-cols-[250px_minmax(0,1fr)_250px] xl:grid-cols-[290px_minmax(0,1fr)_290px] lg:items-stretch">            {/* Coluna esquerda: 6 slots do jogador */}
            <aside
                aria-label="Sua equipe"
                className="order-2 flex flex-col justify-between rounded border border-slate-800 bg-slate-900/60 p-2.5 lg:order-none"
            >
                <div>
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <span>Sua Equipe</span>
                        <span>
                            {alivePlayerCount}/{hud.playerParty.length}
                        </span>
                    </div>
                    {isSwitching && (
                        <div className="mb-2 rounded border border-amber-400/50 bg-amber-500/15 px-2 py-1 text-[11px] font-medium text-amber-200">
                            Escolha o próximo Pokémon!
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:flex lg:flex-1 lg:flex-col lg:justify-between lg:gap-2">
                    {hud.playerParty.map((slot) => {
                        const disabled = !canSwitch || slot.isActive || slot.fainted;
                        return (
                            <button
                                key={`player-slot-${slot.index}`}
                                type="button"
                                disabled={disabled}
                                onClick={() => sceneRef.current?.switchPlayerPokemon(slot.index)}
                                className={`flex items-center gap-2.5 rounded border px-2.5 py-2 text-left text-xs transition disabled:cursor-not-allowed ${getPlayerSlotClass(
                                    slot,
                                    isSwitching
                                )}`}
                            >
                                {slot.spriteUrl && (
                                    <img
                                        src={toFrontSpriteUrl(slot.spriteUrl)}
                                        alt={slot.name}
                                        className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14 xl:h-28 xl:w-28"
                                    />
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-1">
                                        <span className="truncate font-medium">{slot.name}</span>
                                        {slot.isActive && (
                                            <span className="shrink-0 rounded bg-sky-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-sky-300">
                                                ATIVO
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-0.5 text-[11px] text-slate-400">
                                        {slot.fainted ? "Desmaiado" : `HP ${slot.currentHp}/${slot.maxHp}`}
                                    </div>
                                    {renderSlotHpBar(slot)}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </aside>

            {/* Coluna central: arena + controle de golpes */}
            <div className="order-1 flex min-w-0 flex-col justify-between gap-3 lg:order-none">
                <div className="relative overflow-hidden rounded border border-slate-700 bg-slate-900">
                    <canvas ref={canvasRef} width={800} height={480} className="block w-full" />
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/75 text-sm text-slate-200">
                            A carregar dados da PokéAPI...
                        </div>
                    )}
                </div>

                <section
                    aria-label="Seleção de golpes"
                    className="flex flex-col gap-3 rounded border border-slate-800 bg-slate-900/90 p-4 sm:flex-row sm:items-stretch sm:justify-between"
                >
                    <ul className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
                        {hud.moves.map((move, index) => {
                            const isSelected = index === hud.selectedMoveIndex;
                            const multiplier = getMoveEffectiveness(move.type, hud.enemyTypes);
                            const effBadge = getEffectivenessBadge(multiplier);
                            const typeTheme = getMoveTypeTheme(move.type);

                            return (
                                <li key={move.id} className="w-full">
                                    <button
                                        type="button"
                                        disabled={hud.phase !== "choosing"}
                                        aria-pressed={isSelected}
                                        onClick={() => sceneRef.current?.selectMove(index)}
                                        className={`flex min-h-24 w-full flex-col justify-between gap-2 rounded-md border p-4 text-left text-slate-100 transition disabled:cursor-not-allowed disabled:opacity-50 ${typeTheme.border
                                            } ${isSelected ? typeTheme.cardSelectedBg : typeTheme.cardBg} ${isSelected
                                                ? "ring-2 ring-sky-400 shadow-[0_0_0_1px_rgba(56,189,248,0.35)]"
                                                : ""
                                            }`}
                                    >
                                        <div className="flex w-full items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="truncate text-base font-bold tracking-tight">
                                                    {move.name}
                                                </div>
                                                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                                    <span
                                                        className={`rounded border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${typeTheme.badge}`}
                                                    >
                                                        {move.type || "normal"}
                                                    </span>
                                                    {effBadge && (
                                                        <span
                                                            className={`rounded border px-2 py-0.5 text-[10px] font-bold tracking-wide ${effBadge.className}`}
                                                        >
                                                            {effBadge.label}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <span className="shrink-0 rounded bg-slate-950/75 px-2.5 py-1 text-xs font-semibold text-slate-200">
                                                PWR {move.power}
                                            </span>
                                        </div>

                                        <p className="line-clamp-2 text-xs leading-relaxed text-slate-200/90">
                                            {move.description || "Golpe sem descrição disponível."}
                                        </p>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    {hud.phase === "finished" && (
                        <button
                            type="button"
                            onClick={() => sceneRef.current?.restart()}
                            className="min-h-24 shrink-0 rounded-md border border-emerald-500/60 bg-emerald-600/20 px-6 py-4 text-base font-semibold text-emerald-200 transition hover:bg-emerald-600/30"
                        >
                            Jogar novamente
                        </button>
                    )}
                </section>
            </div>

            {/* Coluna direita: 6 slots do oponente */}
            <aside
                aria-label="Equipe do oponente"
                className="order-3 flex flex-col justify-between rounded border border-slate-800 bg-slate-900/60 p-2.5 lg:order-none"
            >
                <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <span>Oponente</span>
                    <span>
                        {aliveEnemyCount}/{hud.enemyParty.length}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:flex lg:flex-1 lg:flex-col lg:justify-between lg:gap-2">
                    {hud.enemyParty.map((slot) => (
                        <div
                            key={`enemy-slot-${slot.index}`}
                            className={`flex items-center gap-2.5 rounded border px-2.5 py-2 text-xs ${getEnemySlotClass(
                                slot
                            )}`}
                        >
                            {slot.spriteUrl && (
                                <img
                                    src={toFrontSpriteUrl(slot.spriteUrl)}
                                    alt={slot.name}
                                    className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14 xl:h-28 xl:w-28"
                                />
                            )}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                    <span className="truncate font-medium">{slot.name}</span>
                                    {slot.isActive && !slot.fainted && (
                                        <span className="shrink-0 rounded bg-rose-400/20 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300">
                                            ATIVO
                                        </span>
                                    )}
                                </div>
                                <div className="mt-0.5 text-[11px] text-slate-400">
                                    {slot.fainted ? "Desmaiado" : `HP ${slot.currentHp}/${slot.maxHp}`}
                                </div>
                                {renderSlotHpBar(slot)}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
}