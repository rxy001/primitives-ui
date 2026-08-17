import { ModalBackdrop, useModalBackdrop } from './ModalBackdrop'
import { ModalClose, useModalClose } from './ModalClose'
import { ModalDescription, useModalDescription } from './ModalDescription'
import { ModalPopup, useModalPopup } from './ModalPopup'
import { ModalPortal, useModalPortal } from './ModalPortal'
import { ModalRoot, useModalRoot } from './ModalRoot'
import { ModalTitle, useModalTitle } from './ModalTitle'
import { ModalTrigger, useModalTrigger } from './ModalTrigger'

const Modal = {
  Root: ModalRoot,
  Backdrop: ModalBackdrop,
  Popup: ModalPopup,
  Title: ModalTitle,
  Description: ModalDescription,
  Trigger: ModalTrigger,
  Close: ModalClose,
  Portal: ModalPortal,
}

export {
  Modal,
  useModalRoot,
  useModalBackdrop,
  useModalClose,
  useModalDescription,
  useModalTitle,
  useModalTrigger,
  useModalPopup,
  useModalPortal,
}

export { useModalStore } from './store'

export type {
  ModalRootProps,
  ModalRootState,
  UseModalRootProps,
  ModalOpenChangeDetails,
  ModalOpenChangeReason,
} from './ModalRoot'

export type {
  UseModalTriggerProps,
  ModalTriggerProps,
  ModalTriggerState,
} from './ModalTrigger'

export type {
  UseModalBackdropProps,
  ModalBackdropProps,
  ModalBackdropState,
} from './ModalBackdrop'

export type {
  UseModalCloseProps,
  ModalCloseProps,
  ModalCloseState,
} from './ModalClose'

export type {
  UseModalDescriptionProps,
  ModalDescriptionProps,
  ModalDescriptionState,
} from './ModalDescription'

export type {
  UseModalPopupProps,
  ModalPopupProps,
  ModalPopupState,
} from './ModalPopup'

export type {
  UseModalPortalProps,
  ModalPortalProps,
  ModalPortalState,
} from './ModalPortal'

export type {
  UseModalTitleProps,
  ModalTitleProps,
  ModalTitleState,
} from './ModalTitle'
