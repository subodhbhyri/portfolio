'use client'

import { useEffect, useRef, useState } from 'react'
import type { VisitorRole } from '@/lib/types'
import { useFadeIn } from '@/hooks/useFadeIn'

interface Bullet {
  id: string
  text: string
}

const ALL_BULLETS: Bullet[] = [
  {
    id: 'monitoring',
    text: 'Architected centralized admin screen for real-time transmission line monitoring, aggregating sensor data to cut incident response time',
  },
  {
    id: 'rbac',
    text: 'Designed scalable RBAC system in React + Node.js for 500+ users across multi-tier enterprise environments',
  },
  {
    id: 'api',
    text: 'Optimized REST API data transfers achieving 60% faster retrieval and 20ms latency reduction',
  },
  {
    id: 'auth',
    text: 'Secured auth with OAuth2 + JWT, achieving 99.9% token success rate',
  },
]

function getBullets(role: VisitorRole | null): Bullet[] {
  switch (role) {
    case 'recruiter-ai':
      // API and auth first — closest to AI backend work
      return [
        ALL_BULLETS[2], // api
        ALL_BULLETS[3], // auth
        ALL_BULLETS[1], // rbac
        ALL_BULLETS[0], // monitoring
      ]
    case 'recruiter-fullstack':
      // RBAC and React mentioned first
      return [
        ALL_BULLETS[1], // rbac
        ALL_BULLETS[0], // monitoring
        ALL_BULLETS[2], // api
        ALL_BULLETS[3], // auth
      ]
    default:
      return ALL_BULLETS
  }
}

interface Props {
  visitorRole: VisitorRole | null
}

export default function ExperienceSection({ visitorRole }: Props) {
  const sectionRef = useFadeIn<HTMLElement>()
  const [bullets, setBullets] = useState(() => getBullets(visitorRole))
  const [animating, setAnimating] = useState(false)
  const prevRole = useRef(visitorRole)

  useEffect(() => {
    if (visitorRole === prevRole.current) return
    setAnimating(true)
    const t = setTimeout(() => {
      prevRole.current = visitorRole
      setBullets(getBullets(visitorRole))
      setAnimating(false)
    }, 150)
    return () => clearTimeout(t)
  }, [visitorRole])

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative z-10 bg-[#0a0a0a]"
      style={{ minHeight: '60vh' }}
    >
      <div className="mx-auto max-w-[680px] px-6 py-[120px]">
        <h2
          className="mb-10 font-sans font-medium text-white"
          style={{ fontSize: 48, lineHeight: 1.1 }}
        >
          Experience
        </h2>

        {/* Card */}
        <div
          className="rounded-xl p-8"
          style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}
        >
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-base font-semibold text-white">Vishwanath Projects Limited</div>
              <div className="mt-0.5 text-sm text-zinc-400">Associate Software Engineer</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs text-zinc-600">Aug 2023 – Apr 2024</div>
              <div className="mt-0.5 font-mono text-xs text-zinc-700">Hyderabad, India</div>
            </div>
          </div>

          {/* Bullets */}
          <ul className="space-y-3">
            {bullets.map((bullet, i) => (
              <li
                key={bullet.id}
                className="flex gap-3 text-sm leading-relaxed text-zinc-500"
                style={{
                  opacity: animating ? 0 : 1,
                  transition: `opacity 150ms ease-out ${i * 40}ms`,
                }}
              >
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-zinc-700" />
                {bullet.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 font-mono text-xs text-zinc-800">More roles coming</p>
      </div>
    </section>
  )
}
