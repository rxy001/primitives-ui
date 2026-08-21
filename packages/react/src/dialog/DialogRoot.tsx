'use client'

import type {
  ModalOpenChangeDetails,
  ModalOpenChangeReason,
  ModalRootState,
  UseModalRootProps,
} from '../modal'
import type { DialogStore } from './store'
import { useModalRoot } from '../modal'
import { getMetadataProvider } from '../utils'

export const useDialogRoot = (props: UseDialogRootProps) =>
  useModalRoot(props, 'Dialog')

export function DialogRoot({ children, ...other }: DialogRootProps) {
  const props = useDialogRoot(other)
  const provider = getMetadataProvider(props)

  return provider(children)
}

DialogRoot.displayName = 'DialogRoot'

export interface DialogRootState extends ModalRootState {}

export type DialogOpenChangeReason = ModalOpenChangeReason

export type DialogOpenChangeDetails = ModalOpenChangeDetails

export interface UseDialogRootProps {
  open?: boolean

  defaultOpen?: boolean

  onOpenChange?: (open: boolean, details: DialogOpenChangeDetails) => void

  store?: DialogStore

  defaultTrigger?: UseModalRootProps['trigger']

  trigger?: UseModalRootProps['trigger']

  modal?: boolean
}

export interface DialogRootProps extends UseDialogRootProps {
  children?: React.ReactNode
}
