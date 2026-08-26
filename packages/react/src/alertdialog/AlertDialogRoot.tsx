'use client'

import type {
  ModalOpenChangeDetails,
  ModalOpenChangeReason,
  ModalRootState,
} from '../modal'
import type { AlertDialogStore } from './store'
import { useModalRoot } from '../modal'
import { getMetadataProvider } from '../utils'

export const useAlertDialogRoot = (props: UseAlertDialogRootProps) =>
  useModalRoot(props, 'AlertDialog')

export function AlertDialogRoot({ children, ...other }: AlertDialogRootProps) {
  const props = useAlertDialogRoot(other)
  const provider = getMetadataProvider(props)

  return provider(children)
}

AlertDialogRoot.displayName = 'AlertDialogRoot'

export interface AlertDialogRootState extends ModalRootState {}

export type AlertDialogOpenChangeReason = ModalOpenChangeReason

export type AlertDialogOpenChangeDetails = ModalOpenChangeDetails

export interface UseAlertDialogRootProps {
  open?: boolean

  defaultOpen?: boolean

  onOpenChange?: (open: boolean, details: AlertDialogOpenChangeDetails) => void

  triggerId?: string

  defaultTriggerId?: string

  modal?: boolean

  store?: AlertDialogStore
}

export interface AlertDialogRootProps extends UseAlertDialogRootProps {
  children?: React.ReactNode
}
