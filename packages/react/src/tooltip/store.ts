import type {
  PopupDismissSource,
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

export interface TooltipStoreState extends PopupStoreState {}

export function createTooltipStoreState(
  initialState?: Partial<TooltipStoreState>,
): TooltipStoreState {
  return {
    ...createPopupStoreState(),
    ...initialState,
  }
}

export type TooltipOpenChangeReason =
  | CHANGE_REASONS['triggerHover']
  | CHANGE_REASONS['escapeKey']
  | CHANGE_REASONS['pointerDownOutside']
  | CHANGE_REASONS['focusOutside']

export type TooltipOpenChangeDetails = ChangeDetails<
  TooltipOpenChangeReason,
  {
    trigger?: HTMLElement | undefined
    dismissSource?: PopupDismissSource
  }
>

export interface TooltipStoreContext extends PopupStoreContext<TooltipOpenChangeDetails> {}

export function createTooltipStoreContext(): TooltipStoreContext {
  return {
    ...createPopupStoreContext<TooltipOpenChangeDetails>(),
  }
}

export const tooltipSelectors = {
  open: (state: TooltipStoreState) => state.openProp ?? state.open,
  openOpen: (state: TooltipStoreState) => state.openProp,
  modal: (state: TooltipStoreState) => state.modal,
  triggerIdProp: (state: TooltipStoreState) => state.triggerIdProp,
  triggerId: (state: TooltipStoreState) => state.triggerId,
  activeTriggerId: (state: TooltipStoreState) =>
    state.triggerIdProp ?? state.triggerId,
}

export function createTooltipStoreActions() {
  return (scope: StoreScope<TooltipStoreState, TooltipStoreContext>) => {
    const popupActions =
      createPopupStoreActions<TooltipOpenChangeDetails>()(scope)

    return {
      ...popupActions,
    }
  }
}

export type TooltipStoreActions = ReturnType<
  ReturnType<typeof createTooltipStoreActions>
>

export type TooltipStore = Store<TooltipStoreState, TooltipStoreContext>

export type TooltipBoundStore = BoundStore<
  TooltipStoreState,
  TooltipStoreContext,
  TooltipStoreActions
>

export const useTooltipStore = createUseStore(() => ({
  state: createTooltipStoreState(),
  context: createTooltipStoreContext(),
  actions: createTooltipStoreActions(),
}))

interface TooltipStoreInitialState {
  modal?: boolean
  open?: boolean
  defaultOpen?: boolean
  triggerId?: string | undefined
  defaultTriggerId?: string | undefined
}

export const createTooltipStore = (initialState?: TooltipStoreInitialState) =>
  createStore({
    state: createTooltipStoreState({
      openProp: initialState?.open,
      triggerId: initialState?.defaultTriggerId,
      triggerIdProp: initialState?.triggerId,
      modal: initialState?.modal ?? false,
      open: initialState?.defaultOpen ?? false,
    }),
    context: createTooltipStoreContext(),
  })
