'use client'

import { mergeRefs } from '@primitives-ui/utils'
import { useCallback } from 'react'

export function useMergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  return useCallback((node: T | null) => mergeRefs(...refs)(node), refs)
}
