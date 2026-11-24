import axios from "axios";

const pokeAPI = "https://pokeapi.co/api/v2";

export const api = axios.create({
    baseURL: pokeAPI,
    headers: {
        "Content-Type": "application/json",
    },
});

export async function getPokemonList(limit = 151, offset = 0) {
    return api.get("/pokemon", {
        params: { limit, offset },
    });
}

export async function getPokemonInfo(name = "Mightyena") {
    const { data } = await api.get(`/pokemon/${name}`);
    return data;
}
export async function searchPokemonInfo(name = "1") {
    const { data } = await api.get(`/pokemon/${name}`);
    return data;
}