import { Suspense } from "react";
import { Pokemon } from "../../_components/Pokemon/Pokemon";
import Loader from "@/app/_components/Loader/Loader";

export default function Hero() {
    return (
        <section className='h-96'>
            <Suspense fallback={<Loader />}>
                <Pokemon />
            </Suspense>
        </section>
    )
}
