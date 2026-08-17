'use client'

import type {
  ModalOpenChangeDetails,
  ModalOpenChangeReason,
  ModalRootState,
  UseModalRootProps,
} from '../modal'
import type { AlertDialogStore } from './store'
import { useModalRoot } from '../modal'
import { getMetadataProvider } from '../utils'

export const useAlertDialogRoot = (props: UseAlertDialogRootProps) =>
  useModalRoot(props)

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

  store?: AlertDialogStore

  defaultTrigger?: UseModalRootProps['trigger']

  trigger?: UseModalRootProps['trigger']

  modal?: boolean
}

export interface AlertDialogRootProps extends UseAlertDialogRootProps {
  children?: React.ReactNode
}
