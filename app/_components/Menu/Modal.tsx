"use client";

import { usePokemonTheme } from "@/app/context/pokemonThemeContext";
import { useTypeTheme } from "@/app/hook/useTypeTheme";
import { ComponentProps, CSSProperties, useEffect } from "react";
import { CgClose } from "react-icons/cg";

interface MenuProps extends ComponentProps<"div"> {
    type?: string;
    secondType?: string;
    onClose?: () => void;
}

export default function Menu({
    children,
    className = "",
    onClose,
    onClick,
    ...props
}: MenuProps) {

    const { types } = usePokemonTheme();

    const {cardClassName,surfaceStyle} = useTypeTheme({
        primaryType:types[0],
        secondaryType:types[1],
    })

    const handleClose = () => {
        if (onClose) {
            onClose();
            return;
        }
        onClick?.({} as React.MouseEvent<HTMLDivElement>);
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            onClick={onClick}
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs ${className}`}
            {...props}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`w-full h-5/6 max-w-sm rounded-2xl border-2 p-6 text-white transition-colors duration-300 ${cardClassName}`}
                style={surfaceStyle}
            >
                <header className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-3xl font-semibold tracking-wide">Menu</span>
                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Fechar menu"
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <CgClose size={44} />
                    </button>
                </header>

                <nav className={`flex flex-col gap-2 text-lg font-medium `}>
                    {children}
                </nav>
            </div>
        </div>
    );
}