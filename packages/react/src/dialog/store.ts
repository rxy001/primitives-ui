import type { ModalBoundStore, ModalStore } from '../modal'
import { useModalStore } from '../modal'

export type DialogStore = ModalStore

export type DialogBoundStore = ModalBoundStore

export const useDialogStore = useModalStore
