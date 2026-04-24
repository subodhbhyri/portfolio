'use client'

import { useRef } from 'react'
import { nodes, edges } from '@/data/nodes'
import type { PortfolioNode, ProcessStep } from '@/data/nodes'

const COLORS: Record<PortfolioNode['cluster'], string> = {
  backend: '#7F77DD',
  ai: '#1D9E75',
  frontend: '#EF9F27',
  project: '#D85A30',
  concept: '#888780',
}

const nodeById = new Map(nodes.map(n => [n.id, n]))

function usedIn(nodeId: string): PortfolioNode[] {
  return nodes.filter(n => n.detail?.stack?.includes(nodeId))
}

function connectedNodes(nodeId: string): PortfolioNode[] {
  const connectedIds = new Set<string>()
  for (const e of edges) {
    if (e.source === nodeId) connectedIds.add(e.target)
    if (e.target === nodeId) connectedIds.add(e.source)
  }
  return nodes.filter(n => connectedIds.has(n.id))
}

interface Props {
  node: PortfolioNode | null
  onClose: () => void
  onHighlight: (ids: string[]) => void
  onFocusNode: (id: string) => void
}

export default function NodeDetail({ node, onClose, onHighlight, onFocusNode }: Props) {
  const lastRef = useRef<PortfolioNode | null>(null)
  if (node !== null) lastRef.current = node
  const displayed = lastRef.current

  return (
    <div
      className="fixed right-0 top-0 z-40 flex h-full w-[380px] flex-col"
      style={{
        background: '#111111',
        borderLeft: '1px solid #222222',
        transform: node !== null ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 320ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {displayed && (
        <PanelContent
          node={displayed}
          onClose={onClose}
          onHighlight={onHighlight}
          onFocusNode={onFocusNode}
        />
      )}
    </div>
  )
}

function PanelContent({
  node,
  onClose,
  onHighlight,
  onFocusNode,
}: {
  node: PortfolioNode
  onClose: () => void
  onHighlight: (ids: string[]) => void
  onFocusNode: (id: string) => void
}) {
  const color = COLORS[node.cluster]
  const { detail } = node
  const related = connectedNodes(node.id)

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 pb-5 pt-6" style={{ borderBottom: '1px solid #1d1d1d' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-2">
              <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: color }} />
              <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-600">
                {node.cluster}
              </span>
            </div>
            <h2 className="text-xl font-bold leading-tight text-white">{node.label}</h2>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-zinc-600 transition-colors hover:bg-white/5 hover:text-zinc-300"
            aria-label="Close panel"
          >
            ×
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-6 py-5">
        {detail ? (
          <DetailContent detail={detail} color={color} />
        ) : (
          <NoDetailContent node={node} />
        )}
        {related.length > 0 && (
          <ConnectedNodes
            related={related}
            onHighlight={onHighlight}
            onFocusNode={onFocusNode}
          />
        )}
      </div>
    </div>
  )
}

function DetailContent({
  detail,
  color,
}: {
  detail: NonNullable<PortfolioNode['detail']>
  color: string
}) {
  return (
    <>
      {detail.summary && (
        <p className="text-sm leading-relaxed text-zinc-400">{detail.summary}</p>
      )}

      {detail.stack && detail.stack.length > 0 && (
        <section>
          <Label>Stack</Label>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {detail.stack.map(id => {
              const n = nodeById.get(id)
              const c = n ? COLORS[n.cluster] : '#888780'
              return (
                <span
                  key={id}
                  className="rounded px-2 py-0.5 text-[11px] font-medium"
                  style={{ background: `${c}20`, color: c, border: `1px solid ${c}38` }}
                >
                  {n?.label ?? id}
                </span>
              )
            })}
          </div>
        </section>
      )}

      {detail.metrics && detail.metrics.length > 0 && (
        <section>
          <Label>Metrics</Label>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {detail.metrics.map(m => (
              <div key={m.label} className="rounded-lg px-3 py-2.5" style={{ background: '#181818' }}>
                <div className="text-base font-bold text-white">{m.value}</div>
                <div className="mt-0.5 text-[11px] text-zinc-600">{m.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {detail.highlights && detail.highlights.length > 0 && (
        <section>
          <Label>Highlights</Label>
          <ul className="mt-2.5 space-y-2.5">
            {detail.highlights.map((h, i) => (
              <li
                key={i}
                className="border-l pl-3 text-sm leading-relaxed text-zinc-400"
                style={{ borderColor: '#2d2d2d' }}
              >
                {h}
              </li>
            ))}
          </ul>
        </section>
      )}

      {detail.process && detail.process.length > 0 && (
        <section>
          <Label>Process</Label>
          <ol className="mt-2.5">
            {detail.process.map((step: ProcessStep, i: number) => (
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center pt-0.5">
                  <div
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{ background: '#1e1e1e', color: '#555' }}
                  >
                    {i + 1}
                  </div>
                  {i < detail.process!.length - 1 && (
                    <div className="mt-1 min-h-[1.5rem] w-px flex-1" style={{ background: '#1e1e1e' }} />
                  )}
                </div>
                <div className="pb-5">
                  <div className="text-sm font-semibold text-white">{step.title}</div>
                  <div className="mt-0.5 text-xs leading-relaxed text-zinc-500">{step.detail}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {detail.links && (detail.links.github || detail.links.live || detail.links.demo) && (
        <section className="pt-1">
          <div className="flex gap-2">
            {detail.links.github && (
              <a
                href={detail.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center rounded-lg py-2 text-sm font-medium transition-colors hover:text-white"
                style={{
                  border: `1px solid ${color}55`,
                  color: `${color}cc`,
                  background: `${color}10`,
                }}
              >
                GitHub ↗
              </a>
            )}
            {(detail.links.live ?? detail.links.demo) && (
              <a
                href={detail.links.live ?? detail.links.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center rounded-lg py-2 text-sm font-medium transition-colors hover:text-white"
                style={{
                  border: `1px solid ${color}55`,
                  color: `${color}cc`,
                  background: `${color}10`,
                }}
              >
                Live ↗
              </a>
            )}
          </div>
        </section>
      )}
    </>
  )
}

function NoDetailContent({ node }: { node: PortfolioNode }) {
  const projects = usedIn(node.id)
  return (
    <>
      <p className="text-base leading-relaxed text-zinc-500">{node.description}</p>
      {projects.length > 0 && (
        <section>
          <Label>Used in</Label>
          <ul className="mt-2.5 space-y-3">
            {projects.map(p => (
              <li key={p.id} className="border-l-2 pl-3" style={{ borderColor: COLORS.project }}>
                <div className="text-sm font-semibold text-white">{p.label}</div>
                <div className="mt-0.5 text-xs leading-relaxed text-zinc-600">{p.description}</div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

function ConnectedNodes({
  related,
  onHighlight,
  onFocusNode,
}: {
  related: PortfolioNode[]
  onHighlight: (ids: string[]) => void
  onFocusNode: (id: string) => void
}) {
  return (
    <section>
      <Label>Connected nodes</Label>
      <div
        className="mt-2.5 flex flex-wrap gap-1.5"
        onMouseLeave={() => onHighlight([])}
      >
        {related.map(n => {
          const c = COLORS[n.cluster]
          return (
            <button
              key={n.id}
              onMouseEnter={() => onHighlight([n.id])}
              onClick={() => onFocusNode(n.id)}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:text-white"
              style={{ border: '1px solid #2a2a2a', background: '#161616' }}
            >
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: c }} />
              {n.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-700">
      {children}
    </div>
  )
}
