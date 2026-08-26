'use client'

import { useRef } from 'react'
import { useIsoLayoutEffect } from './useIsoLayoutEffect'

export function useLatest<T>(value: T) {
  const ref = useRef<T>(value)

  useIsoLayoutEffect(() => {
    ref.current = value
  })

  return ref
}
