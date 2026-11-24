"use client";

import React, { useEffect, useState } from "react";
import { usePokemonTheme } from "@/app/context/pokemonThemeContext";
import { DEFAULT_STYLE, TYPE_STYLES } from "@/app/_style/type_styles";
import { BiDownArrow } from "react-icons/bi";

const MAX_MOVES = 12;

interface MoveDetails {
  type: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  damageClass: string;
  description: string;
}

function formatDamageClass(damageClass?: string): string {
  switch (damageClass) {
    case "physical":
      return "Físico";
    case "special":
      return "Especial";
    case "status":
      return "Status";
    default:
      return damageClass ?? "—";
  }
}

function getMoveGradient(
  damageClass: string | undefined,
  hexColor: string
): React.CSSProperties | undefined {
  if (damageClass === "physical") {
    return {
      background: `linear-gradient(90deg, ${hexColor}2e 0%, ${hexColor}12 55%, rgba(255,255,255,0.06) 100%)`,
      borderColor: `${hexColor}66`,
    };
  }

  if (damageClass === "special") {
    return {
      background: `linear-gradient(120deg, ${hexColor}3d 0%, rgba(255,255,255,0.07) 50%, ${hexColor}24 100%)`,
      borderColor: `${hexColor}70`,
    };
  }

  return undefined;
}

function extractMoveDescription(data: {
  effect_chance?: number | null;
  effect_entries?: Array<{
    short_effect: string;
    language: { name: string };
  }>;
  flavor_text_entries?: Array<{
    flavor_text: string;
    language: { name: string };
  }>;
}): string {
  const englishEffect = data.effect_entries?.find(
    (entry) => entry.language.name === "en"
  );

  if (englishEffect?.short_effect) {
    const cleanEffect = englishEffect.short_effect.replaceAll("\n", " ").trim();
    return data.effect_chance != null
      ? cleanEffect.replaceAll("$effect_chance", String(data.effect_chance))
      : cleanEffect;
  }

  const englishFlavor = data.flavor_text_entries?.find(
    (entry) => entry.language.name === "en"
  );

  if (englishFlavor?.flavor_text) {
    return englishFlavor.flavor_text.replace(/[\n\f\r]+/g, " ").trim();
  }

  return "Sem descrição disponível para este movimento.";
}

export default function Moves() {
  const { pokemon } = usePokemonTheme();
  const [expandedMove, setExpandedMove] = useState<string | null>(null);
  const [detailsCache, setDetailsCache] = useState<Record<string, MoveDetails>>({});

  const visibleMoves = (pokemon?.moves ?? []).slice(0, MAX_MOVES);

  useEffect(() => {
    if (!visibleMoves.length) return;

    let cancelled = false;

    const missingMoves = visibleMoves.filter((move) => !detailsCache[move.name]);
    if (!missingMoves.length) return;

    Promise.all(
      missingMoves.map(async (move) => {
        try {
          const res = await fetch(`https://pokeapi.co/api/v2/move/${move.name}`);
          if (!res.ok) return null;
          const data = await res.json();

          const parsed: MoveDetails = {
            type: data.type?.name ?? "normal",
            power: data.power ?? null,
            accuracy: data.accuracy ?? null,
            pp: data.pp ?? null,
            damageClass: data.damage_class?.name ?? "status",
            description: extractMoveDescription(data),
          };

          return [move.name, parsed] as const;
        } catch {
          return null;
        }
      })
    ).then((entries) => {
      if (cancelled) return;

      setDetailsCache((prev) => {
        const next = { ...prev };
        for (const entry of entries) {
          if (entry) {
            const [name, details] = entry;
            next[name] = details;
          }
        }
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [pokemon?.name]);

  if (!pokemon) return null;

  function handleToggleMove(moveName: string) {
    setExpandedMove((prev) => (prev === moveName ? null : moveName));
  }

  return (
    <div className="py-6 space-y-3">
      <h3 className="text-2xl font-semibold">Movimentos:</h3>

      <ul className="space-y-2">
        {visibleMoves.map((move) => {
          const isOpen = expandedMove === move.name;
          const details = detailsCache[move.name];
          const normalizedType = details?.type?.toLowerCase().trim() ?? "";
          const typeStyle = TYPE_STYLES[normalizedType] ?? DEFAULT_STYLE;
          const cardGradientStyle = details
            ? getMoveGradient(details.damageClass, typeStyle.gradientHex)
            : undefined;

          return (
            <li
              key={move.name}
              style={cardGradientStyle}
              className="rounded-xl bg-white/10 border border-white/10 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => handleToggleMove(move.name)}
                aria-expanded={isOpen}
                className="w-full text-lg px-3.5 py-4 flex items-center justify-between gap-2 hover:bg-white/10 transition"
              >
                <span className="inline-flex items-center gap-2 flex-wrap text-left">
                  {move.levelLearnedAt > 0 && (
                    <span className="opacity-75">
                      Lv.{move.levelLearnedAt}
                    </span>
                  )}
                  <span className="capitalize font-medium">
                    {move.name.replaceAll("-", " ")}
                  </span>
                </span>

                <span className="inline-flex items-center gap-2 shrink-0">
                  {details?.damageClass && (
                    <span
                      className={`px-2 py-0.5 rounded-md text-sm font-medium ${
                        details.damageClass === "physical"
                          ? "bg-amber-500/20 text-amber-200 border border-amber-400/30"
                          : details.damageClass === "special"
                          ? "bg-violet-500/20 text-violet-200 border border-violet-400/30"
                          : "bg-white/10 text-white/75"
                      }`}
                    >
                      {formatDamageClass(details.damageClass)}
                    </span>
                  )}

                  {details?.type && (
                    <span
                      className={`px-2 py-0.5 rounded-md text-sm font-semibold uppercase tracking-wide ${typeStyle.badge}`}
                    >
                      {details.type}
                    </span>
                  )}

                  <span
                    className={`text-xs opacity-75 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    <BiDownArrow />
                  </span>
                </span>
              </button>

              {isOpen && (
                <div className="px-4 py-3 bg-black/25 border-t border-white/10 text-lg sm:text-sm space-y-2.5">
                  {details ? (
                    <>
                      <div className="flex flex-wrap gap-x-5 gap-y-1.5 opacity-90">
                        <span>
                          Poder: <strong>{details.power ?? "—"}</strong>
                        </span>
                        <span>
                          Precisão:{" "}
                          <strong>
                            {details.accuracy ? `${details.accuracy}%` : "—"}
                          </strong>
                        </span>
                        <span>
                          PP: <strong>{details.pp ?? "—"}</strong>
                        </span>
                      </div>

                      <h2 className="text-xl font-bold">Description:</h2>

                      <p className="opacity-85 leading-relaxed">
                        {details.description}
                      </p>
                    </>
                  ) : (
                    <p className="opacity-70">Carregando detalhes...</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}