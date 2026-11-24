"use server";

import { ObjectPokemon } from "@/app/_classes/objectPokemon";
import { DEFAULT_STYLE, TYPE_STYLES } from "@/app/_style/type_styles";
import { getTypeTheme } from "@/app/_style/getTypeTheme";
import SyncPokemonTheme from "./SyncPokemonTheme";
import { randomInt } from "crypto";
import Typing from "./Typing";

export async function Pokemon() {
  const pokemons = await ObjectPokemon();
  if (!pokemons?.length) return null;

  const randomPokemon = randomInt(pokemons.length);
  const pokemon = pokemons[randomPokemon];
  const types = pokemon.types;

  console.log(pokemon.stats)


  const name = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)

  const { cardClassName, surfaceStyle} = getTypeTheme({
    primaryType: types[0],
    secondaryType: types[1],
  });


  return (
    <div
      className={`flex justify-center items-center lg:flex-row text-center h-full p-6 ${cardClassName}`}
      style={surfaceStyle}
    >
      <SyncPokemonTheme
        types={types}
        pokemon={{
          name: pokemon.name,
          types: pokemon.types,
          abilities: pokemon.abilities,
          sprite: ``,
          stats: pokemon.stats
        }}
      />
      <div className="flex justify-center flex-col sm:flex-row w-1/2">
        <img
          width={300}
          src={pokemon.getSprites().other["official-artwork"].front_default}
          alt={pokemon.name}
        />
        <footer className="flex flex-col sm:text-start justify-center
        text-center text-xl gap-4 w-full">
          <div>
            <h2 className="text-4xl text-nowrap">{name}</h2>
          </div>
          <ul className="flex flex-wrap justify-center gap-2">
            {types.map((type: string) => {
              return (
                <Typing key={type} text={type}>
                  {type.toUpperCase()}
                </Typing>
              );
            })}
          </ul>
        </footer>
      </div>
    </div>
  );
}