'use client'

import { useCallback } from 'react'
import { useLatest } from './useLatest'

export function useEvent<T extends Function>(fn: T) {
  const latest = useLatest(fn)

  return useCallback(
    (...args: any[]) => latest.current(...args),
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [],
  ) as unknown as T
}
