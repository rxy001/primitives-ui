interface HiddenElementState {
  count: number
  originalValue: string | null
}

const hiddenElementStates = new WeakMap<Element, HiddenElementState>()

function hideElement(element: Element) {
  const state = hiddenElementStates.get(element)

  if (state) {
    state.count += 1
    return
  }

  hiddenElementStates.set(element, {
    count: 1,
    originalValue: element.getAttribute('aria-hidden'),
  })
  element.setAttribute('aria-hidden', 'true')
}

function restoreElement(element: Element) {
  const state = hiddenElementStates.get(element)

  if (!state) return

  state.count -= 1

  if (state.count > 0) return

  restoreElementState(element, state)
}

function restoreManagedElement(element: Element) {
  const state = hiddenElementStates.get(element)

  if (!state) return

  restoreElementState(element, state)
}

function restoreElementState(element: Element, state: HiddenElementState) {
  hiddenElementStates.delete(element)

  if (state.originalValue === null) {
    element.removeAttribute('aria-hidden')
  } else {
    element.setAttribute('aria-hidden', state.originalValue)
  }
}

export function markOutsideElementsAsHidden(element: Element) {
  const hiddenElements = new Set<Element>()
  const root = element.getRootNode()
  let current: Node = element

  while (current !== root) {
    if (current.nodeType === 1) {
      restoreManagedElement(current as Element)
    }

    const parent = current.parentNode

    if (!parent) break

    Array.from(parent.children).forEach((sibling) => {
      if (sibling !== current) {
        hideElement(sibling)
        hiddenElements.add(sibling)
      }
    })

    current = parent
  }

  return () => {
    for (const hiddenElement of hiddenElements) {
      restoreElement(hiddenElement)
    }
  }
}
