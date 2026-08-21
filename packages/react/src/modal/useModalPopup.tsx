'use client'

import { useMergeRefs } from '@primitives-ui/hooks'
import { __DEV__ } from '@primitives-ui/utils'
import { useRef } from 'react'
import type { UsePopupProps } from '../popup'
import type { HookProps, HTMLElements } from '../utils/types'
import type { ModalRootContextValue } from './ModalContext'
import { usePopup } from '../popup'
import {
  createChangeDetails,
  createHook,
  useResolvedId,
  withMetadata,
} from '../utils'
import { useScrollLock } from '../utils'
import { useModalPortalContext, useModalRootContext } from './ModalContext'
import { modalSelectors } from './store'

export const useModalPopup = createHook<
  'div',
  ModalPopupOwnProps,
  ModalPopupState,
  false,
  ModalRootContextValue['component']
>(
  (
    {
      initialFocus,
      returnFocus,
      onPointerDownOutside,
      onEscapeKeyDown,
      onFocusOutside,
      onDismiss,
      dismissOnEscapeKeyDown,
      dismissOnPointerDownOutside,
      dismissOnFocusOutside,
      preventScroll,
      ...props
    },
    componentName,
  ) => {
    const { store, component } = useModalRootContext()

    if (__DEV__) {
      if (component !== componentName) {
        console.error(
          'Warning: %s.Popup cannot be used with %s.Root.',
          componentName,
          component,
        )
      }

      const isInPortal = !!useModalPortalContext()

      if (!isInPortal) {
        throw new Error(`Primitives UI: ${componentName}.Portal is missing.`)
      }
    }

    const open = store.useSelector(modalSelectors.open)
    const modal = store.useSelector(modalSelectors.modal)
    const triggerProp = store.useSelector(modalSelectors.triggerProp)
    const activeTrigger = store.useSelector(modalSelectors.activeTrigger)
    const modalTitleId = store.useSelector(modalSelectors.modalTitleId)
    const nested = store.useSelector(modalSelectors.nested)
    const modalDescriptionId = store.useSelector(
      modalSelectors.modalDescriptionId,
    )
    const popupRef = useRef<HTMLDivElement>(null)
    const mergedRefs = useMergeRefs(popupRef, props.ref)
    const id = useResolvedId(props.id)

    store.useSyncValueWithCleanup('modalPopupId', id)

    props = {
      role: 'dialog',
      'aria-labelledby': modalTitleId || undefined,
      'aria-describedby': modalDescriptionId || undefined,
      ...props,
      id,
      ref: mergedRefs,
    }

    const popupProps = usePopup({
      ...props,
      modal,
      enabled: open,
      initialFocus,
      returnFocus,
      dismissOnEscapeKeyDown,
      dismissOnFocusOutside,
      dismissOnPointerDownOutside,
      onFocusOutside,
      onEscapeKeyDown,
      onPointerDownOutside,
      onDismiss: (event) => {
        onDismiss?.(event)

        store.close(
          createChangeDetails(event.reason, event.originalEvent, {
            dismissSource: event.source,
          }),
        )
      },
      trigger: triggerProp ?? activeTrigger,
    })

    useScrollLock(popupRef, open && (preventScroll ?? modal))

    return withMetadata(popupProps, {
      state: {
        open,
        nested,
      },
    })
  },
)

interface ModalPopupOwnProps {
  /**
   * Whether pressing Escape closes the modal.
   * @defaultValue `true`
   */
  dismissOnEscapeKeyDown?: UsePopupProps['dismissOnEscapeKeyDown']

  /**
   * Whether pressing the primary pointer button outside the popup closes the
   * modal.
   * @defaultValue `true`
   */
  dismissOnPointerDownOutside?: UsePopupProps['dismissOnPointerDownOutside']

  /**
   * Called when Escape is pressed while this is the topmost popup. Call
   * `event.preventDefault()` to prevent the modal from closing.
   */
  onEscapeKeyDown?: UsePopupProps['onEscapeKeyDown']

  /**
   * Called when the primary pointer button is pressed outside the popup. Call
   * `event.preventDefault()` to prevent the modal from closing.
   */
  onPointerDownOutside?: UsePopupProps['onPointerDownOutside']

  onFocusOutside?: UsePopupProps['onFocusOutside']

  onDismiss?: UsePopupProps['onDismiss']

  /**
   * The element to focus when the modal opens. Pass `false` to keep the current
   * focus. By default, the first tabbable element is focused.
   */
  initialFocus?: UsePopupProps['initialFocus']

  /**
   * The element to focus when the modal closes. Pass `false` to disable focus
   * restoration. By default, focus returns to the modal trigger.
   */
  returnFocus?: UsePopupProps['returnFocus']

  /**
   * Whether to prevent the document from scrolling while the modal is open.
   * Defaults to `true` in `modal` mode and `false` in other modes.
   */
  preventScroll?: boolean

  dismissOnFocusOutside?: boolean
}

export interface ModalPopupState {
  open: boolean

  nested: boolean
}

export type UseModalPopupProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, ModalPopupOwnProps>
