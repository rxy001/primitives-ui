import type { ModalBoundStore, ModalStore } from '../modal'
import { useModalStore } from '../modal'

export type AlertDialogStore = ModalStore

export type AlertDialogBoundStore = ModalBoundStore

export const useAlertDialogStore = useModalStore
