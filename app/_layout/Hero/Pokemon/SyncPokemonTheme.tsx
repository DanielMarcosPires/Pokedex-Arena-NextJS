"use client";

import { useEffect } from "react";
import { usePokemonTheme } from "@/app/context/pokemonThemeContext";

export default function SyncPokemonTheme({ types }: { types: string[] }) {
  const { setTypes } = usePokemonTheme();

  useEffect(() => {
    setTypes(types);
  }, [types, setTypes]);

  return null;
}