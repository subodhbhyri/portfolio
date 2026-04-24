import type { PortfolioNode } from '@/data/nodes'

// Minimal shape expected from D3-processed nodes (x/y added by simulation)
interface D3Node {
  id: string
  cluster: PortfolioNode['cluster']
  x?: number
  y?: number
}

const COLORS: Record<PortfolioNode['cluster'], string> = {
  backend: '#7F77DD',
  ai: '#1D9E75',
  frontend: '#EF9F27',
  project: '#D85A30',
  concept: '#888780',
}

interface Pulse {
  fromNode: D3Node
  toNode: D3Node
  color: string
  startTime: number
  duration: number
}

export class SignalPropagator {
  private ctx: CanvasRenderingContext2D
  private nodeMap = new Map<string, D3Node>()
  private adj = new Map<string, string[]>()
  private pulses: Pulse[] = []

  constructor(
    nodes: D3Node[],
    edges: Array<{ source: string; target: string }>,
    ctx: CanvasRenderingContext2D,
  ) {
    this.ctx = ctx
    for (const node of nodes) this.nodeMap.set(node.id, node)
    for (const e of edges) {
      if (!this.adj.has(e.source)) this.adj.set(e.source, [])
      if (!this.adj.has(e.target)) this.adj.set(e.target, [])
      this.adj.get(e.source)!.push(e.target)
      this.adj.get(e.target)!.push(e.source)
    }
  }

  fire(nodeId: string) {
    const now = performance.now()
    const source = this.nodeMap.get(nodeId)
    if (!source) return

    const color = COLORS[source.cluster]
    const primaryNeighbors = this.adj.get(nodeId) ?? []

    // Primary pulses: source → each direct neighbor
    for (const nId of primaryNeighbors) {
      const neighbor = this.nodeMap.get(nId)
      if (!neighbor) continue
      this.pulses.push({ fromNode: source, toNode: neighbor, color, startTime: now, duration: 400 })
    }

    // Secondary pulses: each neighbor → its neighbors, delayed 300ms
    for (const nId of primaryNeighbors) {
      const neighbor = this.nodeMap.get(nId)
      if (!neighbor) continue
      for (const sId of this.adj.get(nId) ?? []) {
        if (sId === nodeId) continue // don't reverse back to source
        const secNode = this.nodeMap.get(sId)
        if (!secNode) continue
        this.pulses.push({
          fromNode: neighbor,
          toNode: secNode,
          color,
          startTime: now + 300,
          duration: 400,
        })
      }
    }
  }

  // Called every frame from draw(). Removes expired pulses and paints active ones.
  tick(now: number) {
    this.pulses = this.pulses.filter(p => now < p.startTime + p.duration)

    for (const { fromNode, toNode, color, startTime, duration } of this.pulses) {
      if (now < startTime) continue
      const { x: fx, y: fy } = fromNode
      const { x: tx, y: ty } = toNode
      if (fx == null || fy == null || tx == null || ty == null) continue

      const t = (now - startTime) / duration
      const x = fx + (tx - fx) * t
      const y = fy + (ty - fy) * t

      this.ctx.save()
      this.ctx.shadowColor = color
      this.ctx.shadowBlur = 14
      this.ctx.beginPath()
      this.ctx.arc(x, y, 4, 0, Math.PI * 2)
      this.ctx.fillStyle = color
      this.ctx.fill()
      this.ctx.restore()
    }
  }

  hasActivePulses(now: number): boolean {
    return this.pulses.some(p => now < p.startTime + p.duration)
  }
}
