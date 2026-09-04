'use client'

import { useMergeRefs } from '@primitives-ui/hooks'
import { __DEV__ } from '@primitives-ui/utils'
import { useRef } from 'react'
import type { UsePopupProps } from '../popup'
import type { HookProps, HTMLElements } from '../utils/types'
import type { ModalRootContextValue } from './ModalContext'
import { usePopup } from '../popup'
import {
  createHook,
  useResolvedId,
  withMetadata,
  useScrollLock,
} from '../utils'
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
      dismissOnEscapeKeyDown,
      dismissOnPointerDownOutside,
      dismissOnFocusOutside,
      preventScroll,
      ...props
    },
    componentName,
  ) => {
    const { store, component, nested } = useModalRootContext()

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
    const modalTitleId = store.useSelector(modalSelectors.modalTitleId)
    const modalDescriptionId = store.useSelector(
      modalSelectors.modalDescriptionId,
    )
    const popupRef = useRef<HTMLDivElement>(null)
    const mergedRefs = useMergeRefs(popupRef, props.ref)
    const id = useResolvedId(props.id)

    store.useSyncStateWithCleanup('modalPopupId', id)

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
      store,
      initialFocus,
      returnFocus,
      dismissOnEscapeKeyDown,
      dismissOnFocusOutside,
      dismissOnPointerDownOutside,
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
