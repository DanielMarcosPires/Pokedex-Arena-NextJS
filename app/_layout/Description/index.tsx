import React, { ComponentProps } from 'react'

export default function Description({children}:ComponentProps<'section'>) {
  return (
    <section className='text-2xl w-full'>{children}</section>
  )
}
