'use client'

import { useCallback, useRef } from 'react'

export function useEvent<T extends Function>(fn: T) {
  const latest = useRef<T>(fn)

  latest.current = fn

  return useCallback(
    (...args: any[]) => latest.current(...args),
    [],
  ) as unknown as T
}
