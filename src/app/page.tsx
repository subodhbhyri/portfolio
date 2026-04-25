'use client'

import { useState } from 'react'
import BrainCanvas from '@/components/BrainCanvas'
import AboutSection from '@/components/AboutSection'
import ExperienceSection from '@/components/ExperienceSection'
import ContactSection from '@/components/ContactSection'
import NavRail from '@/components/NavRail'
import type { VisitorRole } from '@/lib/types'

export default function Home() {
  const [visitorRole, setVisitorRole] = useState<VisitorRole | null>(null)

  return (
    <main className="bg-[#0a0a0a] text-white">
      {/* Spacer that gives the fixed BrainCanvas its scroll anchor */}
      <section id="brain" className="h-screen" />
      <BrainCanvas onRoleChange={setVisitorRole} />
      <AboutSection visitorRole={visitorRole} />
      <ExperienceSection visitorRole={visitorRole} />
      <ContactSection visitorRole={visitorRole} />
      <NavRail visitorRole={visitorRole} />
    </main>
  )
}
