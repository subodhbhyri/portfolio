'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { nodes as rawNodes, edges as rawEdges } from '@/data/nodes'
import type { PortfolioNode } from '@/data/nodes'
import Tooltip from './Tooltip'
import NodeDetail from './NodeDetail'
import ChatPanel from './ChatPanel'
import { SignalPropagator } from './SignalPropagator'

type SimNode = PortfolioNode & d3.SimulationNodeDatum
type SimLink = d3.SimulationLinkDatum<SimNode> & { weight: number }

const COLORS: Record<PortfolioNode['cluster'], string> = {
  backend: '#7F77DD',
  ai: '#1D9E75',
  frontend: '#EF9F27',
  project: '#D85A30',
  concept: '#888780',
}

const RADIUS: Record<PortfolioNode['size'], number> = {
  lg: 22,
  md: 16,
  sm: 11,
}

const WEIGHT_ALPHA: Record<number, number> = {
  1: 0.15,
  2: 0.30,
  3: 0.50,
}

function rgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

interface TooltipState {
  x: number
  y: number
  label: string
  description: string
  visible: boolean
  flip: boolean
}

// Panel is 380px wide; shift center leftward by half that so graph
// stays visually centered in the remaining viewport.
const PANEL_OFFSET = 190

export default function BrainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState>({
    x: 0, y: 0, label: '', description: '', visible: false, flip: false,
  })
  const [selectedNode, setSelectedNode] = useState<PortfolioNode | null>(null)

  // Lets NodeDetail's close button reach into the effect closure.
  const closePanelRef = useRef<() => void>(() => {})

  // Refs that ChatPanel callbacks read/write — avoids re-running the effect.
  const highlightedIdsRef = useRef<Set<string>>(new Set())
  const drawRef = useRef<() => void>(() => {})
  const focusNodeRef = useRef<(id: string) => void>(() => {})

  const onHighlight = useCallback((ids: string[]) => {
    highlightedIdsRef.current = new Set(ids)
    drawRef.current()
  }, [])

  const onFocusNode = useCallback((id: string) => {
    focusNodeRef.current(id)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let logW = 0
    let logH = 0

    const setSize = () => {
      const dpr = window.devicePixelRatio || 1
      logW = window.innerWidth
      logH = window.innerHeight
      canvas.width = logW * dpr
      canvas.height = logH * dpr
      canvas.style.width = logW + 'px'
      canvas.style.height = logH + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    setSize()

    let hoveredId: string | null = null
    let lockedId: string | null = null

    const simNodes: SimNode[] = rawNodes.map(n => ({
      ...n,
      x: logW / 2 + (Math.random() - 0.5) * 200,
      y: logH / 2 + (Math.random() - 0.5) * 200,
    }))
    const simLinks: SimLink[] = rawEdges.map(e => ({
      source: e.source,
      target: e.target,
      weight: e.weight ?? 1,
    }))

    const adj = new Map<string, Set<string>>()
    for (const e of rawEdges) {
      if (!adj.has(e.source)) adj.set(e.source, new Set())
      if (!adj.has(e.target)) adj.set(e.target, new Set())
      adj.get(e.source)!.add(e.target)
      adj.get(e.target)!.add(e.source)
    }

    // SignalPropagator stores references to simNodes so it always reads
    // the latest x/y as D3 mutates them during the simulation.
    const propagator = new SignalPropagator(simNodes, rawEdges, ctx)

    const draw = () => {
      const now = performance.now()
      ctx.clearRect(0, 0, logW, logH)

      const activeId = lockedId ?? hoveredId
      const neighbors = activeId ? adj.get(activeId) : null

      // Chat-driven multi-node highlight. Lock/hover always takes precedence.
      const hlSet = highlightedIdsRef.current
      const inHlMode = hlSet.size > 0 && !activeId

      // Edges
      for (const link of simLinks) {
        const s = link.source as SimNode
        const t = link.target as SimNode
        if (s.x == null || s.y == null || t.x == null || t.y == null) continue

        let a = WEIGHT_ALPHA[link.weight] ?? 0.15
        if (activeId) {
          const onActive = s.id === activeId || t.id === activeId
          if (!onActive) a *= 0.18
        } else if (inHlMode) {
          const sHl = hlSet.has(s.id)
          const tHl = hlSet.has(t.id)
          if (sHl && tHl)       { /* keep full weight */ }
          else if (sHl || tHl)  a *= 0.5
          else                   a *= 0.12
        }

        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(t.x, t.y)
        ctx.strokeStyle = `rgba(255,255,255,${Math.min(a, 1)})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Nodes
      for (const node of simNodes) {
        if (node.x == null || node.y == null) continue

        const r = RADIUS[node.size]
        const color = COLORS[node.cluster]
        const isActive = node.id === activeId
        const isNeighbor = neighbors?.has(node.id) ?? false
        const faded =
          (activeId != null && !isActive && !isNeighbor) ||
          (inHlMode && !hlSet.has(node.id))
        const a = faded ? 0.15 : 1

        if (node.cluster === 'project') {
          ctx.beginPath()
          ctx.arc(node.x, node.y, r + 6, 0, Math.PI * 2)
          ctx.fillStyle = rgba(color, 0.3 * a)
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2)
        ctx.fillStyle = rgba(color, a)
        ctx.fill()

        if (isActive) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, r + 3, 0, Math.PI * 2)
          ctx.strokeStyle = rgba(color, 0.85)
          ctx.lineWidth = 2
          ctx.stroke()
        }
      }

      // Signal pulses on top
      propagator.tick(now)
    }

    // Expose draw so onHighlight (defined outside the effect) can trigger a repaint.
    drawRef.current = draw

    const sim = d3.forceSimulation<SimNode>(simNodes)
      .force(
        'link',
        d3.forceLink<SimNode, SimLink>(simLinks)
          .id(d => d.id)
          .distance(d => {
            const s = d.source as SimNode
            const t = d.target as SimNode
            return s.cluster === t.cluster ? 100 : 150
          })
          .strength(0.45),
      )
      .force('charge', d3.forceManyBody<SimNode>().strength(-380))
      .force('center', d3.forceCenter(logW / 2, logH / 2).strength(0.15))
      .force('collide', d3.forceCollide<SimNode>(d => RADIUS[d.size] + 10))
      .force('bounds', () => {
        for (const node of simNodes) {
          const r = RADIUS[node.size] + 10
          node.x = Math.max(r, Math.min(logW - r, node.x ?? logW / 2))
          node.y = Math.max(r, Math.min(logH - r, node.y ?? logH / 2))
        }
      })
      .on('tick', draw)
      .alpha(0.5).restart()

    // rAF loop that runs while signal pulses are active. draw() already
    // includes propagator.tick(), so this just keeps the canvas refreshing
    // after D3's own tick loop has cooled down.
    let sigRafId: number | null = null
    const sigLoop = () => {
      draw()
      if (propagator.hasActivePulses(performance.now())) {
        sigRafId = requestAnimationFrame(sigLoop)
      } else {
        sigRafId = null
      }
    }

    const centerX = (panelOpen: boolean) =>
      panelOpen ? logW / 2 - PANEL_OFFSET : logW / 2

    const reheatCenter = (panelOpen: boolean) => {
      sim.force('center', d3.forceCenter(centerX(panelOpen), logH / 2).strength(0.08))
      sim.alpha(0.3).restart()
    }

    // Stable close function assigned to ref so NodeDetail's × button can
    // call it without needing a prop-drilling chain.
    const closePanel = () => {
      const wasOpen = lockedId !== null
      lockedId = null
      hoveredId = null
      setSelectedNode(null)
      setTooltip(prev => ({ ...prev, visible: false }))
      if (wasOpen) reheatCenter(false)
      draw()
    }
    closePanelRef.current = closePanel

    // Lets onFocusNode (defined outside effect) programmatically lock + open a node.
    focusNodeRef.current = (nodeId: string) => {
      const node = simNodes.find(n => n.id === nodeId)
      if (!node) return
      const wasPanelOpen = lockedId !== null
      lockedId = nodeId
      hoveredId = nodeId
      setSelectedNode(node)
      if (!wasPanelOpen) reheatCenter(true)
      propagator.fire(nodeId)
      if (!sigRafId) sigRafId = requestAnimationFrame(sigLoop)
      draw()
    }

    const getNode = (mx: number, my: number): SimNode | null => {
      for (let i = simNodes.length - 1; i >= 0; i--) {
        const node = simNodes[i]
        if (node.x == null || node.y == null) continue
        const r = RADIUS[node.size] + 4
        const dx = mx - node.x
        const dy = my - node.y
        if (dx * dx + dy * dy <= r * r) return node
      }
      return null
    }

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const node = getNode(e.clientX - rect.left, e.clientY - rect.top)

      if (node) {
        canvas.style.cursor = 'pointer'
        setTooltip({
          x: e.clientX,
          y: e.clientY,
          label: node.label,
          description: node.description,
          visible: true,
          flip: e.clientX > logW * 0.75,
        })
      } else {
        canvas.style.cursor = 'default'
        setTooltip(prev => ({ ...prev, visible: false }))
      }

      if (!lockedId) {
        hoveredId = node?.id ?? null
        draw()
      }
    }

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const node = getNode(e.clientX - rect.left, e.clientY - rect.top)
      const wasPanelOpen = lockedId !== null

      if (node) {
        const togglingOff = lockedId === node.id
        lockedId = togglingOff ? null : node.id
        hoveredId = lockedId ? node.id : null

        const isPanelOpen = lockedId !== null
        setSelectedNode(isPanelOpen ? node : null)

        // Adjust forceCenter only when open/close state actually flips
        if (!wasPanelOpen && isPanelOpen) reheatCenter(true)
        else if (wasPanelOpen && !isPanelOpen) reheatCenter(false)
        // Same panel already open + different node clicked → no center jump

        if (isPanelOpen) {
          propagator.fire(node.id)
          if (!sigRafId) sigRafId = requestAnimationFrame(sigLoop)
          setTooltip({
            x: e.clientX,
            y: e.clientY,
            label: node.label,
            description: node.description,
            visible: true,
            flip: e.clientX > logW * 0.75,
          })
        } else {
          setTooltip(prev => ({ ...prev, visible: false }))
        }
      } else {
        // Clicked empty canvas — close panel
        if (wasPanelOpen) reheatCenter(false)
        lockedId = null
        hoveredId = null
        setSelectedNode(null)
        setTooltip(prev => ({ ...prev, visible: false }))
      }

      draw()
    }

    const onLeave = () => {
      if (!lockedId) {
        hoveredId = null
        setTooltip(prev => ({ ...prev, visible: false }))
        draw()
      }
    }

    const onResize = () => {
      setSize()
      reheatCenter(lockedId !== null)
    }

    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('click', onClick)
    canvas.addEventListener('mouseleave', onLeave)
    window.addEventListener('resize', onResize)

    return () => {
      sim.stop()
      if (sigRafId !== null) cancelAnimationFrame(sigRafId)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className="fixed inset-0">
      <canvas ref={canvasRef} className="fixed inset-0" />
      <Tooltip {...tooltip} />
      <NodeDetail node={selectedNode} onClose={() => closePanelRef.current()} />
      <ChatPanel onHighlight={onHighlight} onFocusNode={onFocusNode} />
    </div>
  )
}
