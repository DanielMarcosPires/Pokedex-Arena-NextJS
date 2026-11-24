"use client";

import React, { useMemo, useState } from "react";
import { usePokemonTheme } from "@/app/context/pokemonThemeContext";
import MoveItem from "./MoveItem";
import { useMoveDetails } from "../agrupamento/useMoveDetails";
import { groupMovesByMethod } from "./MoveHelpers";

export default function Moves() {
  const { pokemon } = usePokemonTheme();
  const [expandedMove, setExpandedMove] = useState<string | null>(null);

  const categorizedMoves = useMemo(
    () => groupMovesByMethod(pokemon?.moves),
    [pokemon?.moves]
  );

  const allVisibleMoves = useMemo(
    () => categorizedMoves.flatMap((group) => group.moves),
    [categorizedMoves]
  );

  const detailsCache = useMoveDetails(allVisibleMoves);

  if (!pokemon) return null;

  function handleToggleMove(accordionKey: string) {
    setExpandedMove((prev) => (prev === accordionKey ? null : accordionKey));
  }

  return (
    <div className="py-6 space-y-6">
      <h3 className="text-2xl font-semibold">Moves:</h3>

      <div className="flex flex-wrap gap-8 justify-between">
          {categorizedMoves.map((group) => (
            <section key={group.id} className="space-y-3 flex-1">
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <h4 className="text-lg font-semibold opacity-90">{group.title}</h4>
                <span className="text-xs opacity-60">
                  {group.moves.length}{" "}
                  {group.moves.length === 1 ? "golpe" : "golpes"}
                </span>
              </div>
              <ul className="space-y-2">
                {group.moves.map((move) => {
                  const accordionKey = `${group.id}-${move.name}`;
                  return (
                    <MoveItem
                      key={accordionKey}
                      move={move}
                      details={detailsCache[move.name]}
                      isOpen={expandedMove === accordionKey}
                      onToggle={() => handleToggleMove(accordionKey)}
                    />
                  );
                })}
              </ul>
            </section>
          ))}
      </div>
    </div>
  );
}