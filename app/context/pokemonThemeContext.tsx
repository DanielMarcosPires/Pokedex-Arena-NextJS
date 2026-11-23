"use client";

import React, { createContext, useContext, useState } from "react";

interface PokemonThemeContextType {
  types: string[];
  setTypes: (types: string[]) => void;
}

const PokemonThemeContext = createContext<PokemonThemeContextType | undefined>(
  undefined
);

export function PokemonThemeProvider({
  children,
  initialTypes = [],
}: {
  children: React.ReactNode;
  initialTypes?: string[];
}) {
  const [types, setTypes] = useState<string[]>(initialTypes);

  return (
    <PokemonThemeContext.Provider value={{ types, setTypes }}>
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