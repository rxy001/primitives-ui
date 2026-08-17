import { ownerDocument } from '@primitives-ui/utils'

export function focus(
  element: HTMLElement | SVGElement | null | undefined,
  preventScroll = true,
) {
  if (element && typeof element.focus === 'function') {
    const doc = ownerDocument(element)
    if (doc.activeElement === element) return
    element.focus({ preventScroll })
  }
}
