import { useId } from 'react'

export function useResolvedId(id?: string) {
  const defaultId = useId()
  return id ?? defaultId
}
