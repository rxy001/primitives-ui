'use client'

import { useMergeRefs } from '@primitives-ui/hooks'
import { __DEV__ } from '@primitives-ui/utils'
import { useRef } from 'react'
import type { Placement, UsePopupProps } from '../utils'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import {
  usePopup,
  createHook,
  createPrimitive,
  useResolvedId,
  withMetadata,
  useScrollLock,
} from '../utils'
import {
  usePopoverPortalContext,
  usePopoverPositionerContext,
  usePopoverRootContext,
} from './PopoverContext'
import { stateAttributesMapping } from './stateAttributesMapping'
import { popoverSelectors } from './store'

export const usePopoverPopup = createHook<
  'div',
  PopoverPopupOwnProps,
  PopoverPopupState
>(
  ({
    initialFocus,
    returnFocus,
    dismissOnEscapeKeyDown,
    dismissOnPointerDownOutside,
    dismissOnFocusOutside,
    preventScroll,
    ...props
  }) => {
    const { store } = usePopoverRootContext()
    const positionerContext = usePopoverPositionerContext()

    if (__DEV__) {
      const isInPortal = !!usePopoverPortalContext()
      if (!isInPortal) {
        throw new Error(`Primitives UI: Popover.Portal is missing.`)
      }

      const isInPositioner = !!positionerContext
      if (!isInPositioner) {
        throw new Error(`Primitives UI: Popover.Positioner is missing.`)
      }
    }

    const { placement } = positionerContext!
    const open = store.useSelector(popoverSelectors.open)
    const modal = store.useSelector(popoverSelectors.modal)
    const popoverTitleId = store.useSelector(popoverSelectors.popoverTitleId)
    const popoverDescriptionId = store.useSelector(
      popoverSelectors.popoverDescriptionId,
    )
    const popupRef = useRef<HTMLDivElement>(null)
    const mergedRefs = useMergeRefs(popupRef, props.ref)
    const id = useResolvedId(props.id)

    store.useSyncStateWithCleanup('popoverPopupId', id)

    props = {
      role: 'dialog',
      'aria-labelledby': popoverTitleId || undefined,
      'aria-describedby': popoverDescriptionId || undefined,
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
        placement,
      },
    })
  },
)

export function PopoverPopup({ render, ...other }: PopoverPopupProps) {
  const props = usePopoverPopup(other)

  return createPrimitive('div', props, {
    render,
    stateAttributesMapping,
  })
}

PopoverPopup.displayName = 'PopoverPopup'

interface PopoverPopupOwnProps {
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

export interface PopoverPopupState {
  open: boolean
  placement: Placement
}

export type UsePopoverPopupProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, PopoverPopupOwnProps>

export interface PopoverPopupProps extends UsePopoverPopupProps {
  render?: RenderProp<PopoverPopupState>
}
