"use client"
import { useTypeTheme } from "@/app/hook/useTypeTheme";
import Abilities from "./Abilities/Abilities";
import Stats from "./Stats/Stats";
import { usePokemonTheme } from "@/app/context/pokemonThemeContext";

export function PokemonStats() {
  const { types } = usePokemonTheme();
  
      const { cardClassName, surfaceStyle } = useTypeTheme({
          primaryType: types[0],
          secondaryType: types[1],
      });

  return (
    <div
      className={`lg:flex gap-8 w-full border-t-2 z-20 p-5 text-white transition-colors duration-300 ${cardClassName}`}
      style={surfaceStyle}
    >
      <Abilities />
      <Stats/>
    </div>
  );
}