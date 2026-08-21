import { useRef } from 'react'
import type { ModalStore } from '../modal'
import { createModalStore } from '../modal'

export type AlertDialogStore = ModalStore

export const useAlertDialogStore = () => {
  const ref = useRef<AlertDialogStore>(null as unknown as AlertDialogStore)

  if (!ref.current) {
    ref.current = createModalStore()
  }

  return ref.current
}
