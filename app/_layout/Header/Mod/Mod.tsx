'use client'

import { ComponentProps, useEffect, useState } from "react"
import Menu from "../Menu/Modal";
import { BiMenu } from "react-icons/bi";
import { CgClose } from "react-icons/cg";

export default function Nav({ children, ...props }: ComponentProps<'nav'>) {
    const [width, setWidth] = useState<number>(0);
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        setWidth(window.innerWidth)

        window.addEventListener('resize',()=>setWidth(window.innerWidth));
    }, [])

    if (425 < width) {
        return (
            <nav {...props}>{children}</nav>
        )
    }

    return (
        <>
            <button onClick={() => setIsOpen(isOpen)}>
                <BiMenu size={45} />
            </button>
            {isOpen && (
                <Menu onClick={() => setIsOpen(!isOpen)}>
                    <div className="flex justify-between w-full">
                        <h2 className="py-4">Menu:</h2>
                        <button onClick={() => setIsOpen(!isOpen)}>
                            <CgClose size={45} />
                        </button>
                    </div>
                    {children}
                </Menu>
            )
            }
        </>
    )
}
