import type {
  PopupDismissSource,
  PopupStoreContext,
  PopupStoreState,
  PopupOpenChangeReason,
} from '../popup'
import type {
  ChangeDetails,
  BoundStore,
  CHANGE_REASONS,
  Store,
  StoreScope,
} from '../utils'
import {
  createPopupStoreActions,
  createPopupStoreContext,
  createPopupStoreState,
} from '../popup'
import { createStore, createUseStore } from '../utils'

export type ModalOpenChangeReason =
  | CHANGE_REASONS['closePress']
  | CHANGE_REASONS['triggerPress']
  | CHANGE_REASONS['ancestorClose']
  | PopupOpenChangeReason

export type ModalOpenChangeDetails = ChangeDetails<
  ModalOpenChangeReason,
  {
    trigger?: HTMLElement | undefined
    dismissSource?: PopupDismissSource
  }
>

export interface ModalStoreState extends PopupStoreState {
  modalTitleId: string | undefined
  modalPopupId: string | undefined
  modalDescriptionId: string | undefined
}

export function createModalStoreState(
  initialState?: Partial<ModalStoreState>,
): ModalStoreState {
  return {
    ...createPopupStoreState(),
    modalTitleId: undefined,
    modalPopupId: undefined,
    modalDescriptionId: undefined,
    ...initialState,
  }
}

export interface ModalStoreContext extends PopupStoreContext<ModalOpenChangeDetails> {}

export function createModalStoreContext(): ModalStoreContext {
  return {
    ...createPopupStoreContext<ModalOpenChangeDetails>(),
  }
}

export const modalSelectors = {
  open: (state: ModalStoreState) => state.openProp ?? state.open,
  modal: (state: ModalStoreState) => state.modal,
  modalTitleId: (state: ModalStoreState) => state.modalTitleId,
  modalPopupId: (state: ModalStoreState) => state.modalPopupId,
  triggerIdProp: (state: ModalStoreState) => state.triggerIdProp,
  triggerId: (state: ModalStoreState) => state.triggerId,
  activeTriggerId: (state: ModalStoreState) =>
    state.triggerIdProp ?? state.triggerId,
  modalDescriptionId: (state: ModalStoreState) => state.modalDescriptionId,
}

export function createModalStoreActions() {
  return (scope: StoreScope<ModalStoreState, ModalStoreContext>) => {
    const popupActions =
      createPopupStoreActions<ModalOpenChangeDetails>()(scope)

    return {
      ...popupActions,
    }
  }
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

export const useModalStore = createUseStore(() => ({
  state: createModalStoreState(),
  context: createModalStoreContext(),
  actions: createModalStoreActions(),
}))

interface ModalStoreInitialState {
  modal?: boolean
  open?: boolean
  defaultOpen?: boolean
  triggerId?: string | undefined
  defaultTriggerId?: string | undefined
}

// initialState should use synchronously‑passed props to prevent unnecessary renders.
export const createModalStore = (initialState?: ModalStoreInitialState) =>
  createStore({
    state: createModalStoreState({
      openProp: initialState?.open,
      triggerId: initialState?.defaultTriggerId,
      triggerIdProp: initialState?.triggerId,
      modal: initialState?.modal ?? true,
      open: initialState?.defaultOpen ?? false,
    }),
    context: createModalStoreContext(),
  })
