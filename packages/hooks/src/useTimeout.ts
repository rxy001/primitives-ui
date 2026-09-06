import { Timeout } from '@primitives-ui/utils'
import { useEffect, useRef } from 'react'

export function useTimeout() {
  const timeoutRef = useRef<Timeout>(null)

  if (!timeoutRef.current) {
    timeoutRef.current = Timeout.create()
  }

  useEffect(() => timeoutRef.current?.clear)

  return timeoutRef.current
}
