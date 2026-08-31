import type { FocusableElement } from 'tabbable'
import {
  useEvent,
  useIsoLayoutEffect,
  useLatest,
  useMergeRefs,
} from '@primitives-ui/hooks'
import {
  addEventListener,
  isFunction,
  ownerDocument,
  chain,
  ownerWindow,
  __DEV__,
} from '@primitives-ui/utils'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { isFocusable, tabbable } from 'tabbable'
import type { PreventableEvent } from '../utils'
import type { HookProps, HTMLElements } from '../utils/types'
import type {
  ESCAPE_KEY,
  FOCUS_OUTSIDE,
  POINTER_DOWN_OUTSIDE,
  PopupDismissRequest,
  PopupDismissSource,
  PopupEntry,
} from './PopupManager'
import {
  createHook,
  focus,
  withMetadata,
  resolveRef,
  markOutsideElementsAsHidden,
  createPreventableEvent,
} from '../utils'
import { FocusGuard } from './FocusGuard'
import { PopupProvider, usePopupContext } from './PopupContext'
import { markEventInsidePopup, PopupManager } from './PopupManager'
import { getPopupManager } from './PopupManager'

export const usePopup = createHook<'div', PopupOwnProps, PopupState, true>(
  ({
    initialFocus,
    returnFocus,
    onEscapeKeyDown,
    onPointerDownOutside,
    onDismiss,
    onFocusOutside,
    modal = true,
    enabled = false,
    dismissOnFocusOutside = true,
    dismissOnEscapeKeyDown = true,
    dismissOnPointerDownOutside = true,
    trigger = null,
    ...props
  }) => {
    const [paused, setPaused] = useState(false)
    const [anchorHost, setAnchorHost] = useState<HTMLElement | null>(null)

    const initialFocusRef = useLatest(initialFocus)
    const returnFocusRef = useLatest(returnFocus)
    const popupRef = useRef<HTMLElement>(null)
    const focusSessionRef = useRef<FocusSession>(null)
    const anchorRef = useRef<HTMLElement>(null)
    const beforeGuardRef = useRef<HTMLElement>(null)
    const afterGuardRef = useRef<HTMLElement>(null)
    const directionRef = useRef<'backward' | 'forward'>(undefined)
    const lastTabbableIndexRef = useRef(-1)
    const pausedRef = useLatest(paused)
    const modalRef = useLatest(modal)
    const popupManagerRef = useRef<PopupManager>(null)
    const previousStateRef = useRef({ enabled, modal })
    const triggerRef = useLatest(trigger)

    if (__DEV__) {
      useEffect(() => {
        const previousState = previousStateRef.current

        if (previousState.enabled && enabled && previousState.modal !== modal) {
          console.error(
            'Warning: The `modal` option passed to usePopup changed while the popup was enabled. ' +
              'Changing `modal` while enabled is not supported. Disable the popup before changing this option.',
          )
        }

        previousStateRef.current = { enabled, modal }
      }, [enabled, modal])
    }

    const mergedRefs = useMergeRefs(popupRef, props.ref)

    const focusFirst = useEvent(() => {
      const popup = popupRef.current
      if (!enabled || !popup) return false

      const first = tabbable(popup)[0]
      if (!first) return false

      focus(first)
      return true
    })

    const focusLast = useEvent(() => {
      const popup = popupRef.current
      if (!enabled || !popup) return false

      const candidates = tabbable(popup)
      const last = candidates[candidates.length - 1]
      if (!last) return false

      focus(last)
      return true
    })

    const focusAdjacentOutsideScope = useEvent(
      (element: HTMLElement | null, direction: 'forward' | 'backward') => {
        const afterGuard = afterGuardRef.current
        const beforeGuard = beforeGuardRef.current
        const popup = popupRef.current

        if (!element || !afterGuard || !beforeGuard || !popup) return

        const candidates = tabbable(ownerDocument(element).body)

        const startIndex = candidates.indexOf(element)

        if (startIndex < 0) return

        const step = direction === 'forward' ? 1 : -1

        for (let offset = 1; offset < candidates.length; offset += 1) {
          const index =
            (startIndex + step * offset + candidates.length) % candidates.length
          const candidate = candidates[index]

          if (
            popup.contains(candidate) ||
            candidate === afterGuard ||
            candidate === beforeGuard
          ) {
            continue
          }
          focus(candidate)
          return
        }
      },
    )

    const handleAnchorFocus = useEvent(() => {
      if (pausedRef.current) return

      if (directionRef.current === 'forward') {
        if (!focusFirst()) {
          focusAdjacentOutsideScope(anchorRef.current, 'forward')
        }
      } else if (directionRef.current === 'backward') {
        if (!focusLast()) {
          focusAdjacentOutsideScope(anchorRef.current, 'backward')
        }
      }
    })

    const handleBeforeGuardFocus = useEvent(() => {
      if (pausedRef.current) return

      if (modal) {
        if (!focusLast()) {
          focus(popupRef.current)
        }
        return
      }

      if (directionRef.current === 'backward') {
        focusAdjacentOutsideScope(anchorRef.current, 'backward')
      } else if (directionRef.current === 'forward') {
        focusAdjacentOutsideScope(afterGuardRef.current, 'forward')
      }
    })

    const handleAfterGuardFocus = useEvent(() => {
      if (pausedRef.current) return

      if (modal) {
        if (!focusFirst()) {
          focus(popupRef.current)
        }
        return
      }

      if (directionRef.current === 'forward') {
        focusAdjacentOutsideScope(anchorRef.current, 'forward')
      } else if (directionRef.current === 'backward') {
        focusAdjacentOutsideScope(beforeGuardRef.current, 'backward')
      }
    })

    const { onPointerDownCapture } = props
    const handlePointerDownCapture = useEvent(
      (event: React.PointerEvent<HTMLDivElement>) => {
        markEventInsidePopup(entry, event.nativeEvent)
        onPointerDownCapture?.(event)
      },
    )

    const { onFocusCapture } = props
    const handleFocusCapture = useEvent(
      (event: React.FocusEvent<HTMLDivElement>) => {
        popupManagerRef.current?.markFocusDestinationInside(
          entry,
          event.nativeEvent,
        )
        onFocusCapture?.(event)
      },
    )

    const { onBlurCapture } = props
    const handleBlurCapture = useEvent(
      (event: React.FocusEvent<HTMLDivElement>) => {
        markEventInsidePopup(entry, event.nativeEvent)
        onBlurCapture?.(event)
      },
    )

    const { onKeyDownCapture } = props
    const handleKeyDownCapture = useEvent(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        markEventInsidePopup(entry, event.nativeEvent)
        onKeyDownCapture?.(event)
      },
    )

    const handlePause = useEvent(() => {
      if (pausedRef.current) return
      setPaused(true)
    })

    const handleResume = useEvent(() => {
      if (!pausedRef.current) return
      setPaused(false)
    })

    const isFocusInside = useEvent((target: EventTarget | null) => {
      if (!target || typeof (target as Node).nodeType !== 'number') return false

      const node = target as Node

      return (
        popupRef.current?.contains(node) === true ||
        triggerRef.current?.contains(node) === true ||
        node === anchorRef.current ||
        node === beforeGuardRef.current ||
        node === afterGuardRef.current
      )
    })

    const preventCurrentFocusReturn = useEvent(() => {
      const session = focusSessionRef.current

      if (session) {
        session.preventReturnFocus = true
      }
    })

    const parentEntry = usePopupContext()?.entry

    const requestDismiss = useEvent((request: PopupDismissRequest<'self'>) => {
      let event = null

      switch (request.reason) {
        case 'escape-key': {
          if (!dismissOnEscapeKeyDown) return
          event = createPreventableEvent(request.originalEvent, {
            reason: request.reason,
            source: request.source,
          })
          onEscapeKeyDown?.(event)
          if (event.defaultPrevented) return
          break
        }

        case 'pointer-down-outside': {
          if (!dismissOnPointerDownOutside) return
          event = createPreventableEvent(request.originalEvent, {
            reason: request.reason,
            source: request.source,
          })
          onPointerDownOutside?.(event)

          if (event.defaultPrevented) return

          break
        }

        case 'focus-outside': {
          if (!dismissOnFocusOutside) return
          event = createPreventableEvent(request.originalEvent, {
            reason: request.reason,
            source: request.source,
          })
          onFocusOutside?.(event)

          if (event.defaultPrevented) return

          preventCurrentFocusReturn()

          break
        }
      }

      return () => {
        onDismiss?.(event)
      }
    })

    const forceDismiss = useEvent(
      (request: PopupDismissRequest<'ancestor'>) => {
        const event = createPreventableEvent(request.originalEvent, {
          reason: request.reason,
          source: request.source,
        }) as EscapeKeyDownEvent | PointerDownOutsideEvent | FocusOutsideEvent

        if (request.reason === 'focus-outside') {
          preventCurrentFocusReturn()
        }

        return () => {
          onDismiss?.(event)
        }
      },
    )

    const entry = useMemo<PopupEntry>(
      () => ({
        modalRef,
        triggerRef,
        isFocusInside,
        requestDismiss,
        forceDismiss,
        elementRef: popupRef,
        parent: parentEntry,
        pause: handlePause,
        resume: handleResume,
      }),
      [
        handlePause,
        forceDismiss,
        handleResume,
        isFocusInside,
        parentEntry,
        modalRef,
        requestDismiss,
        triggerRef,
      ],
    )

    useIsoLayoutEffect(() => {
      if (enabled) {
        if (focusSessionRef.current) {
          focusSessionRef.current.returnTarget = trigger
        }
      }
    }, [enabled, trigger])

    useIsoLayoutEffect(() => {
      if (enabled && popupRef.current) {
        const popupManager = getPopupManager(ownerDocument(popupRef.current))
        popupManagerRef.current = popupManager

        return popupManager.register(entry)
      }
    }, [enabled])

    // Create a focus session and Restore focus when it becomes inactive.
    useIsoLayoutEffect(() => {
      const popup = popupRef.current

      if (!enabled || !popup) return

      const doc = ownerDocument(popup)
      const previouslyFocusedElement = getFocusableElement(doc.activeElement)

      const session = {
        returnTarget: triggerRef.current || previouslyFocusedElement,
        preventReturnFocus: false,
      }

      focusSessionRef.current = session

      return () => {
        queueMicrotask(() => {
          // Strict Mode can clean up and recreate an Effect in the same task.
          // Ignore work queued by the discarded session.
          if (focusSessionRef.current !== session) return

          if (session.preventReturnFocus) {
            focusSessionRef.current = null
            return
          }

          try {
            const resolvedReturnFocus =
              (isFunction(returnFocusRef.current)
                ? returnFocusRef.current()
                : returnFocusRef.current) ?? true

            if (resolvedReturnFocus === false) {
              return
            }

            const activeElement = doc.activeElement

            if (activeElement !== doc.body && !popup.contains(activeElement)) {
              return
            }

            let returnFocusElement: FocusableElement | null = null
            if (
              typeof resolvedReturnFocus === 'object' &&
              resolvedReturnFocus !== null
            ) {
              returnFocusElement = getFocusableElement(
                resolveRef(resolvedReturnFocus),
              )
            }

            returnFocusElement ||= getFocusableElement(session.returnTarget)

            const topmostModalEntry =
              popupManagerRef.current?.getTopmostModalEntry()

            if (
              topmostModalEntry &&
              !topmostModalEntry.elementRef.current?.contains(
                returnFocusElement,
              )
            ) {
              returnFocusElement =
                topmostModalEntry.elementRef.current || returnFocusElement
            }

            focus(returnFocusElement)
          } finally {
            if (focusSessionRef.current === session) {
              focusSessionRef.current = null
            }
          }
        })
      }
    }, [enabled])

    // Focus on the initial element on enabled.
    useIsoLayoutEffect(() => {
      const popup = popupRef.current
      if (!enabled || !popup) return

      const session = focusSessionRef.current
      const doc = ownerDocument(popup)

      queueMicrotask(() => {
        if (session !== focusSessionRef.current) return

        if (
          popup.contains(doc.activeElement) ||
          !popupManagerRef.current?.isTopmost(entry)
        ) {
          return
        }

        const resolvedInitialFocus =
          (isFunction(initialFocusRef.current)
            ? initialFocusRef.current()
            : initialFocusRef.current) ?? true

        if (resolvedInitialFocus === false) {
          return
        }

        let initialFocusElement: FocusableElement | null = null

        if (
          typeof resolvedInitialFocus === 'object' &&
          resolvedInitialFocus !== null
        ) {
          initialFocusElement = getFocusableElement(
            resolveRef(resolvedInitialFocus),
          )
        }

        initialFocusElement ||= tabbable(popup)[0] || popup

        focus(initialFocusElement)
      })
    }, [enabled])

    // Add an Anchor under Trigger for focus restore to Scope in non-modal mode.
    useIsoLayoutEffect(() => {
      const popup = popupRef.current
      const session = focusSessionRef.current

      if (!enabled || modal || !popup || !session) {
        return
      }

      if (!trigger || !trigger.parentElement) return

      const doc = ownerDocument(popup)

      const host = doc.createElement('span')
      host.setAttribute('data-primitives-ui-anchor-host', '')
      host.setAttribute('aria-hidden', 'true')
      host.style.display = 'contents'

      trigger.after(host)
      setAnchorHost(host)

      let destroyed = false

      function destroy() {
        if (destroyed) return

        destroyed = true
        observer.disconnect()
        host.remove()
        setAnchorHost(null)
      }

      const observer = new MutationObserver(() => {
        if (!trigger.isConnected || !trigger.parentElement) {
          // trigger removed
          destroy()
        } else if (
          host.parentElement !== trigger.parentElement ||
          trigger.nextSibling !== host
        ) {
          // trigger moved
          trigger.after(host)
        }
      })

      observer.observe(trigger.getRootNode(), {
        childList: true,
        subtree: true,
      })

      return destroy
    }, [enabled, modal, trigger])

    // Hide everything outside the floating tree from assistive tech while enabled.
    useIsoLayoutEffect(() => {
      const popup = popupRef.current

      if (!enabled || paused || !popup || !modal) {
        return
      }

      return markOutsideElementsAsHidden(popup)
    }, [enabled, paused, modal])

    // Handle accidental focus falling on the <body> element.
    useEffect(() => {
      const popup = popupRef.current
      if (!popup || !enabled) return

      const doc = ownerDocument(popup)
      return chain(
        addEventListener(popup, 'focusin', (event) => {
          if (pausedRef.current) return
          const target = event.target as HTMLElement

          const candidates = tabbable(popup)
          const tabbableIndex = candidates.indexOf(target)
          if (tabbableIndex !== -1) {
            lastTabbableIndexRef.current = tabbableIndex
          }
        }),
        addEventListener(popup, 'focusout', (event) => {
          const target = event.target as HTMLElement
          queueMicrotask(() => {
            if (pausedRef.current) return
            // Restore focus to the previous tabbable element index to prevent
            // focus from being lost outside the floating tree.
            if (!event.relatedTarget && !isVisible(target)) {
              const prevTabbableIndex = lastTabbableIndexRef.current
              const candidates = tabbable(popup)
              const nextTabbable =
                candidates[prevTabbableIndex] ||
                candidates[candidates.length - 1] ||
                popup
              if (nextTabbable) {
                focus(nextTabbable)
              }
            }
          })
        }),
        addEventListener(
          doc,
          'keydown',
          (event) => {
            if (pausedRef.current) return

            if (
              modalRef.current &&
              event.key === 'Tab' &&
              doc.activeElement === doc.body
            ) {
              focus(popup)
            }
          },
          true,
        ),
      )
    }, [enabled, pausedRef, modalRef])

    useEffect(() => {
      const popup = popupRef.current
      if (!popup || !enabled || modal) return

      const doc = ownerDocument(popup)

      const resetDirection = () => {
        directionRef.current = undefined
      }

      const removeEventListeners = chain(
        addEventListener(
          doc,
          'keydown',
          (event) => {
            if (pausedRef.current) return

            if (event.key === 'Tab') {
              directionRef.current = event.shiftKey ? 'backward' : 'forward'
            }
          },
          true,
        ),
        addEventListener(doc, 'pointerdown', resetDirection, true),
        addEventListener(doc, 'mousedown', resetDirection, true),
      )

      return () => {
        removeEventListeners()
        resetDirection()
      }
    }, [enabled, modal, pausedRef])

    props = {
      tabIndex: -1,
      ...props,
      ref: mergedRefs,
      onPointerDownCapture: handlePointerDownCapture,
      onFocusCapture: handleFocusCapture,
      onBlurCapture: handleBlurCapture,
      onKeyDownCapture: handleKeyDownCapture,
    }

    const context = useMemo(() => ({ entry: entry }), [entry])

    return withMetadata(props, {
      state: {},
      provider: (element: React.ReactNode) => (
        <>
          {enabled ? (
            <FocusGuard
              data-primitives-ui-focus-guard=''
              ref={beforeGuardRef}
              onFocus={handleBeforeGuardFocus}
              tabIndex={paused ? -1 : 0}
            />
          ) : null}
          <PopupProvider value={context}>{element}</PopupProvider>
          {enabled ? (
            <FocusGuard
              data-primitives-ui-focus-guard=''
              ref={afterGuardRef}
              onFocus={handleAfterGuardFocus}
              tabIndex={paused ? -1 : 0}
            />
          ) : null}
          {anchorHost &&
            createPortal(
              <FocusGuard
                ref={anchorRef}
                tabIndex={paused ? -1 : 0}
                onFocus={handleAnchorFocus}
                data-primitives-ui-anchor-guard=''
              />,
              anchorHost,
            )}
        </>
      ),
    })
  },
)

interface FocusSession {
  returnTarget: FocusableElement | null
  preventReturnFocus: boolean
}

export type DismissReason = ESCAPE_KEY | POINTER_DOWN_OUTSIDE | FOCUS_OUTSIDE

export type DismissSource = PopupDismissSource

export type EscapeKeyDownEvent = PreventableEvent<
  KeyboardEvent,
  { reason: ESCAPE_KEY; source: DismissSource }
>

export type PointerDownOutsideEvent = PreventableEvent<
  PointerEvent,
  { reason: POINTER_DOWN_OUTSIDE; source: DismissSource }
>

export type FocusOutsideEvent = PreventableEvent<
  FocusEvent,
  { reason: FOCUS_OUTSIDE; source: DismissSource }
>

interface PopupOwnProps {
  /**
   * Whether the popup prevents interaction with content outside it. This value
   * must remain stable while the popup is enabled.
   * @defaultValue `true`
   */
  modal?: boolean

  /**
   * Whether focus management is active.
   * @defaultValue `false`
   */
  enabled?: boolean

  /**
   * The element that activated the popup. It is used as the preferred target
   * when focus is restored and as an anchor when focus is not looped.
   * @defaultValue `null`
   */
  trigger?: HTMLElement | null

  /**
   * The element to focus when the popup becomes active. Pass `false` to keep
   * the current focus. By default, the first tabbable element is focused, with
   * the popup itself as a fallback.
   */
  initialFocus?:
    | null
    | boolean
    | HTMLElement
    | React.RefObject<HTMLElement | null>
    | (() => boolean | HTMLElement | null | void)

  /**
   * The element to focus when the popup becomes inactive. Pass `false` to
   * disable focus restoration. By default, focus returns to the trigger or the
   * element that was focused before the popup became active.
   */
  returnFocus?:
    | null
    | boolean
    | HTMLElement
    | React.RefObject<HTMLElement | null>
    | (() => boolean | HTMLElement | null | void)

  dismissOnFocusOutside?: boolean

  /**
   * Whether pressing Escape dismisses the popup.
   * @defaultValue `true`
   */
  dismissOnEscapeKeyDown?: boolean

  /**
   * Whether pressing the primary pointer button outside the popup dismisses it.
   * @defaultValue `true`
   */
  dismissOnPointerDownOutside?: boolean

  /**
   * Called when Escape is pressed while this is the topmost popup. Call
   * `event.preventDefault()` to prevent dismissal.
   */
  onEscapeKeyDown?: (event: EscapeKeyDownEvent) => void

  /**
   * Called when the primary pointer button is pressed outside this popup. Call
   * `event.preventDefault()` to prevent dismissal.
   */
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void

  onFocusOutside?: (event: FocusOutsideEvent) => void

  /**
   * Called when a non-prevented interaction should dismiss the popup.
   */
  onDismiss?: (
    event: EscapeKeyDownEvent | PointerDownOutsideEvent | FocusOutsideEvent,
  ) => void
}

export interface PopupState {}

export type UsePopupProps<Element extends HTMLElements = 'div'> = HookProps<
  Element,
  PopupOwnProps
>

function isVisible(element: HTMLElement): boolean {
  if (!element.isConnected) return false

  if (typeof element.checkVisibility === 'function') {
    return element.checkVisibility()
  }

  const styles = ownerWindow(element).getComputedStyle(element)

  if (
    !styles ||
    styles.visibility === 'hidden' ||
    styles.visibility === 'collapse'
  ) {
    return false
  }

  return styles.display !== 'none' && styles.display !== 'contents'
}

function getFocusableElement(element: Element | null): FocusableElement | null {
  return element && isFocusable(element) ? (element as FocusableElement) : null
}
