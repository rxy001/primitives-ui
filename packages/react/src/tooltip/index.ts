import { createTooltipStore } from './store'
import { TooltipArrow, useTooltipArrow } from './TooltipArrow'
import { TooltipPopup, useTooltipPopup } from './TooltipPopup'
import { TooltipPortal, useTooltipPortal } from './TooltipPortal'
import { TooltipPositioner, useTooltipPositioner } from './TooltipPositioner'
import { TooltipRoot, useTooltipRoot } from './TooltipRoot'
import { TooltipTrigger, useTooltipTrigger } from './TooltipTrigger'

const Tooltip = {
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Portal: TooltipPortal,
  Positioner: TooltipPositioner,
  Popup: TooltipPopup,
  Arrow: TooltipArrow,
  createStore: createTooltipStore,
}

export {
  Tooltip,
  useTooltipRoot,
  useTooltipTrigger,
  useTooltipPortal,
  useTooltipPositioner,
  useTooltipPopup,
  useTooltipArrow,
  createTooltipStore,
}

export type {
  TooltipStore,
  TooltipOpenChangeDetails,
  TooltipOpenChangeReason,
} from './store'

export type {
  TooltipRootProps,
  TooltipRootState,
  UseTooltipRootProps,
} from './TooltipRoot'

export type {
  TooltipTriggerProps,
  TooltipTriggerState,
  UseTooltipTriggerProps,
} from './TooltipTrigger'

export type {
  TooltipPortalProps,
  TooltipPortalState,
  UseTooltipPortalProps,
} from './TooltipPortal'

export type {
  TooltipPositionerProps,
  TooltipPositionerState,
  UseTooltipPositionerProps,
} from './TooltipPositioner'

export type {
  TooltipPopupProps,
  TooltipPopupState,
  UseTooltipPopupProps,
} from './TooltipPopup'

export type {
  TooltipArrowProps,
  TooltipArrowState,
  UseTooltipArrowProps,
} from './TooltipArrow'
