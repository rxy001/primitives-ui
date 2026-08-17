export function resolveRef<T extends HTMLElement | null | undefined>(
  maybeRef: T | React.RefObject<T>,
): T {
  if (maybeRef == null) {
    return maybeRef
  }

  return 'current' in maybeRef ? maybeRef.current : maybeRef
}
