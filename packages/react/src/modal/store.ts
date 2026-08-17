import type { UsePopupProps } from '../popup'
import type { BoundStore, Store, StoreScope } from '../utils'
import type { ModalOpenChangeDetails } from './useModalRoot'
import { createStoreHook } from '../utils'

export interface ModalStoreState {
  open: boolean
  modal: boolean
  modalTitleId: string | undefined
  modalPopupId: string | undefined
  modalDescriptionId: string | undefined
  activeTrigger: HTMLElement | undefined
  triggerProp: UsePopupProps['trigger']
}

export function createModalStoreState(): ModalStoreState {
  return {
    open: false,
    modal: true,
    modalTitleId: undefined,
    modalPopupId: undefined,
    modalDescriptionId: undefined,
    activeTrigger: undefined,
    triggerProp: undefined,
  }
}

export interface ModalStoreContext {
  triggerElements: HTMLElement[]
  openChangeDetails: ModalOpenChangeDetails | null
}

export function createModalStoreContext(): ModalStoreContext {
  return {
    triggerElements: [],
    openChangeDetails: null,
  }
}

export const modalSelectors = {
  open: (state: Readonly<ModalStoreState>) => state.open,
  modal: (state: Readonly<ModalStoreState>) => state.modal,
  modalTitleId: (state: Readonly<ModalStoreState>) => state.modalTitleId,
  modalPopupId: (state: Readonly<ModalStoreState>) => state.modalPopupId,
  triggerProp: (state: Readonly<ModalStoreState>) => state.triggerProp,
  activeTrigger: (state: Readonly<ModalStoreState>) => state.activeTrigger,
  modalDescriptionId: (state: Readonly<ModalStoreState>) =>
    state.modalDescriptionId,
}

export function createModalStoreActions() {
  return (scope: StoreScope<ModalStoreState, ModalStoreContext>) => ({
    open(details: ModalOpenChangeDetails) {
      scope.setContext({
        openChangeDetails: details,
      })
      scope.setState({
        open: true,
        activeTrigger: details.trigger,
      })
    },
    close(details: ModalOpenChangeDetails) {
      scope.setContext({
        openChangeDetails: details,
      })
      scope.setState({
        open: false,
        activeTrigger: undefined,
      })
    },
    clearActiveTrigger() {
      scope.setState({
        activeTrigger: undefined,
      })
    },
  })
}

export type ModalStoreActions = ReturnType<
  ReturnType<typeof createModalStoreActions>
>

export type ModalStore = Store<ModalStoreState, ModalStoreContext>

export type ModalBoundStore = BoundStore<
  ModalStoreState,
  ModalStoreContext,
  ModalStoreActions
>

export const useModalStore = createStoreHook<
  ModalStoreState,
  ModalStoreContext,
  ModalStoreActions
>(() => ({
  state: createModalStoreState(),
  context: createModalStoreContext(),
  actions: createModalStoreActions(),
}))
