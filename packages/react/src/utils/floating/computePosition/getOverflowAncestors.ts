import { ownerWindow, isHTMLElement } from '@primitives-ui/utils'
import { isOverflowElement, getElementName } from './dom'

export function getOverflowAncestors(
  element: Element,
  cache?: WeakMap<Element, (HTMLElement | Window)[]>,
): (HTMLElement | Window)[] {
  const overflowAncestors: (HTMLElement | Window)[] = []
  const win = ownerWindow(element)

  if (cache?.has(element)) {
    return cache.get(element)!
  }

  let ancestor = getNearestOverflowAncestor(element)
  let body: HTMLElement | null = null

  while (ancestor) {
    const elementName = getElementName(ancestor)
    if (elementName === 'body') {
      body = ancestor as HTMLElement
    } else if (elementName === 'html' && body) {
      overflowAncestors.push(body)
    } else {
      overflowAncestors.push(ancestor)
    }
    if (win === ancestor) break
    ancestor = getNearestOverflowAncestor(ancestor as HTMLElement)
  }

  cache?.set(element, overflowAncestors)
  return overflowAncestors
}

function getNearestOverflowAncestor(element: Element): HTMLElement | Window {
  const { parentElement } = element

  if (!parentElement) {
    return ownerWindow(element)
  }

  if (isHTMLElement(parentElement) && isOverflowElement(parentElement)) {
    return parentElement
  }
  return getNearestOverflowAncestor(parentElement)
}
