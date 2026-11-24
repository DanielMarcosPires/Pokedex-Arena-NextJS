"use client";

import React, { createContext, useContext, useState } from "react";

export interface PokemonInfoData {
  name: string;
  types: string[];
  abilities: string[];
  description?: string;
  sprite?: string;
  stats: {
    hp: number,
    attack: number,
    defense: number,
    specialAttack: number,
    specialDefense: number,
    speed: number
  }
}

interface PokemonThemeContextType {
  types: string[];
  setTypes: (types: string[]) => void;
  pokemon: PokemonInfoData | null;
  setPokemon: (pokemon: PokemonInfoData | null) => void;
}

const PokemonThemeContext = createContext<PokemonThemeContextType | undefined>(
  undefined
);

export function PokemonThemeProvider({
  children,
  initialTypes = [],
  initialPokemon = null,
}: {
  children: React.ReactNode;
  initialTypes?: string[];
  initialPokemon?: PokemonInfoData | null;
}) {
  const [types, setTypes] = useState<string[]>(initialTypes);
  const [pokemon, setPokemon] = useState<PokemonInfoData | null>(initialPokemon);

  return (
    <PokemonThemeContext.Provider
      value={{ types, setTypes, pokemon, setPokemon }}
    >
      {children}
    </PokemonThemeContext.Provider>
  );
}

export function usePokemonTheme() {
  const context = useContext(PokemonThemeContext);
  if (!context) {
    throw new Error(
      "usePokemonTheme deve ser usado dentro de um PokemonThemeProvider"
    );
  }
  return context;
}