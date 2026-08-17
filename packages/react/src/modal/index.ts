import { useModalBackdrop } from './useModalBackdrop'
import { useModalClose } from './useModalClose'
import { useModalDescription } from './useModalDescription'
import { useModalPopup } from './useModalPopup'
import { useModalPortal } from './useModalPortal'
import { useModalRoot } from './useModalRoot'
import { useModalTitle } from './useModalTitle'
import { useModalTrigger } from './useModalTrigger'

export {
  useModalRoot,
  useModalBackdrop,
  useModalClose,
  useModalDescription,
  useModalTitle,
  useModalTrigger,
  useModalPopup,
  useModalPortal,
}

export { useModalRootContext } from './ModalContext'

export { useModalStore } from './store'
export type { ModalBoundStore, ModalStore } from './store'

export type {
  ModalRootState,
  UseModalRootProps,
  ModalOpenChangeDetails,
  ModalOpenChangeReason,
} from './useModalRoot'

export type { UseModalTriggerProps, ModalTriggerState } from './useModalTrigger'

export type {
  UseModalBackdropProps,
  ModalBackdropState,
} from './useModalBackdrop'

export type { UseModalCloseProps, ModalCloseState } from './useModalClose'

export type {
  UseModalDescriptionProps,
  ModalDescriptionState,
} from './useModalDescription'

export type { UseModalPopupProps, ModalPopupState } from './useModalPopup'

export type { UseModalPortalProps, ModalPortalState } from './useModalPortal'

export type { UseModalTitleProps, ModalTitleState } from './useModalTitle'
