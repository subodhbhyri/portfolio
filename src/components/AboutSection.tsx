'use client'

import { useEffect, useRef, useState } from 'react'
import type { VisitorRole } from '@/lib/types'
import { getResume } from '@/lib/resumeMap'
import { useFadeIn } from '@/hooks/useFadeIn'
import { useCountUp } from '@/hooks/useCountUp'
import { nodes } from '@/data/nodes'

const GITHUB = 'https://github.com/subodhbhyri'

// Derives automatically from the nodes graph — adding a project node updates this.
const projectCount = nodes.filter(n => n.cluster === 'project').length

// ─── Role-variant content ─────────────────────────────────────────────────────

interface Content {
  heading: string
  body: string
  pill?: string
  primary: { label: string; href: string; download?: boolean; external?: boolean }
  secondary: { label: string; href: string; download?: boolean; external?: boolean; scroll?: boolean }
}

function getContent(role: VisitorRole | null, resumeFile: string, resumeLabel: string): Content {
  switch (role) {
    case 'recruiter-backend':
      return {
        heading: 'About',
        body: "I'm Subodh Bhyri, a backend-focused software engineer finishing my MS at the University of Florida (May 2026). I specialize in distributed systems — Kafka event pipelines, Redis concurrency patterns, Kubernetes deployments, and microservice architecture. Currently open to full-time backend and infrastructure roles.",
        pill: 'Available May 2026',
        primary: { label: `${resumeLabel} ↓`, href: resumeFile, download: true },
        secondary: { label: 'View GitHub', href: GITHUB, external: true },
      }
    case 'recruiter-ai':
      return {
        heading: 'About',
        body: "I'm Subodh Bhyri, an AI-native backend engineer finishing my MS at the University of Florida (May 2026). I build systems where AI is load-bearing — RAG pipelines, LangChain agents, vector search, and LLM integrations that run in production. Currently open to full-time AI/ML engineering roles.",
        pill: 'Available May 2026',
        primary: { label: `${resumeLabel} ↓`, href: resumeFile, download: true },
        secondary: { label: 'View GitHub', href: GITHUB, external: true },
      }
    case 'recruiter-fullstack':
      return {
        heading: 'About',
        body: "I'm Subodh Bhyri, a full-stack engineer finishing my MS at the University of Florida (May 2026). I'm comfortable across the stack — React frontends, Node.js and Java backends, real-time Socket.io systems, and cloud deployments on AWS and Kubernetes. Open to full-time full-stack roles.",
        pill: 'Available May 2026',
        primary: { label: `${resumeLabel} ↓`, href: resumeFile, download: true },
        secondary: { label: 'View GitHub', href: GITHUB, external: true },
      }
    case 'recruiter-data':
    case 'recruiter-automation':
    case 'recruiter-frontend':
      return {
        heading: 'About',
        body: "I'm Subodh Bhyri, a software engineer finishing my MS at the University of Florida (May 2026). I build production systems across the stack — distributed backends, real-time infrastructure, and AI-native applications.",
        pill: 'Available May 2026',
        primary: { label: `${resumeLabel} ↓`, href: resumeFile, download: true },
        secondary: { label: 'View GitHub', href: GITHUB, external: true },
      }
    case 'engineer':
      return {
        heading: 'How I think',
        body: "I'm drawn to problems where the interesting challenge is in the system design — how do you guarantee exactly-once delivery under load? How do you make an AI agent reliable enough to run unsupervised? I'm doing my MS at UF, building things that answer those questions.",
        primary: { label: 'View GitHub', href: GITHUB, external: true },
        secondary: { label: 'Read my projects', href: '#brain', scroll: true },
      }
    case 'exploring':
      return {
        heading: 'The story',
        body: "Started in Mumbai studying CS, moved to Hyderabad to build enterprise systems at Vishwanath Projects, then came to Gainesville to do my MS at the University of Florida. Each step I've been chasing harder problems — from CRUD APIs to distributed systems to AI agents that actually work.",
        primary: { label: 'View GitHub', href: GITHUB, external: true },
        secondary: { label: `${resumeLabel} ↓`, href: resumeFile, download: true },
      }
    default:
      return {
        heading: 'About',
        body: "I'm Subodh Bhyri, a software engineer and MS Computer Science student at the University of Florida (expected May 2026). I build systems that scale — distributed backends, AI-native applications, and real-time infrastructure.",
        primary: { label: `${resumeLabel} ↓`, href: resumeFile, download: true },
        secondary: { label: 'View GitHub', href: GITHUB, external: true },
      }
  }
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface Props {
  visitorRole: VisitorRole | null
}

export default function AboutSection({ visitorRole }: Props) {
  const sectionRef = useFadeIn<HTMLElement>()
  const { file, label } = getResume(visitorRole)
  const content = getContent(visitorRole, file, label)

  // Role-change content fade
  const [visible, setVisible] = useState(true)
  const [displayed, setDisplayed] = useState(content)
  const prevRole = useRef(visitorRole)

  useEffect(() => {
    if (visitorRole === prevRole.current) return
    setVisible(false)
    const t = setTimeout(() => {
      prevRole.current = visitorRole
      setDisplayed(getContent(visitorRole, file, label))
      setVisible(true)
    }, 200)
    return () => clearTimeout(t)
  }, [visitorRole, file, label])

  // Stats counter trigger — fires once when stats row enters view
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsTriggered, setStatsTriggered] = useState(false)

  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsTriggered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const [isMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  )

  const countProjects = useCountUp(projectCount, 600,  statsTriggered, 0)
  const count255      = useCountUp(255,          1000, statsTriggered, 0)
  const count377      = useCountUp(3.77,         800,  statsTriggered, 2)

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative z-10 min-h-screen bg-[#0a0a0a]"
    >
      <div className="mx-auto max-w-[900px] px-6 py-[120px]">
        <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 200ms ease-out' }}>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[3fr_2fr] md:items-center">

            {/* Photo — above text on mobile, right column on desktop */}
            <div className="order-first flex justify-center md:order-last md:justify-end">
              <PhotoBlock />
            </div>

            {/* Text */}
            <div className="order-last md:order-first">
              <h2
                className="mb-8 font-sans font-medium text-white"
                style={{ fontSize: 48, lineHeight: 1.1 }}
              >
                {displayed.heading}
              </h2>

              <p
                className="text-[#999]"
                style={{ fontSize: 18, lineHeight: 1.8 }}
              >
                {displayed.body}
              </p>

              {/* Stats row — fixed across all role variants */}
              <div
                ref={statsRef}
                style={{
                  display: 'flex',
                  gap: isMobile ? '32px' : '48px',
                  margin: '32px 0',
                }}
              >
                {/* Projects */}
                <div>
                  <div
                    style={{
                      fontSize: isMobile ? 24 : 32,
                      fontWeight: 600,
                      color: '#fff',
                      lineHeight: 1.1,
                    }}
                  >
                    {countProjects}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#444',
                      marginTop: 4,
                    }}
                  >
                    projects built
                  </div>
                </div>

                {/* LeetCode — linked */}
                <a
                  href="https://leetcode.com/u/subodhisawake/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                  style={{ textDecoration: 'none', cursor: 'pointer' }}
                >
                  <div
                    style={{
                      fontSize: isMobile ? 24 : 32,
                      fontWeight: 600,
                      color: '#fff',
                      lineHeight: 1.1,
                    }}
                  >
                    {count255}+
                  </div>
                  <div
                    className="text-[#444] transition-colors duration-200 group-hover:text-[#888]"
                    style={{
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginTop: 4,
                    }}
                  >
                    leetcode problems
                  </div>
                </a>

                {/* GPA */}
                <div>
                  <div
                    style={{
                      fontSize: isMobile ? 24 : 32,
                      fontWeight: 600,
                      color: '#fff',
                      lineHeight: 1.1,
                    }}
                  >
                    {count377.toFixed(2)}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#444',
                      marginTop: 4,
                    }}
                  >
                    GPA · MS CS, UF
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <ActionButton action={displayed.primary} />
                <ActionButton action={displayed.secondary} />
                {displayed.pill && (
                  <span
                    className="rounded-full px-3 py-1 font-mono text-xs text-zinc-500"
                    style={{ border: '1px solid #222' }}
                  >
                    {displayed.pill}
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Add your photo to /public/images/subodh.jpg
function PhotoBlock() {
  const [hidden, setHidden] = useState(false)
  if (hidden) return null
  return (
    <div className="w-full max-w-[160px] md:max-w-[280px]">
      <img
        src="/images/subodh.jpg"
        alt="Subodh Bhyri"
        onError={() => setHidden(true)}
        className="w-full object-cover"
        style={{
          aspectRatio: '3/4',
          borderRadius: 16,
          border: '1px solid #222',
          filter: 'grayscale(15%)',
        }}
      />
    </div>
  )
}

function ActionButton({ action }: { action: Content['primary'] }) {
  const base =
    'inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-medium text-zinc-400 transition-all duration-200 hover:bg-white hover:text-black'
  const style = { border: '1px solid #333' }

  if (action.download) {
    return <a href={action.href} download className={base} style={style}>{action.label}</a>
  }
  if (action.external) {
    return <a href={action.href} target="_blank" rel="noopener noreferrer" className={base} style={style}>{action.label}</a>
  }
  return <a href={action.href} className={base} style={style}>{action.label}</a>
}
