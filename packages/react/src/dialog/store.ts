import { useRef } from 'react'
import type { ModalStore } from '../modal'
import { createModalStore } from '../modal'

export type DialogStore = ModalStore

export const useDialogStore = () => {
  const ref = useRef<DialogStore>(null as unknown as DialogStore)

  if (!ref.current) {
    ref.current = createModalStore()
  }

  return ref.current
}
