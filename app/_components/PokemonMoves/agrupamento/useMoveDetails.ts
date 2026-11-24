"use client";

import { useEffect, useState } from "react";
import { PokemonMoveSummary } from "@/app/_classes/(privateClass)/Pokemon";
import { extractMoveDescription, MoveDetails } from "../Moves/MoveHelpers";

export function useMoveDetails(moves: PokemonMoveSummary[]) {
  const [detailsCache, setDetailsCache] = useState<Record<string, MoveDetails>>(
    {}
  );

  useEffect(() => {
    if (!moves.length) return;

    let cancelled = false;
    const missingMoves = moves.filter((move) => !detailsCache[move.name]);
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
  }, [moves]);

  return detailsCache;
}