import PokemonMoves from "../_components/PokemonMoves/PokemonMoves";
import { PokemonStats } from "../_components/PokemonStats/PokemonStats";
import Description from "../_layout/Description";
import Hero from "../_layout/Hero/Hero";

export default function Home() {
  return (
    <main>
      <Hero />
      <Description>
        <PokemonStats />
        <PokemonMoves />
      </Description>
    </main>
  );
}