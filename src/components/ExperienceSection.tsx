'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { VisitorRole } from '@/lib/types'
import { useFadeIn } from '@/hooks/useFadeIn'
import { useTypewriter } from '@/hooks/useTypewriter'
import { useCountUp } from '@/hooks/useCountUp'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Block {
  id: string
  label: string
  text: ReactNode
}

// ─── Block data ───────────────────────────────────────────────────────────────

const PROBLEM: Block = {
  id: 'problem',
  label: 'THE PROBLEM',
  text: "Transmission line failures were being caught too late. Sensor data lived in siloed dashboards across different teams — by the time an operator noticed an anomaly, the window to prevent an incident had already closed.",
}

const BUILT_DEFAULT: Block = {
  id: 'built',
  label: 'WHAT I BUILT',
  text: "A centralized admin screen that aggregated real-time sensor data across all transmission lines into a single view. Alongside it, a role-based access control system in React and Node.js that let 500+ users across the enterprise see exactly what they needed to — nothing more, nothing less.",
}

const BUILT_FULLSTACK: Block = {
  id: 'built',
  label: 'WHAT I BUILT',
  text: (
    <>
      A centralized admin screen that aggregated real-time sensor data across all transmission
      lines into a single view. Alongside it, a role-based access control system in{' '}
      <span style={{ color: '#fff' }}>React and Node.js</span> that let 500+ users across
      the enterprise see exactly what they needed to — nothing more, nothing less.
    </>
  ),
}

const RESULT: Block = {
  id: 'result',
  label: 'THE RESULT',
  // Text is rendered by ResultText component when id === 'result'
  text: null,
}

const LEARNED: Block = {
  id: 'learned',
  label: 'WHAT I LEARNED',
  text: "Designing access control upfront saves enormous refactoring pain later. RBAC touches every layer of the stack — if you bolt it on after the fact, you're rewriting half your API.",
}

const SITUATION: Block = { id: 'situation', label: 'THE SITUATION', text: PROBLEM.text }
const WHAT_I_MADE: Block = { id: 'made',     label: 'WHAT I MADE',  text: BUILT_DEFAULT.text }
const DID_IT_WORK: Block = {
  id: 'worked',
  label: 'DID IT WORK',
  text: "Data retrieval speed improved by 60%, latency dropped by 20ms. OAuth2 and JWT integration brought token success to 99.9%. More importantly, operators could now respond to anomalies before they became incidents.",
}
const TAKEAWAY: Block = { id: 'takeaway', label: 'THE TAKEAWAY', text: LEARNED.text }

function getBlocks(role: VisitorRole | null): Block[] {
  switch (role) {
    case 'recruiter-ai':       return [RESULT, BUILT_DEFAULT, PROBLEM]
    case 'recruiter-fullstack': return [PROBLEM, BUILT_FULLSTACK, RESULT, LEARNED]
    case 'engineer':           return [PROBLEM, BUILT_DEFAULT, RESULT, LEARNED]
    case 'exploring':          return [SITUATION, WHAT_I_MADE, DID_IT_WORK, TAKEAWAY]
    default:                   return [PROBLEM, BUILT_DEFAULT, RESULT, LEARNED]
  }
}

// Persists which block IDs have been triggered for the page session —
// prevents re-animation on role change.
const triggeredBlocks = new Set<string>()

// ─── Section ──────────────────────────────────────────────────────────────────

interface Props {
  visitorRole: VisitorRole | null
}

export default function ExperienceSection({ visitorRole }: Props) {
  const sectionRef = useFadeIn<HTMLElement>()
  const [blocks, setBlocks] = useState(() => getBlocks(visitorRole))
  const [animating, setAnimating] = useState(false)
  const prevRole = useRef(visitorRole)

  // Detect mobile once at mount for typewriter speed
  const [speed] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 25 : 40,
  )

  useEffect(() => {
    if (visitorRole === prevRole.current) return
    setAnimating(true)
    const t = setTimeout(() => {
      prevRole.current = visitorRole
      setBlocks(getBlocks(visitorRole))
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

        <div
          className="rounded-xl p-8"
          style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}
        >
          {/* Card header */}
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-base font-semibold text-white">Vishwanath Projects Limited</div>
              <div className="mt-0.5 text-sm text-zinc-400">Associate Software Engineer</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs text-zinc-600">Aug 2023 – Apr 2024</div>
              <div className="mt-0.5 font-mono text-xs text-zinc-700">Hyderabad, India</div>
            </div>
          </div>

          {/* Narrative blocks */}
          <div className="space-y-7">
            {blocks.map((block, i) => (
              <NarrativeBlock
                key={block.id}
                block={block}
                index={i}
                animating={animating}
                speed={speed}
              />
            ))}
          </div>
        </div>

        <p className="mt-4 font-mono text-xs text-zinc-800">More roles coming</p>
      </div>
    </section>
  )
}

// ─── Narrative block ──────────────────────────────────────────────────────────

function NarrativeBlock({
  block,
  index,
  animating,
  speed,
}: {
  block: Block
  index: number
  animating: boolean
  speed: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isResultBlock = block.id === 'result'

  // Was this block already seen before this render (e.g. after a role change)?
  const wasAlreadyDone = triggeredBlocks.has(block.id)

  const [triggered, setTriggered] = useState(wasAlreadyDone)
  const [paraVisible, setParaVisible] = useState(wasAlreadyDone)
  const [counterTriggered, setCounterTriggered] = useState(wasAlreadyDone && isResultBlock)

  // Refs guard against scheduling the same timeout twice
  const paraScheduled = useRef(wasAlreadyDone)
  const counterScheduled = useRef(wasAlreadyDone && isResultBlock)

  // IntersectionObserver — fires once when block scrolls into view
  useEffect(() => {
    if (triggered) return
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          triggeredBlocks.add(block.id)
          setTriggered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [block.id, triggered])

  // Paragraph fades in after label finishes typing
  useEffect(() => {
    if (!triggered || paraScheduled.current) return
    paraScheduled.current = true
    const t = setTimeout(() => setParaVisible(true), block.label.length * speed)
    return () => clearTimeout(t)
  }, [triggered, block.label.length, speed])

  // Counters start 300ms after paragraph fades in (= after label finishes)
  useEffect(() => {
    if (!isResultBlock || !triggered || counterScheduled.current) return
    counterScheduled.current = true
    const t = setTimeout(
      () => setCounterTriggered(true),
      block.label.length * speed + 300,
    )
    return () => clearTimeout(t)
  }, [isResultBlock, triggered, block.label.length, speed])

  // Typewriter — skip animation if block was already seen before this mount
  const rawLabel = useTypewriter(block.label, speed, !wasAlreadyDone && triggered)
  const displayedLabel = wasAlreadyDone ? block.label : rawLabel

  // Counters (only wired for the result block; show final values if already done)
  const animateCounters = isResultBlock && !wasAlreadyDone
  const rawCount60 = useCountUp(60,   800, animateCounters && counterTriggered, 0)
  const rawCount20 = useCountUp(20,   800, animateCounters && counterTriggered, 0)
  const rawCount99 = useCountUp(99.9, 800, animateCounters && counterTriggered, 1)

  const count60 = wasAlreadyDone ? 60   : rawCount60
  const count20 = wasAlreadyDone ? 20   : rawCount20
  const count99 = wasAlreadyDone ? 99.9 : rawCount99

  return (
    <div
      ref={ref}
      style={{
        opacity: animating ? 0 : 1,
        transition: `opacity 150ms ease-out ${index * 40}ms`,
      }}
    >
      {/* Label — types character by character */}
      <div
        className="mb-2 font-mono"
        style={{ fontSize: 10, letterSpacing: '0.15em', color: '#444', minHeight: '1em' }}
      >
        {displayedLabel}
      </div>

      {/* Paragraph — fades in after label finishes */}
      <p
        style={{
          fontSize: 16,
          lineHeight: 1.8,
          color: '#888',
          opacity: paraVisible ? 1 : 0,
          transition: 'opacity 300ms ease',
        }}
      >
        {isResultBlock ? (
          <ResultText count60={count60} count20={count20} count99={count99} />
        ) : (
          block.text
        )}
      </p>
    </div>
  )
}

// ─── Result block with animated numbers ───────────────────────────────────────

function ResultText({
  count60,
  count20,
  count99,
}: {
  count60: number
  count20: number
  count99: number
}) {
  const hi: React.CSSProperties = { color: '#fff' }
  return (
    <>
      Data retrieval speed improved by{' '}
      <span style={hi}>{count60}%</span>, latency dropped by{' '}
      <span style={hi}>{count20}ms</span>. OAuth2 and JWT integration brought
      token success to <span style={hi}>{count99}%</span>. More importantly,
      operators could now respond to anomalies before they became incidents.
    </>
  )
}
