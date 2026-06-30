import { useEffect, useMemo, useRef } from 'react'
import { useEvent } from './useEvent'

export function useTimeout() {
  const timerRef = useRef<NodeJS.Timeout>(null)

  const clear = useEvent(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  })

  const start = useEvent((fn: (...args: any[]) => void, delay: number) => {
    clear()
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      fn()
    }, delay)
  })

  useEffect(() => clear, [clear])

  return useMemo(() => ({ start, clear }), [start, clear])
}
