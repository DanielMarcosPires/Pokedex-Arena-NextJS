"use client";

import { PokemonStats } from "@/app/_classes/(privateClass)/Pokemon";
import { DEFAULT_STYLE, TYPE_STYLES } from "@/app/_style/type_styles";
import { usePokemonTheme } from "@/app/context/pokemonThemeContext";

const MAX_STAT = 255;

export default function Stats() {
  const { types, pokemon } = usePokemonTheme();

  if (!pokemon) return null;

  const pokemonStats: PokemonStats = {
    hp: pokemon.stats?.hp ?? 0,
    attack: pokemon.stats?.attack ?? 0,
    defense: pokemon.stats?.defense ?? 0,
    specialAttack: pokemon.stats?.specialAttack ?? 0,
    specialDefense: pokemon.stats?.specialDefense ?? 0,
    speed: pokemon.stats?.speed ?? 0,
  };

  const primaryType = types?.[0]?.toLowerCase() ?? pokemon.types?.[0]?.toLowerCase() ?? "";
  const barColor = TYPE_STYLES[primaryType]?.gradientHex ?? DEFAULT_STYLE.gradientHex;

  const statItems = [
    { label: "HP", value: pokemonStats.hp },
    { label: "Ataque", value: pokemonStats.attack },
    { label: "Defesa", value: pokemonStats.defense },
    { label: "Sp. Atk", value: pokemonStats.specialAttack },
    { label: "Sp. Def", value: pokemonStats.specialDefense },
    { label: "Velocidade", value: pokemonStats.speed },
  ] as const;

  return (
    <div className="py-10 space-y-3 flex-1">
      <h3 className="text-2xl font-semibold">Stats:</h3>

      <ul className="space-y-2.5">
        {statItems.map(({ label, value }) => {
          const percent = Math.min(100, Math.round((value*1.25 / MAX_STAT) * 100));

          return (
            <li key={label} className="grid grid-cols-[90px_44px_1fr] items-center gap-3">
              <span className="text-lg opacity-80">{label}</span>
              <span className="text-lg font-mono font-bold text-right">{value}</span>
              <div className="w-full rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full rounded-full border-2 py-1.5 shadow-2xl border-black transition-[width] duration-300 ease-out"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}