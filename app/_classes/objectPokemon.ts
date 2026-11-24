import { getPokemonInfo, getPokemonList } from "@/api/_pokeAPI/data";
import { Pokemon, PokeApiPokemonResponse } from "./(privateClass)/Pokemon";

interface PokemonSummary {
  name: string;
  url: string;
}

interface ApiData {
  data: {
    count: number;
    next: string | null;
    results: PokemonSummary[];
  };
}

export async function ObjectPokemon() {
  const { data }: ApiData = await getPokemonList();
  const names = data.results.map((item) => item.name);

  const pokemons = await Promise.all(
    names.map((name) => getPokemonInfo(name))
  );

  console.log(pokemons[0])
  return pokemons.map((pokemon: PokeApiPokemonResponse) => new Pokemon(pokemon));
}