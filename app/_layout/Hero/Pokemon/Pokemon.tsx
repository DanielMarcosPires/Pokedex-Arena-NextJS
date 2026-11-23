"use server"
import { ObjectPokemon } from "@/app/_classes/objectPokemon"
import { DEFAULT_STYLE, TYPE_STYLES } from "@/app/_style/type_styles";
import { randomInt } from "crypto"


export async function Pokemon() {
    const pokemons = await ObjectPokemon();
    const pokemon = pokemons[3];
    const types = pokemon.getTypes();

    const primaryType = types[0]?.toLowerCase() ?? "";
    const primaryStyle = TYPE_STYLES[primaryType] ?? DEFAULT_STYLE;

    return (
        <div
            className={`flex justify-center items-center text-center h-full p-6 border ${primaryStyle.cardBg}`}
            style={{
                backgroundImage: `linear-gradient(135deg, ${primaryStyle.gradientHex}22, transparent)`,
            }}
        >
            <img
                width={300}
                src={`${pokemon.getSprite()}`}
                alt={`${pokemon.getName()}`}
            />
        </div>
    );
}
