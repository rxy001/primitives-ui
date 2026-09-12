import { useEvent, useMergeRefs, useTimeout } from '@primitives-ui/hooks'
import {
  addEventListener,
  isElement,
  isHTMLElement,
  ownerDocument,
  ownerWindow,
} from '@primitives-ui/utils'
import { useEffect, useRef } from 'react'
import type { PopupOpenChangeDetails, PopupStore } from './store'
import { CHANGE_REASONS, isFocusVisible } from '../utils'
import { createChangeDetails } from '../utils'
import { popupSelectors } from './store'

type UseFocusProps = {
  store: PopupStore<
    PopupOpenChangeDetails<
      CHANGE_REASONS['triggerFocus'] | CHANGE_REASONS['triggerBlur']
    >
  >
  onFocus?: React.FocusEventHandler
  onBlur?: React.FocusEventHandler
  disable?: boolean
  ref?: React.Ref<HTMLElement | null>
}

export function useFocus<P extends UseFocusProps>({
  store,
  onFocus,
  onBlur,
  disable,
  ref,
  ...props
}: P) {
  const isPreventFocus = useRef(false)
  const isPreventCloseOnBlur = useRef(true)
  const timeout = useTimeout()
  const triggerRef = useRef<HTMLElement>(null)
  const mergedRefs = useMergeRefs(triggerRef, ref)

  useEffect(() => {
    if (disable) return

    const win = ownerWindow(triggerRef.current)

    // If the reference was focused and the user left the tab/window, and the
    // floating element was not open, the focus should be blocked when they
    // return to the tab/window.
    function handleBlur() {
      if (
        !popupSelectors.open(store.getState()) &&
        isElement(triggerRef.current) &&
        triggerRef.current === ownerDocument(triggerRef.current).activeElement
      ) {
        isPreventFocus.current = true
      }
    }

    return addEventListener(win, 'blur', handleBlur)
  }, [store, disable])

  const handleFocus = useEvent((event: React.FocusEvent) => {
    onFocus?.(event)

    if (disable) return

    if (isPreventFocus.current) {
      isPreventFocus.current = false
      return
    }

    const currentTarget = event.currentTarget

    if (!isHTMLElement(currentTarget)) {
      return
    }

    if (!isFocusVisible(currentTarget)) {
      return
    }

    const details = createChangeDetails(
      CHANGE_REASONS.triggerFocus,
      event.nativeEvent,
      {
        trigger: currentTarget,
      },
    )
    store.open(details)

    if (!details.isCanceled) {
      isPreventCloseOnBlur.current = false
    }
  })

  const handleBlur = useEvent((event: React.FocusEvent) => {
    onBlur?.(event)

    if (disable) return

    isPreventFocus.current = false

    if (isPreventCloseOnBlur.current) {
      return
    }

    const { relatedTarget, nativeEvent, currentTarget } = event

    const isMovedToAnchor =
      isElement(relatedTarget) &&
      relatedTarget.hasAttribute('data-primitives-ui-anchor-guard')

    // Wait for the window blur listener to fire.
    timeout.start(() => {
      const trigger = triggerRef.current
      const popup = store.getContext().popupRef.current
      const activeElement = ownerDocument(trigger).activeElement

      // Focus left the page, keep it open.
      if (!relatedTarget && trigger === activeElement) {
        return
      }

      if (
        isMovedToAnchor ||
        trigger?.contains(activeElement) ||
        popup?.contains(activeElement)
      ) {
        return
      }

      const nextFocusedElement = relatedTarget ?? activeElement
      const isOtherTriggerFocused = store
        .getContext()
        .triggerElements.find((v) => v === nextFocusedElement)

      // If the next focused element is one of the triggers, do not close
      // the floating element. The focus handler of that trigger will
      // handle the open state.
      if (isOtherTriggerFocused) {
        return
      }

      const details = createChangeDetails(
        CHANGE_REASONS.triggerBlur,
        nativeEvent,
        {
          trigger: currentTarget as HTMLElement,
        },
      )
      store.close(details)

      if (!details.isCanceled) {
        isPreventCloseOnBlur.current = true
      }
    }, 0)
  })

  return {
    ...props,
    disable,
    ref: mergedRefs,
    onFocus: handleFocus,
    onBlur: handleBlur,
  }
}
