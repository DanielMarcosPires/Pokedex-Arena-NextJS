"use client";

import React from "react";
import { usePokemonTheme } from "@/app/context/pokemonThemeContext";
import { DEFAULT_STYLE, TYPE_STYLES } from "@/app/_style/type_styles";
import Header from "../Header";

export default function ThemeShell({ children }: { children: React.ReactNode }) {
  const { types } = usePokemonTheme();

  const primaryType = types[0]?.toLowerCase() ?? "grass";
  const secondaryType = types[1]?.toLowerCase();

  const primaryStyle = TYPE_STYLES[primaryType] ?? DEFAULT_STYLE;
  const secondaryStyle = secondaryType
    ? (TYPE_STYLES[secondaryType] ?? DEFAULT_STYLE)
    : null;

  const pageBackground = secondaryStyle
    ? `linear-gradient(160deg, ${primaryStyle.gradientHex}26 0%, #09090b 45%, ${secondaryStyle.gradientHex}26 100%)`
    : `linear-gradient(160deg, ${primaryStyle.gradientHex}26 0%, #09090b 75%)`;

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundImage: pageBackground}}
    >
      <Header/>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}