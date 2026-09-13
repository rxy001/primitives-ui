import {
  useEvent,
  useMergeRefs,
  useIsoLayoutEffect,
} from '@primitives-ui/hooks'
import {
  addEventListener,
  ownerDocument,
  getEventTarget,
} from '@primitives-ui/utils'
import { useEffect, useRef, useState } from 'react'
import { isFocusable } from 'tabbable'
import { createDocumentCache } from './createDocumentCache'
import { hasFocus } from './hasFocus'
import { withMetadata } from './metadata'

const getIsKeyboardModality = createDocumentCache((document) => {
  // Treat keyboard as default modality for each document.
  let isKeyboardModality = true

  function onMouseDown(event: MouseEvent) {
    const active = document.activeElement
    const target = getEventTarget(event)

    // Preserve keyboard modality when clicking the focused element or its descendants.
    if (
      isKeyboardModality &&
      active !== document.body &&
      active !== document.documentElement &&
      active?.contains(target)
    ) {
      return
    }

    isKeyboardModality = false
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    isKeyboardModality = true
  }

  // Intentionally keep listeners for the lifetime of this document.
  addEventListener(document, 'mousedown', onMouseDown, true)
  addEventListener(document, 'keydown', onKeyDown, true)

  return () => isKeyboardModality
})

export function useFocusRing<T extends UseFocusRingProps>(props: T) {
  const ref = useRef<HTMLElement>(null)
  const previousElement = useRef<HTMLElement>(null)
  const mergedRefs = useMergeRefs(ref, props.ref)
  const [focusVisible, setFocusVisible] = useState(false)

  // Disabling a focused element may not fire a blur event.
  // Clear the focus ring when the disabled prop becomes true.
  useEffect(() => {
    if (props.disabled && focusVisible) {
      setFocusVisible(false)
    }
  }, [props.disabled, focusVisible])

  // React may autofocus a new DOM node before attaching its ref, so
  // onFocusCapture can run while ref.current is null. Use the supplied element.
  // The layout effect below also reconciles focus when the DOM node changes.
  const shouldShowFocusRing = useEvent(
    (element: HTMLElement) =>
      getIsKeyboardModality(ownerDocument(element))() ||
      isAlwaysFocusVisible(element),
  )

  // Reconcile node changes before paint without recomputing the ring on ordinary
  // renders. Removing a focused node does not reliably reach React's onBlur.
  useIsoLayoutEffect(() => {
    const element = ref.current
    if (element === previousElement.current) return
    previousElement.current = element
    if (!element) {
      setFocusVisible(false)
      return
    }
    // Install document listeners even when the element is not focused.
    // Input that occurred before initialization is not recorded.
    getIsKeyboardModality(ownerDocument(element))
    setFocusVisible(hasFocus(element) && shouldShowFocusRing(element))
  })

  useIsoLayoutEffect(() => {
    const element = ref.current
    if (!element || hasFocus(element)) return
    // Defer the autoFocus attempt until the current synchronous work completes.
    // Recheck focusability then; the focus handler determines ring visibility.
    if (!props.autoFocus) return

    const document = ownerDocument(element)
    const activeElement = document.activeElement
    let cancelled = false

    queueMicrotask(() => {
      // Ignore attempts invalidated by effect cleanup or DOM node replacement.
      if (cancelled || ref.current !== element) return
      // React's native autoFocus runs before parent layout effects. This deferred
      // attempt runs after them, so preserve any focus they have moved elsewhere.
      if (document.activeElement !== activeElement) return

      if (hasFocus(element)) return
      if (!isFocusable(element)) return

      element.focus()
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFocusVisible = (element: HTMLElement) => {
    // Focus may have moved since this update was scheduled.
    if (!hasFocus(element)) return
    setFocusVisible(true)
  }

  // Show a hidden ring when keyboard interaction begins on the focused element.
  // This also handles switching from mouse to keyboard without refocusing.
  //
  // Defer the update because the key's action may move focus elsewhere.
  // If focusout reaches the element before the next animation frame, run the
  // check synchronously instead. Both paths verify focus before showing the ring.
  const { onKeyDownCapture } = props
  const handleKeyDownCapture = useEvent(
    (event: React.KeyboardEvent<HTMLElement>) => {
      onKeyDownCapture?.(event)

      if (event.defaultPrevented) return
      if (focusVisible) return
      if (event.metaKey || event.altKey || event.ctrlKey) return
      if (event.target !== event.currentTarget) return
      const element = event.currentTarget
      queueBeforeEvent(element, 'focusout', () => handleFocusVisible(element))
    },
  )

  const { onFocusCapture } = props
  const handleFocusCapture = useEvent(
    (event: React.FocusEvent<HTMLElement>) => {
      onFocusCapture?.(event)
      if (event.defaultPrevented) return
      if (event.target !== event.currentTarget) {
        setFocusVisible(false)
        return
      }
      const element = event.currentTarget
      if (shouldShowFocusRing(element)) {
        queueBeforeEvent(element, 'focusout', () => handleFocusVisible(element))
      } else {
        setFocusVisible(false)
      }
    },
  )

  const { onBlur } = props
  const handleBlur = useEvent((event: React.FocusEvent<HTMLElement>) => {
    onBlur?.(event)
    if (!isFocusEventOutside(event)) return
    setFocusVisible(false)
  })

  props = {
    ...props,
    ref: mergedRefs,
    onBlur: handleBlur,
    onKeyDownCapture: handleKeyDownCapture,
    onFocusCapture: handleFocusCapture,
  }

  return withMetadata(props, {
    state: {
      focusVisible,
    },
  })
}

function isFocusEventOutside(event: React.FocusEvent): boolean {
  const container = event.currentTarget
  const related = event.relatedTarget
  return !related || !container.contains(related)
}

/**
 * Runs `callback` on the next animation frame, or synchronously if a matching
 * event reaches the element's capture listener first (including descendant events).
 * Returns a function that cancels the pending frame and removes the listener.
 */
function queueBeforeEvent(
  element: HTMLElement,
  type: string,
  callback: () => void,
): () => void {
  const cancelRAF = (() => {
    const id = requestAnimationFrame(() => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      element.removeEventListener(type, callSync, true)
      callback()
    })
    return () => cancelAnimationFrame(id)
  })()
  const callSync = () => {
    cancelRAF()
    callback()
  }
  element.addEventListener(type, callSync, { once: true, capture: true })
  return () => {
    cancelRAF()
    element.removeEventListener(type, callSync, true)
  }
}

const alwaysFocusVisibleInputTypes = [
  'text',
  'search',
  'url',
  'tel',
  'email',
  'password',
  'number',
  'date',
  'month',
  'week',
  'time',
  'datetime',
  'datetime-local',
]

function isAlwaysFocusVisible(element: HTMLElement) {
  const { tagName, readOnly, type } = element as HTMLInputElement
  if (tagName === 'TEXTAREA' && !readOnly) return true
  if (tagName === 'SELECT' && !readOnly) return true
  if (tagName === 'INPUT' && !readOnly) {
    return alwaysFocusVisibleInputTypes.includes(type)
  }
  if (element.isContentEditable) return true
  return false
}

export interface UseFocusRingProps {
  disabled?: boolean
  autoFocus?: boolean
  ref?: React.Ref<HTMLElement>
  onBlur?: React.FocusEventHandler
  onFocusCapture?: React.FocusEventHandler
  onKeyDownCapture?: React.KeyboardEventHandler
}

export interface UseFocusRingState {
  focusVisible: boolean
}
