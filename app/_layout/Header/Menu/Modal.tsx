"use client";

import { ComponentProps, useEffect } from "react";
import { CgClose } from "react-icons/cg";
import { DEFAULT_STYLE, TYPE_STYLES } from "@/app/_style/type_styles";

interface MenuProps extends ComponentProps<"div"> {
    type?: string;
    secondType?: string;
    onClose?: () => void;
}

export default function Menu({
    children,
    type = "fire",
    secondType,
    className = "",
    onClose,
    onClick,
    ...props
}: MenuProps) {
    const style = TYPE_STYLES[type.toLowerCase()] ?? DEFAULT_STYLE;
    const secStyle = secondType
        ? (TYPE_STYLES[secondType.toLowerCase()] ?? DEFAULT_STYLE)
        : null;

    const backgroundImage = secStyle
        ? `linear-gradient(135deg, ${style.gradientHex}33, ${secStyle.gradientHex}33)`
        : `linear-gradient(135deg, ${style.gradientHex}33, transparent)`;

    const boxShadow = secStyle
        ? `0 12px 32px rgba(0, 0, 0, 0.65), -8px 0 20px ${style.gradientHex}33, 8px 0 20px ${secStyle.gradientHex}33`
        : `0 12px 32px rgba(0, 0, 0, 0.65), 0 0 20px ${style.gradientHex}33`;

    useEffect(() => {
        if (!onClose) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else if (onClick) {
            onClick({} as React.MouseEvent<HTMLDivElement>);
        }
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            onClick={onClick}
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 ${className}`}
            {...props}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    boxShadow,
                    backgroundImage,
                    borderColor: secStyle ? secStyle.gradientHex : undefined,
                }}
                className={`w-full max-w-sm rounded-2xl border bg-slate-950/90 ${style.cardBg} p-6 text-white transition-all`}
            >
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                    <span className="text-lg font-semibold tracking-wide">Menu</span>
                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Fechar menu"
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                    >
                        <CgClose size={24} />
                    </button>
                </div>

                <div className="flex flex-col gap-2 text-lg font-medium [&_a]:flex [&_a]:items-center [&_a]:justify-between [&_a]:rounded-xl [&_a]:px-4 [&_a]:py-3 [&_a]:text-white/90 [&_a]:transition-colors hover:[&_a]:bg-white/10 hover:[&_a]:text-white">
                    {children}
                </div>
            </div>
        </div>
    );
}