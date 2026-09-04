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
import { stateAttributesMapping } from './stateAttributesMapping'
import { tooltipSelectors } from './store'
import {
  useTooltipPortalContext,
  useTooltipPositionerContext,
  useTooltipRootContext,
} from './TooltipContext'

export const useTooltipPopup = createHook<
  'div',
  TooltipPopupOwnProps,
  TooltipPopupState
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
    const { store } = useTooltipRootContext()
    const positionerContext = useTooltipPositionerContext()

    if (__DEV__) {
      const isInPortal = !!useTooltipPortalContext()
      if (!isInPortal) {
        throw new Error(`Primitives UI: Tooltip.Portal is missing.`)
      }

      const isInPositioner = !!positionerContext
      if (!isInPositioner) {
        throw new Error(`Primitives UI: Tooltip.Positioner is missing.`)
      }
    }

    const { placement } = positionerContext!
    const open = store.useSelector(tooltipSelectors.open)
    const modal = store.useSelector(tooltipSelectors.modal)
    const popupRef = useRef<HTMLDivElement>(null)
    const mergedRefs = useMergeRefs(popupRef, props.ref)
    const id = useResolvedId(props.id)

    props = {
      role: 'tooltip',
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

export function TooltipPopup({ render, ...other }: TooltipPopupProps) {
  const props = useTooltipPopup(other)

  return createPrimitive('div', props, {
    render,
    stateAttributesMapping,
  })
}

TooltipPopup.displayName = 'TooltipPopup'

interface TooltipPopupOwnProps {
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

export interface TooltipPopupState {
  open: boolean
  placement: Placement
}

export type UseTooltipPopupProps<Element extends HTMLElements = 'div'> =
  HookProps<Element, TooltipPopupOwnProps>

export interface TooltipPopupProps extends UseTooltipPopupProps {
  render?: RenderProp<TooltipPopupState>
}
