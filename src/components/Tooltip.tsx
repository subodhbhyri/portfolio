'use client'

interface TooltipProps {
  x: number
  y: number
  label: string
  description: string
  visible: boolean
  flip: boolean
}

export default function Tooltip({ x, y, label, description, visible, flip }: TooltipProps) {
  if (!visible) return null

  return (
    <div
      className="pointer-events-none fixed z-50 max-w-xs rounded-lg border border-white/10 bg-zinc-900/90 px-3 py-2 shadow-xl backdrop-blur-sm"
      style={{
        left: x + (flip ? -14 : 14),
        top: y - 10,
        transform: flip ? 'translateX(-100%)' : undefined,
      }}
    >
      <p className="text-sm font-semibold text-white">{label}</p>
      <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">{description}</p>
    </div>
  )
}
