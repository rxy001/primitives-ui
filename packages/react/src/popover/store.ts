import type { PopupDismissSource } from '../popup'
import type { BoundStore, Store, StoreScope } from '../utils'
import type { CHANGE_REASONS, ChangeDetails } from '../utils'
import { createStore, createUseStore } from '../utils'

export interface PopoverStoreState {
  open: boolean
  modal: boolean
  popoverTitleId: string | undefined
  popoverPopupId: string | undefined
  popoverDescriptionId: string | undefined
  triggerId: string | undefined
  triggerIdProp: string | undefined
  openProp: boolean | undefined
}

export function createPopoverStoreState(
  initialState?: Partial<PopoverStoreState>,
): PopoverStoreState {
  return {
    open: false,
    modal: false,
    popoverTitleId: undefined,
    popoverPopupId: undefined,
    popoverDescriptionId: undefined,
    triggerId: undefined,
    triggerIdProp: undefined,
    openProp: undefined,
    ...initialState,
  }
}

export type PopoverOpenChangeReason =
  | CHANGE_REASONS['closePress']
  | CHANGE_REASONS['escapeKey']
  | CHANGE_REASONS['focusOutside']
  | CHANGE_REASONS['pointerDownOutside']
  | CHANGE_REASONS['triggerPress']

export type PopoverOpenChangeDetails = ChangeDetails<
  PopoverOpenChangeReason,
  {
    trigger?: HTMLElement | undefined
    dismissSource?: PopupDismissSource
  }
>

export interface PopoverStoreContext {
  triggerElements: HTMLElement[]
  onOpenChangeProp?:
    | ((open: boolean, details: PopoverOpenChangeDetails) => void)
    | undefined
}

export function createPopoverStoreContext(): PopoverStoreContext {
  return {
    triggerElements: [],
    onOpenChangeProp: undefined,
  }
}

export const popoverSelectors = {
  open: (state: PopoverStoreState) => state.openProp ?? state.open,
  openOpen: (state: PopoverStoreState) => state.openProp,
  modal: (state: PopoverStoreState) => state.modal,
  popoverTitleId: (state: PopoverStoreState) => state.popoverTitleId,
  popoverPopupId: (state: PopoverStoreState) => state.popoverPopupId,
  triggerIdProp: (state: PopoverStoreState) => state.triggerIdProp,
  triggerId: (state: PopoverStoreState) => state.triggerId,
  activeTriggerId: (state: PopoverStoreState) =>
    state.triggerIdProp ?? state.triggerId,
  popoverDescriptionId: (state: PopoverStoreState) =>
    state.popoverDescriptionId,
}

export function createPopoverStoreActions() {
  return (scope: StoreScope<PopoverStoreState, PopoverStoreContext>) => {
    function setOpen(nextOpen: boolean, details: PopoverOpenChangeDetails) {
      const context = scope.getContext()
      const state = scope.getState()

      if (!state.open && !nextOpen) {
        return
      }

      context.onOpenChangeProp?.(nextOpen, details)

      if (details.isCanceled) return

      if (scope.isValueControlled('openProp')) {
        if (state.open && nextOpen) {
          scope.setState({
            triggerId: details.trigger?.id,
          })
          return
        }

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
      open(details: PopoverOpenChangeDetails) {
        setOpen(true, details)
      },
      close(details: PopoverOpenChangeDetails) {
        setOpen(false, details)
      },
    }
  }
}

export type PopoverStoreActions = ReturnType<
  ReturnType<typeof createPopoverStoreActions>
>

export type PopoverStore = Store<PopoverStoreState, PopoverStoreContext>

export type PopoverBoundStore = BoundStore<
  PopoverStoreState,
  PopoverStoreContext,
  PopoverStoreActions
>

export const usePopoverStore = createUseStore(() => ({
  state: createPopoverStoreState(),
  context: createPopoverStoreContext(),
  actions: createPopoverStoreActions(),
}))

interface InitialState {
  modal?: boolean
  open?: boolean
  defaultOpen?: boolean
  triggerId?: string | undefined
  defaultTriggerId?: string | undefined
}

export const createPopoverStore = (initialState?: InitialState) =>
  createStore({
    state: createPopoverStoreState({
      openProp: initialState?.open,
      triggerId: initialState?.defaultTriggerId,
      triggerIdProp: initialState?.triggerId,
      modal: initialState?.modal ?? false,
      open: initialState?.defaultOpen ?? false,
    }),
    context: createPopoverStoreContext(),
  })
