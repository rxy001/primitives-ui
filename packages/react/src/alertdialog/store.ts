import type { ModalStore } from '../modal'
import { createModalStore } from '../modal'

export type AlertDialogStore = ModalStore

export const createAlertDialogStore = createModalStore
