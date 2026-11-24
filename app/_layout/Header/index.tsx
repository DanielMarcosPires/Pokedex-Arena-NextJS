"use client";

import Link from "next/link";
import Nav from "../../_components/Nav/Nav";
import { useTypeTheme } from "@/app/hook/useTypeTheme";
import { usePokemonTheme } from "@/app/context/pokemonThemeContext";

export default function Header() {
  const { types,pokemon } = usePokemonTheme();

  const { cardClassName, surfaceStyle } = useTypeTheme({
    primaryType: types[0],
    secondaryType: types[1],
  });
  console.log(pokemon)
  return (
    <header
      className={`text-2xl flex items-center justify-between shadow-lg z-10 px-8 transition-colors duration-500 ${cardClassName}`}
       style={surfaceStyle}
    >
      <h2 className="py-4 font-medium whitespace-nowrap">PokeArena</h2>
      <Nav className="flex items-center space-x-4">
        <Link className="py-4 px-5 rounded-lg hover:underline whitespace-nowrap shrink-0" href="/">
          Game
        </Link>
        <Link className="py-4 px-5 rounded-lg hover:underline whitespace-nowrap shrink-0" href="/about">
          About
        </Link>
      </Nav>
    </header>
  );
}