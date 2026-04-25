'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { nodes as rawNodes } from '@/data/nodes'
import { parseIntent } from '@/lib/intentParser'
import type { VisitorRole } from '@/lib/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = 'recruiter' | 'engineer' | 'exploring'
type Phase = 'role' | 'interest' | 'chat'

interface Pill {
  label: string
  value: string
}

interface ChatMsg {
  id: number
  from: 'brain' | 'user'
  text: string
  pills?: Pill[]
  pillsUsed: boolean
  isTyping: boolean
}

interface Props {
  onHighlight: (nodeIds: string[]) => void
  onFocusNode: (nodeId: string) => void
  onRoleChange?: (role: VisitorRole | null) => void
}

// ─── Static data ──────────────────────────────────────────────────────────────

const ROLE_PILLS: Pill[] = [
  { label: 'Recruiter', value: 'recruiter' },
  { label: 'Engineer', value: 'engineer' },
  { label: 'Just exploring', value: 'exploring' },
]

const INTEREST_PILLS: Record<Role, Pill[]> = {
  recruiter: [
    { label: 'Backend systems',  value: 'Backend systems' },
    { label: 'AI/ML work',       value: 'AI/ML work' },
    { label: 'Full-stack',       value: 'Full-stack' },
    { label: 'Frontend',         value: 'Frontend' },
    { label: 'Data engineering', value: 'Data engineering' },
    { label: 'Automation / QA',  value: 'Automation / QA' },
    { label: 'All of it',        value: 'All of it' },
  ],
  engineer: [
    { label: 'Distributed systems', value: 'Distributed systems' },
    { label: 'AI agents',           value: 'AI agents' },
    { label: 'Real-time',           value: 'Real-time' },
    { label: 'All of it',           value: 'All of it' },
  ],
  exploring: [
    { label: 'Show me something cool',    value: 'Show me something cool' },
    { label: 'Walk me through a project', value: 'Walk me through a project' },
    { label: 'All of it',                 value: 'All of it' },
  ],
}

// Node ids surfaced for each role button click
const ROLE_NODES: Record<Role, string[]> = {
  recruiter: rawNodes.filter(n => n.relevantTo?.some(r => r.startsWith('recruiter'))).map(n => n.id),
  engineer:  rawNodes.filter(n => n.relevantTo?.includes('engineer')).map(n => n.id),
  exploring: rawNodes.filter(n => n.relevantTo?.includes('exploring')).map(n => n.id),
}

// Maps recruiter interest pill value → VisitorRole (null = "all of it" / generic)
const RECRUITER_ROLE_MAP: Record<string, VisitorRole | null> = {
  'Backend systems':  'recruiter-backend',
  'AI/ML work':       'recruiter-ai',
  'Full-stack':       'recruiter-fullstack',
  'Frontend':         'recruiter-frontend',
  'Data engineering': 'recruiter-data',
  'Automation / QA':  'recruiter-automation',
  'All of it':        null,
}

// Node ids surfaced for each interest button click
const INTEREST_NODES: Record<Role, Record<string, string[]>> = {
  recruiter: {
    'Backend systems':  rawNodes.filter(n => n.relevantTo?.includes('recruiter-backend')).map(n => n.id),
    'AI/ML work':       rawNodes.filter(n => n.relevantTo?.includes('recruiter-ai')).map(n => n.id),
    'Full-stack':       rawNodes.filter(n => n.relevantTo?.includes('recruiter-fullstack')).map(n => n.id),
    'Frontend':         rawNodes.filter(n => n.cluster === 'frontend').map(n => n.id),
    'Data engineering': ['kafka', 'postgres', 'redis', 'vectordb', 'embed'],
    'Automation / QA':  ['cicd', 'k8s', 'docker', 'prom', 'grafana'],
    'All of it':        rawNodes.filter(n => n.relevantTo?.some(r => r.startsWith('recruiter'))).map(n => n.id),
  },
  engineer: {
    'Distributed systems': ['slotify', 'dist', 'microservice', 'kafka', 'redis', 'k8s', 'docker', 'concur'],
    'AI agents':           ['timeline', 'comrades', 'langchain', 'rag', 'gemini', 'vectordb', 'mcp', 'embed'],
    'Real-time':           ['comrades', 'socketio', 'sse', 'realtime', 'kafka'],
    'All of it':           rawNodes.filter(n => n.relevantTo?.includes('engineer')).map(n => n.id),
  },
  exploring: {
    'Show me something cool':    ['timeline', 'comrades', 'globegl', 'maplibre', 'sse', 'mcp'],
    'Walk me through a project': ['slotify', 'comrades', 'timeline', 'vishwanath'],
    'All of it':                 rawNodes.map(n => n.id),
  },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatPanel({ onHighlight, onFocusNode, onRoleChange }: Props) {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>('role')
  const [role, setRole] = useState<Role | null>(null)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')

  const idRef = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasOpenedRef = useRef(false)

  const nextId = () => ++idRef.current

  // Adds a typing indicator, then after `delay` ms replaces it with the real message
  const showBrainMessage = useCallback((
    text: string,
    pills?: Pill[],
    delay = 400,
  ) => {
    const tid = nextId()
    setMessages(prev => [
      ...prev,
      { id: tid, from: 'brain', text: '', pillsUsed: false, isTyping: true },
    ])
    setTimeout(() => {
      setMessages(prev => [
        ...prev.filter(m => m.id !== tid),
        { id: nextId(), from: 'brain', text, pills, pillsUsed: false, isTyping: false },
      ])
    }, delay)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  // Focus the input when phase reaches 'chat'
  useEffect(() => {
    if (phase === 'chat' && open) inputRef.current?.focus()
  }, [phase, open])

  // Show the first brain message the first time the panel opens
  useEffect(() => {
    if (open && !hasOpenedRef.current) {
      hasOpenedRef.current = true
      showBrainMessage(
        'Are you a recruiter, engineer, or just exploring?',
        ROLE_PILLS,
      )
    }
  }, [open, showBrainMessage])

  const handlePillClick = (pill: Pill, msgId: number) => {
    // Disable pills in the source message
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, pillsUsed: true } : m))

    // Add user message
    setMessages(prev => [
      ...prev,
      { id: nextId(), from: 'user', text: pill.label, pillsUsed: false, isTyping: false },
    ])

    if (phase === 'role') {
      const r = pill.value as Role
      setRole(r)
      setPhase('interest')
      onHighlight(ROLE_NODES[r])
      if (r === 'engineer') onRoleChange?.('engineer')
      if (r === 'exploring') onRoleChange?.('exploring')
      showBrainMessage('What are you most interested in?', INTEREST_PILLS[r])
    } else if (phase === 'interest' && role) {
      const ids = INTEREST_NODES[role][pill.value] ?? []
      setPhase('chat')
      onHighlight(ids)
      if (role === 'recruiter') onRoleChange?.(RECRUITER_ROLE_MAP[pill.value] ?? null)
      showBrainMessage(
        "Got it — those nodes are highlighted. Type anything to narrow it down, or click any node to dig in.",
      )
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return

    setMessages(prev => [
      ...prev,
      { id: nextId(), from: 'user', text, pillsUsed: false, isTyping: false },
    ])
    setInput('')

    const matched = parseIntent(text, rawNodes, role ?? undefined)
    onHighlight(matched)

    if (matched.length === 0) {
      showBrainMessage(
        "Couldn't find a match — try terms like 'Kafka', 'RAG', 'distributed', or just click a node.",
      )
    } else if (matched.length === 1) {
      const node = rawNodes.find(n => n.id === matched[0])
      showBrainMessage(
        `Found 1 match: ${node?.label ?? matched[0]}. Click it to explore.`,
      )
      onFocusNode(matched[0])
    } else {
      showBrainMessage(
        `Found ${matched.length} nodes related to that — click any to dig in.`,
      )
    }
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start" style={{ pointerEvents: 'none' }}>
      {/* Panel */}
      <div
        className="mb-3 flex w-80 flex-col overflow-hidden rounded-xl"
        style={{
          height: 420,
          background: '#111111',
          border: '1px solid #222222',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 220ms, transform 260ms cubic-bezier(0.4,0,0.2,1)',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {/* Header */}
        <div
          className="flex flex-shrink-0 items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid #1d1d1d' }}
        >
          <span className="font-mono text-xs font-semibold tracking-widest text-zinc-600 uppercase">
            adaptive brain
          </span>
          <button
            onClick={() => setOpen(false)}
            className="text-zinc-700 transition-colors hover:text-zinc-400"
            aria-label="Close chat"
          >
            ×
          </button>
        </div>

        {/* Message area */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-3">
          {messages.map(msg => (
            <MessageRow
              key={msg.id}
              msg={msg}
              onPillClick={handlePillClick}
            />
          ))}
        </div>

        {/* Input — only visible after role + interest are chosen */}
        {phase === 'chat' && (
          <form
            onSubmit={handleSubmit}
            className="flex flex-shrink-0 items-center gap-2 px-4 py-3"
            style={{ borderTop: '1px solid #1d1d1d' }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything…"
              className="flex-1 bg-transparent font-mono text-sm text-white placeholder-zinc-700 outline-none"
              autoComplete="off"
            />
            <button
              type="submit"
              className="font-mono text-sm text-zinc-600 transition-colors hover:text-zinc-300"
              aria-label="Send"
            >
              ↵
            </button>
          </form>
        )}
      </div>

      {/* Trigger pill */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', pointerEvents: 'auto' }}
      >
        {/* Pulsing cluster dot */}
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
            style={{ background: '#D85A30' }}
          />
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ background: '#D85A30' }}
          />
        </span>
        Ask the brain
      </button>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MessageRow({
  msg,
  onPillClick,
}: {
  msg: ChatMsg
  onPillClick: (pill: Pill, msgId: number) => void
}) {
  const isBrain = msg.from === 'brain'

  if (msg.isTyping) {
    return (
      <div className="flex gap-1 py-1">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="inline-block h-1.5 w-1.5 animate-bounce rounded-full"
            style={{ background: '#444', animationDelay: `${i * 110}ms` }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={isBrain ? '' : 'text-right'}>
      {msg.text && (
        <p
          className={`inline text-sm leading-relaxed ${
            isBrain ? 'font-mono text-zinc-400' : 'text-white'
          }`}
        >
          {msg.text}
        </p>
      )}

      {/* Pill buttons */}
      {msg.pills && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {msg.pills.map(pill =>
            msg.pillsUsed ? (
              <span
                key={pill.value}
                className="rounded-full px-3 py-1 text-xs"
                style={{ color: '#383838', border: '1px solid #222' }}
              >
                {pill.label}
              </span>
            ) : (
              <button
                key={pill.value}
                onClick={() => onPillClick(pill, msg.id)}
                className="rounded-full px-3 py-1 text-xs text-zinc-500 transition-colors hover:border-zinc-500 hover:text-zinc-200"
                style={{ border: '1px solid #333' }}
              >
                {pill.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}
