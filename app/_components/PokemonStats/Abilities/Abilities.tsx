"use client";

import { useState } from "react";
import { BiDownArrow } from "react-icons/bi";
import { usePokemonTheme } from "@/app/context/pokemonThemeContext";
import { useTypeTheme } from "@/app/hook/useTypeTheme";

function extractAbilityDescription(data: {
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
    return englishEffect.short_effect.replaceAll("\n", " ").trim();
  }

  const englishFlavor = data.flavor_text_entries?.find(
    (entry) => entry.language.name === "en"
  );

  if (englishFlavor?.flavor_text) {
    return englishFlavor.flavor_text.replace(/[\n\f\r]+/g, " ").trim();
  }

  return "Sem descrição disponível para esta habilidade.";
}

export default function Abilities() {
  const { types, pokemon } = usePokemonTheme();
  const [expandedAbility, setExpandedAbility] = useState<string | null>(null);
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [loadingAbility, setLoadingAbility] = useState<string | null>(null);

  const { cardClassName, surfaceStyle } = useTypeTheme({
    primaryType: types[0],
    secondaryType: types[1],
  });

  if (!pokemon) return null;

  async function handleToggleAbility(ability: string) {
    if (expandedAbility === ability) {
      setExpandedAbility(null);
      return;
    }

    setExpandedAbility(ability);

    if (descriptions[ability]) return;

    setLoadingAbility(ability);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/ability/${ability}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const description = extractAbilityDescription(data);

      setDescriptions((prev) => ({ ...prev, [ability]: description }));
    } catch {
      setDescriptions((prev) => ({
        ...prev,
        [ability]: "Não foi possível carregar a descrição.",
      }));
    } finally {
      setLoadingAbility((prev) => (prev === ability ? null : prev));
    }
  }

  return (
    <div className="flex-1 space-y-3">
      <h3 className="text-2xl font-semibold tracking-wide">Abilities:</h3>

      <ul className="flex flex-col md:flex-row gap-3">
        {pokemon.abilities.map((ability) => {
          const isOpen = expandedAbility === ability;
          const isLoading = loadingAbility === ability;

          return (
            <li
              key={ability}
              style={surfaceStyle}
              className={`w-full rounded-xl overflow-hidden border border-white/10 transition-colors ${cardClassName}`}
            >
              <button
                type="button"
                onClick={() => handleToggleAbility(ability)}
                aria-expanded={isOpen}
                className="w-full px-3.5 py-3 flex items-center justify-between gap-2 text-lg text-white/90 hover:bg-white/10 transition"
              >
                <span className="capitalize font-medium text-left">
                  {ability.replaceAll("-", " ")}
                </span>

                <span
                  className={`text-xs opacity-75 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  <BiDownArrow />
                </span>
              </button>

              {isOpen && (
                <div className="px-3.5 py-2.5 bg-black/25 border-t border-white/10 text-lg text-white/80 leading-relaxed">
                  {isLoading ? (
                    <p className="opacity-70">Carregando descrição...</p>
                  ) : (
                    <p>{descriptions[ability]}</p>
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