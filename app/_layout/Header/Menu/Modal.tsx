import { ComponentProps } from 'react'

export default function Menu({ children, ...props }: ComponentProps<'nav'>) {
    return (
        <nav id='fundo' className='text-3xl flex flex-col items-center justify-center absolute left-0 top-0 bg-black w-full h-full' {...props}>
            <div 
            id='content' 
            className='flex items-center flex-col bg-red-950 w-5/6 h-5/6 px-5 rounded-xl'
            onClick={(e)=> e.stopPropagation()}
            >
                {children}
            </div>
        </nav>
    )
}
