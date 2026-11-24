"use client";

import { useEffect } from "react";
import { PokemonInfoData, usePokemonTheme } from "@/app/context/pokemonThemeContext";

interface SyncPokemonThemeProps {
  types: string[];
  pokemon?: PokemonInfoData | null;
}

export default function SyncPokemonTheme({ types, pokemon }: SyncPokemonThemeProps) {
  const { setTypes, setPokemon } = usePokemonTheme();

  useEffect(() => {
    setTypes(types);
    if (pokemon) {
      setPokemon(pokemon);
    }
  }, [types, pokemon, setTypes, setPokemon]);

  return null;
}