'use client'

import { useState, useEffect, useCallback } from 'react'
import BrainCanvas from '@/components/BrainCanvas'
import AboutSection from '@/components/AboutSection'
import ExperienceSection from '@/components/ExperienceSection'
import ContactSection from '@/components/ContactSection'
import NavRail from '@/components/NavRail'
import type { VisitorRole } from '@/lib/types'

export default function Home() {
  const [visitorRole, setVisitorRole] = useState<VisitorRole | null>(null)
  const [hintVisible, setHintVisible] = useState(true)

  useEffect(() => {
    const hide = () => setHintVisible(false)
    window.addEventListener('scroll', hide, { once: true })
    return () => window.removeEventListener('scroll', hide)
  }, [])

  const onFirstClick = useCallback(() => setHintVisible(false), [])

  return (
    <main className="bg-[#0a0a0a] text-white">
      {/* Name plate */}
      <div style={{
        position: 'fixed',
        top: '28px',
        left: '32px',
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '11px',
          letterSpacing: '0.12em',
          color: '#ffffff',
          opacity: 0.9,
          marginBottom: '4px',
          fontWeight: 600,
        }}>
          SUBODH BHYRI
        </div>
        <div style={{
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '10px',
          letterSpacing: '0.08em',
          color: '#555',
        }}>
          SOFTWARE ENGINEER · MS CS, UF
        </div>
      </div>

      {/* Instruction hint — auto-hides on scroll or first node click */}
      <div style={{
        position: 'fixed',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        pointerEvents: 'none',
        opacity: hintVisible ? 0.35 : 0,
        transition: 'opacity 600ms ease',
        fontFamily: 'var(--font-geist-mono)',
        fontSize: '11px',
        letterSpacing: '0.1em',
        color: '#ffffff',
        whiteSpace: 'nowrap',
      }}>
        CLICK A NODE TO EXPLORE · SCROLL TO CONTINUE
      </div>

      {/* Spacer that gives the fixed BrainCanvas its scroll anchor */}
      <section id="brain" className="h-screen" />
      <BrainCanvas onRoleChange={setVisitorRole} onFirstClick={onFirstClick} />
      <AboutSection visitorRole={visitorRole} />
      <ExperienceSection visitorRole={visitorRole} />
      <ContactSection visitorRole={visitorRole} />
      <NavRail visitorRole={visitorRole} />
    </main>
  )
}
