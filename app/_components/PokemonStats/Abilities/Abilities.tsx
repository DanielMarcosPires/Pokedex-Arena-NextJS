"use client";

import { usePokemonTheme } from "@/app/context/pokemonThemeContext";
import { useTypeTheme } from "@/app/hook/useTypeTheme";


export default function Abilities() {
    const { types, pokemon } = usePokemonTheme();

    const { cardClassName, surfaceStyle } = useTypeTheme({
        primaryType: types[0],
        secondaryType: types[1],
    });

    return (
        <div className="flex-1 px-5">
            <h3 className="text-2xl font-semibold tracking-wide">
                Habilidades:
            </h3>
            <ul className="flex flex-wrap md:flex-nowrap gap-4">
                {pokemon?.abilities.map((ability) => (
                    <li key={ability} className={`mt-2 w-full text-lg text-white/80 p-2 rounded-lg`} style={surfaceStyle}>
                        {ability.toUpperCase()}
                    </li>
                ))}
            </ul>
        </div>
    )
}
