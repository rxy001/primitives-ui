import { ownerDocument } from './ownerDocument'

export function ownerWindow(
  node: Node | undefined | null,
): Window & typeof globalThis {
  const doc = ownerDocument(node)
  return doc.defaultView || window
}
