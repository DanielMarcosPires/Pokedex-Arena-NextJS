import { Suspense } from "react";
import { Pokemon } from "./Pokemon/Pokemon";

export default function Hero() {
    return (
        <section className='bg-black h-96'>
            <Suspense fallback={<>Loading pokemon...</>}>
                <Pokemon />
            </Suspense>
        </section>
    )
}
