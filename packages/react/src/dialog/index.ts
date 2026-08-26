import { DialogBackdrop, useDialogBackdrop } from './DialogBackdrop'
import { DialogClose, useDialogClose } from './DialogClose'
import { DialogDescription, useDialogDescription } from './DialogDescription'
import { DialogPopup, useDialogPopup } from './DialogPopup'
import { DialogPortal, useDialogPortal } from './DialogPortal'
import { DialogRoot, useDialogRoot } from './DialogRoot'
import { DialogTitle, useDialogTitle } from './DialogTitle'
import { DialogTrigger, useDialogTrigger } from './DialogTrigger'
import { DialogViewport, useDialogViewport } from './DialogViewport'
import { createDialogStore } from './store'

const Dialog = {
  Root: DialogRoot,
  Backdrop: DialogBackdrop,
  Popup: DialogPopup,
  Title: DialogTitle,
  Description: DialogDescription,
  Trigger: DialogTrigger,
  Close: DialogClose,
  Portal: DialogPortal,
  Viewport: DialogViewport,
  createStore: createDialogStore,
}

export {
  Dialog,
  useDialogRoot,
  useDialogBackdrop,
  useDialogClose,
  useDialogDescription,
  useDialogTitle,
  useDialogTrigger,
  useDialogPopup,
  useDialogPortal,
  useDialogViewport,
  createDialogStore,
}

export type { DialogStore } from './store'

export type {
  DialogRootProps,
  DialogRootState,
  UseDialogRootProps,
  DialogOpenChangeDetails,
  DialogOpenChangeReason,
} from './DialogRoot'

export type {
  UseDialogTriggerProps,
  DialogTriggerProps,
  DialogTriggerState,
} from './DialogTrigger'

export type {
  UseDialogBackdropProps,
  DialogBackdropProps,
  DialogBackdropState,
} from './DialogBackdrop'

export type {
  UseDialogCloseProps,
  DialogCloseProps,
  DialogCloseState,
} from './DialogClose'

export type {
  UseDialogDescriptionProps,
  DialogDescriptionProps,
  DialogDescriptionState,
} from './DialogDescription'

export type {
  UseDialogPopupProps,
  DialogPopupProps,
  DialogPopupState,
} from './DialogPopup'

export type {
  UseDialogPortalProps,
  DialogPortalProps,
  DialogPortalState,
} from './DialogPortal'

export type {
  UseDialogTitleProps,
  DialogTitleProps,
  DialogTitleState,
} from './DialogTitle'

export type {
  UseDialogViewportProps,
  DialogViewportProps,
  DialogViewportState,
} from './DialogViewport'
