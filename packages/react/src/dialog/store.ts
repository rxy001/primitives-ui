import type { ModalStore } from '../modal'
import { createModalStore } from '../modal'

export type DialogStore = ModalStore

export const createDialogStore = createModalStore
