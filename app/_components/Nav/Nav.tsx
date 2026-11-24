'use client'

import { ComponentProps, useEffect, useState } from "react"
import Menu from "../Menu/Modal";
import { BiMenu } from "react-icons/bi";

export default function Nav({ children, ...props }: ComponentProps<'nav'>) {
    const [width, setWidth] = useState<number>(0);
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        window.addEventListener('resize', () => setWidth(window.innerWidth));
        setWidth(window.innerWidth)
    }, [])

    if (425 < width) {
        return (
            <nav {...props}>{children}</nav>
        )
    }

    return (
        <>
            <button onClick={() => setIsOpen(!isOpen)}>
                <BiMenu size={45} />
            </button>
            {isOpen && (
                <Menu onClick={() => setIsOpen(!isOpen)}>
                    {children}
                </Menu>
            )
            }
        </>
    )
}
