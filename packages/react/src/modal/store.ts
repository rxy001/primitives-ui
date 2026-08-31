import type { PopupDismissSource } from '../popup/PopupManager'
import type { BoundStore, Store, StoreScope } from '../utils'
import type { ChangeDetails, CHANGE_REASONS } from '../utils'
import { createStore, createUseStore } from '../utils'

export type ModalOpenChangeReason =
  | CHANGE_REASONS['closePress']
  | CHANGE_REASONS['escapeKey']
  | CHANGE_REASONS['focusOutside']
  | CHANGE_REASONS['pointerDownOutside']
  | CHANGE_REASONS['triggerPress']
  | CHANGE_REASONS['ancestorClose']

export type ModalOpenChangeDetails = ChangeDetails<
  ModalOpenChangeReason,
  {
    trigger?: HTMLElement | undefined
    dismissSource?: PopupDismissSource
  }
>

export interface ModalStoreState {
  open: boolean
  modal: boolean
  modalTitleId: string | undefined
  modalPopupId: string | undefined
  modalDescriptionId: string | undefined
  triggerIdProp: string | undefined
  triggerId: string | undefined
  openProp: boolean | undefined
}

export function createModalStoreState(
  initialState?: Partial<ModalStoreState>,
): ModalStoreState {
  return {
    open: false,
    modal: true,
    modalTitleId: undefined,
    modalPopupId: undefined,
    modalDescriptionId: undefined,
    triggerId: undefined,
    triggerIdProp: undefined,
    openProp: undefined,
    ...initialState,
  }
}

export interface ModalStoreContext {
  triggerElements: HTMLElement[]
  onOpenChangeProp?:
    | ((open: boolean, details: ModalOpenChangeDetails) => void)
    | undefined
}

export function createModalStoreContext(): ModalStoreContext {
  return {
    triggerElements: [],
    onOpenChangeProp: undefined,
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
    function setOpen(nextOpen: boolean, details: ModalOpenChangeDetails) {
      const context = scope.getContext()
      context.onOpenChangeProp?.(nextOpen, details)

      if (details.isCanceled) return

      if (scope.isValueControlled('openProp')) {
        // observe may update within the same React render phase
        const unobserve = scope.observe((currentState, previousState) => {
          if (currentState.openProp !== previousState.openProp) {
            scope.setState({
              triggerId: nextOpen ? details.trigger?.id : undefined,
            })
            unobserve()
          }
        })

        return
      }

      scope.setState({
        open: nextOpen,
        triggerId: nextOpen ? details.trigger?.id : undefined,
      })
    }

    return {
      open(details: ModalOpenChangeDetails) {
        setOpen(true, details)
      },
      close(details: ModalOpenChangeDetails) {
        setOpen(false, details)
      },
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

interface InitialState {
  modal?: boolean
  open?: boolean
  defaultOpen?: boolean
  triggerId?: string | undefined
  defaultTriggerId?: string | undefined
}

// initialState should use synchronously‑passed props to prevent unnecessary renders.
export const createModalStore = (initialState?: InitialState) =>
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
