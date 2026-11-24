"use client"

import { usePokemonTheme } from '@/app/context/pokemonThemeContext';
import { useTypeTheme } from '@/app/hook/useTypeTheme';
import { BiLoaderCircle } from 'react-icons/bi';
import { LuLoaderCircle } from 'react-icons/lu';

export default function Loader() {
    const {cardClassName,surfaceStyle} = useTypeTheme()
    return (
        <div className={`w-full h-full flex justify-center transition-colors duration-1000 items-center ${cardClassName}`} style={surfaceStyle}>
            <LuLoaderCircle className={`animate-spin`} size={90} />
        </div>
    )
}
