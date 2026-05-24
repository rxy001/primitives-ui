export function mergeRefs<T>(
  ...refs: (React.Ref<T> | undefined | null)[]
): React.RefCallback<T> {
  const list = refs.filter((ref) => ref)

  return (node: T | null) => {
    const cleanups = list.map((ref) => {
      if (typeof ref === 'function') {
        return ref(node)
      }
      if (ref && typeof ref === 'object' && 'current' in ref) {
        ref.current = node
      }
    })

    if (node === null) return

    return () => {
      cleanups.forEach((cleanup, index) => {
        const ref = list[index]

        if (typeof cleanup === 'function') {
          cleanup()
        } else if (typeof ref === 'function') {
          ref(null)
        } else if (ref && typeof ref === 'object' && 'current' in ref) {
          ref.current = null
        }
      })
    }
  }
}
