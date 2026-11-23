export interface PokemonStats {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
}

export interface PokeApiPokemonResponse {
    id: number;
    name: string;
    types: Array<{ 
        slot: number; 
        type: { 
            name: string; 
            url: string 
        } 
    }>;
    abilities: Array<{ 
        ability: { 
            name: string; 
            url: string }; 
            is_hidden: boolean; 
            slot: number 
        }>;
    stats: Array<{ 
        base_stat: number; 
        stat: { 
            name: string; 
            url: string } 
        }>;
    sprites: {
        front_default: string | null;
        other?: {
            "official-artwork"?: {
                front_default: string | null;
            };
        };
    };
}

export class Pokemon {
    private readonly serialId: string;
    private readonly gen: string | null;
    private readonly name: string;
    private readonly types: string[];
    private readonly abilities: string[];
    private readonly stats: PokemonStats;
    private readonly sprite: string | null;

    constructor(pokemon: PokeApiPokemonResponse, gen: string | null = null) {
        this.serialId = String(pokemon.id);
        this.gen = gen;
        this.name = pokemon.name;
        this.types = pokemon.types.map((item) => item.type.name);
        this.abilities = pokemon.abilities.map((item) => item.ability.name);
        this.sprite =
            pokemon.sprites.other?.["official-artwork"]?.front_default ??
            pokemon.sprites.front_default ??
            null;

        const statMap = new Map(
            pokemon.stats.map((item) => [item.stat.name, item.base_stat])
        );

        this.stats = {
            hp: statMap.get("hp") ?? 0,
            attack: statMap.get("attack") ?? 0,
            defense: statMap.get("defense") ?? 0,
            specialAttack: statMap.get("special-attack") ?? 0,
            specialDefense: statMap.get("special-defense") ?? 0,
            speed: statMap.get("speed") ?? 0,
        };
    }

    public getSerialId(): string {
        return this.serialId;
    }

    public getGen(): string | null {
        return this.gen;
    }

    public getName(): string {
        return this.name;
    }

    public getTypes(): string[] {
        return this.types;
    }

    public getAbilities(): string[] {
        return this.abilities;
    }

    public getStats(): PokemonStats {
        return this.stats;
    }

    public getSprite(): string | null {
        return this.sprite;
    }
}