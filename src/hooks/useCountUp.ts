'use client'

import { useState, useEffect } from 'react'

export function useCountUp(
  target: number,
  duration = 800,
  trigger = false,
  decimals = 0,
) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!trigger) return
    let start: number | null = null
    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(parseFloat((eased * target).toFixed(decimals)))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [trigger, target, duration, decimals])

  return value
}
