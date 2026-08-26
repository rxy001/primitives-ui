import {
  AlertDialogBackdrop,
  useAlertDialogBackdrop,
} from './AlertDialogBackdrop'
import { AlertDialogClose, useAlertDialogClose } from './AlertDialogClose'
import {
  AlertDialogDescription,
  useAlertDialogDescription,
} from './AlertDialogDescription'
import { AlertDialogPopup, useAlertDialogPopup } from './AlertDialogPopup'
import { AlertDialogPortal, useAlertDialogPortal } from './AlertDialogPortal'
import { AlertDialogRoot, useAlertDialogRoot } from './AlertDialogRoot'
import { AlertDialogTitle, useAlertDialogTitle } from './AlertDialogTitle'
import { AlertDialogTrigger, useAlertDialogTrigger } from './AlertDialogTrigger'
import {
  AlertDialogViewport,
  useAlertDialogViewport,
} from './AlertDialogViewport'
import { createAlertDialogStore } from './store'

const AlertDialog = {
  Root: AlertDialogRoot,
  Backdrop: AlertDialogBackdrop,
  Popup: AlertDialogPopup,
  Title: AlertDialogTitle,
  Description: AlertDialogDescription,
  Trigger: AlertDialogTrigger,
  Close: AlertDialogClose,
  Portal: AlertDialogPortal,
  Viewport: AlertDialogViewport,
  createStore: createAlertDialogStore,
}

export {
  AlertDialog,
  useAlertDialogRoot,
  useAlertDialogBackdrop,
  useAlertDialogClose,
  useAlertDialogDescription,
  useAlertDialogTitle,
  useAlertDialogTrigger,
  useAlertDialogPopup,
  useAlertDialogPortal,
  useAlertDialogViewport,
  createAlertDialogStore,
}

export type { AlertDialogStore } from './store'

export type {
  AlertDialogRootProps,
  AlertDialogRootState,
  UseAlertDialogRootProps,
  AlertDialogOpenChangeDetails,
  AlertDialogOpenChangeReason,
} from './AlertDialogRoot'

export type {
  UseAlertDialogTriggerProps,
  AlertDialogTriggerProps,
  AlertDialogTriggerState,
} from './AlertDialogTrigger'

export type {
  UseAlertDialogBackdropProps,
  AlertDialogBackdropProps,
  AlertDialogBackdropState,
} from './AlertDialogBackdrop'

export type {
  UseAlertDialogCloseProps,
  AlertDialogCloseProps,
  AlertDialogCloseState,
} from './AlertDialogClose'

export type {
  UseAlertDialogDescriptionProps,
  AlertDialogDescriptionProps,
  AlertDialogDescriptionState,
} from './AlertDialogDescription'

export type {
  UseAlertDialogPopupProps,
  AlertDialogPopupProps,
  AlertDialogPopupState,
} from './AlertDialogPopup'

export type {
  UseAlertDialogPortalProps,
  AlertDialogPortalProps,
  AlertDialogPortalState,
} from './AlertDialogPortal'

export type {
  UseAlertDialogTitleProps,
  AlertDialogTitleProps,
  AlertDialogTitleState,
} from './AlertDialogTitle'

export type {
  UseAlertDialogViewportProps,
  AlertDialogViewportProps,
  AlertDialogViewportState,
} from './AlertDialogViewport'
