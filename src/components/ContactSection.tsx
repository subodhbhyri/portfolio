'use client'

import type { VisitorRole } from '@/lib/types'
import { getResume } from '@/lib/resumeMap'
import { useFadeIn } from '@/hooks/useFadeIn'

interface Props {
  visitorRole: VisitorRole | null
}

function getSubtext(role: VisitorRole | null): string {
  if (role?.startsWith('recruiter')) {
    return "I'm actively looking for full-time roles starting May 2026. Happy to jump on a call."
  }
  if (role === 'engineer' || role === 'exploring') {
    return 'Always up for talking systems, AI, or interesting problems.'
  }
  return 'Reach out — always happy to connect.'
}

const LINK_BASE =
  'group flex flex-col gap-1.5'
const LABEL_CLASS =
  'font-mono text-[10px] uppercase tracking-widest text-zinc-800'
const HREF_CLASS =
  'text-sm text-[#555] transition-colors duration-200 group-hover:text-white no-underline'

export default function ContactSection({ visitorRole }: Props) {
  const sectionRef = useFadeIn<HTMLElement>()
  const { file, label } = getResume(visitorRole)
  const subtext = getSubtext(visitorRole)

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative z-10 bg-[#0a0a0a]"
      style={{ minHeight: '40vh' }}
    >
      <div className="mx-auto max-w-[680px] px-6 py-[120px]">
        <h2
          className="mb-4 font-sans font-medium text-white"
          style={{ fontSize: 48, lineHeight: 1.1 }}
        >
          Let&apos;s talk
        </h2>

        <p
          className="mb-12 text-[#999]"
          style={{ fontSize: 18, lineHeight: 1.8 }}
        >
          {subtext}
        </p>

        {/* Links row */}
        <div className="flex flex-wrap gap-10">
          <a
            href="mailto:subodhbhyri811@gmail.com"
            className={LINK_BASE}
          >
            <span className={LABEL_CLASS}>Email</span>
            <span className={HREF_CLASS}>subodhbhyri811@gmail.com</span>
          </a>

          <a
            href="https://linkedin.com/in/subodhbhyri"
            target="_blank"
            rel="noopener noreferrer"
            className={LINK_BASE}
          >
            <span className={LABEL_CLASS}>LinkedIn</span>
            <span className={HREF_CLASS}>linkedin.com/in/subodhbhyri</span>
          </a>

          <a
            href="https://github.com/subodhbhyri"
            target="_blank"
            rel="noopener noreferrer"
            className={LINK_BASE}
          >
            <span className={LABEL_CLASS}>GitHub</span>
            <span className={HREF_CLASS}>github.com/subodhbhyri</span>
          </a>

          <a href={file} download className={LINK_BASE}>
            <span className={LABEL_CLASS}>Resume</span>
            <span className={HREF_CLASS}>{label} ↓</span>
          </a>
        </div>

        <p className="mt-12 font-mono text-xs text-zinc-700">
          Based in Gainesville, FL · Open to remote
        </p>
      </div>
    </section>
  )
}
