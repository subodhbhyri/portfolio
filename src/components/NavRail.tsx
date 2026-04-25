'use client'

import { useEffect, useState } from 'react'
import type { VisitorRole } from '@/lib/types'

const SECTIONS = [
  { id: 'brain',      label: 'Brain' },
  { id: 'about',      label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact',    label: 'Contact' },
]

interface Props {
  visitorRole: VisitorRole | null
}

export default function NavRail({ visitorRole: _ }: Props) {
  const [activeId, setActiveId] = useState('brain')

  useEffect(() => {
    const observers = SECTIONS.map(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return null

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id)
        },
        // Fire when the section occupies the middle band of the viewport
        { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
      )
      obs.observe(el)
      return obs
    })

    return () => observers.forEach(o => o?.disconnect())
  }, [])

  return (
    <div className="fixed right-6 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-4">
      {SECTIONS.map(({ id, label }) => {
        const isActive = activeId === id
        return (
          <a
            key={id}
            href={`#${id}`}
            className="group relative flex items-center justify-end"
            aria-label={label}
          >
            {/* Label — slides in from right on hover */}
            <span className="pointer-events-none absolute right-5 whitespace-nowrap font-mono text-[10px] uppercase tracking-widest text-zinc-500 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              {label}
            </span>
            {/* Dot */}
            <span
              className="block h-1.5 w-1.5 rounded-full transition-colors duration-200"
              style={{
                background: isActive ? '#ffffff' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? '#ffffff' : '#444444',
              }}
            />
          </a>
        )
      })}
    </div>
  )
}
