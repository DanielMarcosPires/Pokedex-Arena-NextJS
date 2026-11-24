"use client";

import React from "react";
import { BiDownArrow } from "react-icons/bi";
import { DEFAULT_STYLE, TYPE_STYLES } from "@/app/_style/type_styles";
import { PokemonMoveSummary } from "@/app/_classes/(privateClass)/Pokemon";
import { MoveDetails, formatLearnMethod, getMoveGradient, formatDamageClass } from "./MoveHelpers";


interface MoveItemProps {
  move: PokemonMoveSummary;
  details?: MoveDetails;
  isOpen: boolean;
  onToggle: () => void;
}

export default function MoveItem({
  move,
  details,
  isOpen,
  onToggle,
}: MoveItemProps) {
  const learnInfo = formatLearnMethod(move.learnMethod);
  const normalizedType = details?.type?.toLowerCase().trim() ?? "";
  const typeStyle = TYPE_STYLES[normalizedType] ?? DEFAULT_STYLE;
  const cardGradientStyle = details
    ? getMoveGradient(details.damageClass, typeStyle.gradientHex)
    : undefined;

  return (
    <li
      style={cardGradientStyle}
      className="rounded-xl bg-white/10 border border-white/10 overflow-hidden transition-colors"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full text-lg px-3.5 py-4 flex items-center justify-between gap-2 hover:bg-white/10 transition"
      >
        <span className="inline-flex items-center gap-2 flex-wrap text-left">
          {move.levelLearnedAt > 0 ? (
            <span className="opacity-75">Lv.{move.levelLearnedAt}</span>
          ) : (
            <span
              className={`px-2 py-0.5 rounded-md text-xs font-medium ${learnInfo.badgeClass}`}
            >
              {learnInfo.label}
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
                <span>
                  Aprendizado: <strong>{learnInfo.detailText}</strong>
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
}