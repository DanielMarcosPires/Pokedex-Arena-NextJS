import React from "react";
import { PokemonMoveSummary } from "@/app/_classes/(privateClass)/Pokemon";

export interface MoveDetails {
  type: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  damageClass: string;
  description: string;
}

export interface MoveCategoryGroup {
  id: string;
  title: string;
  moves: PokemonMoveSummary[];
}

export function formatDamageClass(damageClass?: string): string {
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

export function formatLearnMethod(learnMethod?: string): {
  label: string;
  badgeClass: string;
  detailText: string;
} {
  switch (learnMethod) {
    case "egg":
      return {
        label: "Ovo",
        badgeClass: "bg-pink-500/20 text-pink-200 border border-pink-400/30",
        detailText: "Ovo (Egg Move)",
      };
    case "machine":
      return {
        label: "TM / HM",
        badgeClass: "bg-cyan-500/20 text-cyan-200 border border-cyan-400/30",
        detailText: "TM / HM (Machine)",
      };
    case "level-up":
      return {
        label: "Nível",
        badgeClass: "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30",
        detailText: "Subindo de nível",
      };
    case "tutor":
      return {
        label: "Tutor",
        badgeClass: "bg-indigo-500/20 text-indigo-200 border border-indigo-400/30",
        detailText: "Move Tutor",
      };
    default:
      return {
        label: learnMethod ?? "—",
        badgeClass: "bg-white/10 text-white/75",
        detailText: learnMethod ?? "Desconhecido",
      };
  }
}

export function getMoveGradient(
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

export function extractMoveDescription(data: {
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

export function groupMovesByMethod(
  allMoves: PokemonMoveSummary[] = []
): MoveCategoryGroup[] {
  const levelMoves = allMoves
    .filter((move) => move.learnMethod === "level-up")
    .sort(
      (a, b) =>
        a.levelLearnedAt - b.levelLearnedAt || a.name.localeCompare(b.name)
    );

  const eggMoves = allMoves
    .filter((move) => move.learnMethod === "egg")
    .sort((a, b) => a.name.localeCompare(b.name));

  const machineMoves = allMoves
    .filter((move) => move.learnMethod === "machine")
    .sort((a, b) => a.name.localeCompare(b.name));

  return [
    { id: "level-up", title: "Por Nível", moves: levelMoves },
    { id: "egg", title: "Ovo (Egg Moves)", moves: eggMoves },
    { id: "machine", title: "TM / HM", moves: machineMoves },
  ].filter((group) => group.moves.length > 0);
}