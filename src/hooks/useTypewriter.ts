'use client'

import { useState, useEffect } from 'react'

export function useTypewriter(text: string, speed = 40, trigger = false) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    if (!trigger) return
    setDisplayed('')
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i >= text.length) clearInterval(interval)
    }, speed)
    return () => clearInterval(interval)
  }, [trigger, text, speed])

  return displayed
}
