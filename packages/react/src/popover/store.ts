import type {
  PopupDismissSource,
  PopupOpenChangeReason,
  PopupStoreContext,
  PopupStoreState,
} from '../popup'
import type {
  CHANGE_REASONS,
  ChangeDetails,
  BoundStore,
  Store,
  StoreScope,
} from '../utils'
import {
  createPopupStoreActions,
  createPopupStoreContext,
  createPopupStoreState,
} from '../popup'
import { createStore, createUseStore } from '../utils'

export interface PopoverStoreState extends PopupStoreState {
  popoverTitleId: string | undefined
  popoverPopupId: string | undefined
  popoverDescriptionId: string | undefined
}

export function createPopoverStoreState(
  initialState?: Partial<PopoverStoreState>,
): PopoverStoreState {
  return {
    ...createPopupStoreState(),
    popoverTitleId: undefined,
    popoverPopupId: undefined,
    popoverDescriptionId: undefined,
    ...initialState,
  }
}

export type PopoverOpenChangeReason =
  | CHANGE_REASONS['closePress']
  | CHANGE_REASONS['triggerPress']
  | PopupOpenChangeReason

export type PopoverOpenChangeDetails = ChangeDetails<
  PopoverOpenChangeReason,
  {
    trigger?: HTMLElement | undefined
    dismissSource?: PopupDismissSource
  }
>

export interface PopoverStoreContext extends PopupStoreContext<PopoverOpenChangeDetails> {}

export function createPopoverStoreContext(): PopoverStoreContext {
  return {
    ...createPopupStoreContext<PopoverOpenChangeDetails>(),
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
    const popupActions =
      createPopupStoreActions<PopoverOpenChangeDetails>()(scope)

    return {
      ...popupActions,
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

interface PopoverStoreInitialState {
  modal?: boolean
  open?: boolean
  defaultOpen?: boolean
  triggerId?: string | undefined
  defaultTriggerId?: string | undefined
}

export const createPopoverStore = (initialState?: PopoverStoreInitialState) =>
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
