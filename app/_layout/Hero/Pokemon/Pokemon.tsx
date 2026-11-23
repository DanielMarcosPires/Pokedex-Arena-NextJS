"use server";
import { ObjectPokemon } from "@/app/_classes/objectPokemon";
import { DEFAULT_STYLE, TYPE_STYLES } from "@/app/_style/type_styles";
import SyncPokemonTheme from "./SyncPokemonTheme"; // ajuste o caminho se necessário
import { randomInt } from "crypto";

export async function Pokemon() {
  const pokemons = await ObjectPokemon();
  const randomPokemon = randomInt(pokemons.length)
  const pokemon = pokemons[randomPokemon];
  const types = pokemon.getTypes();

  const primaryType = types[0]?.toLowerCase() ?? "";
  const secondaryType = types[1]?.toLowerCase() ?? "";

  const primaryStyle = TYPE_STYLES[primaryType] ?? DEFAULT_STYLE;
  const secondaryStyle = secondaryType
    ? (TYPE_STYLES[secondaryType] ?? DEFAULT_STYLE)
    : primaryStyle;

  const backgroundStyle = secondaryType
    ? `linear-gradient(135deg, ${primaryStyle.gradientHex}33, ${secondaryStyle.gradientHex}33)`
    : `linear-gradient(135deg, ${primaryStyle.gradientHex}33, transparent)`;

  return (
    <div
      className={`flex flex-col items-center text-center h-full p-6 ${primaryStyle.cardBg}`}
      style={{
        backgroundImage: backgroundStyle,
        borderColor: secondaryType ? secondaryStyle.gradientHex : primaryStyle.gradientHex,
      }}
    >
      <SyncPokemonTheme types={types} />
      <img
        width={300}
        src={`${pokemon.getSprite()}`}
        alt={`${pokemon.getName()}`}
      />
      <footer className="flex text-xl items-center justify-around w-full">
        <ul className="flex gap-2">
          {types.map((type) => {
            const normalizedType = type.toLowerCase();
            const typeStyle = TYPE_STYLES[normalizedType] ?? DEFAULT_STYLE;

            return (
              <li
                key={type}
                className={`px-5 py-1 rounded-full text-lg font-medium ${typeStyle.badge}`}
              >
                {type.toUpperCase()}
              </li>
            );
          })}
        </ul>
      </footer>
    </div>
  );
}