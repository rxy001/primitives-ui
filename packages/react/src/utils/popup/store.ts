import type { ChangeDetails, CHANGE_REASONS } from '../createChangeDetails'
import type { StoreScope, StoreSelector } from '../createStore'

export interface PopupStoreState {
  modal: boolean
  open: boolean
  openProp: boolean | undefined
  triggerId: string | undefined
  triggerIdProp: string | undefined
}

export function createPopupStoreState(
  initialState?: Partial<PopupStoreState>,
): PopupStoreState {
  return {
    open: false,
    modal: false,
    triggerId: undefined,
    triggerIdProp: undefined,
    openProp: undefined,
    ...initialState,
  }
}

export type PopupDismissSource = 'self' | 'ancestor'

export type PopupOpenChangeReason =
  | CHANGE_REASONS['escapeKey']
  | CHANGE_REASONS['pointerDownOutside']
  | CHANGE_REASONS['focusOutside']
  | CHANGE_REASONS['triggerPress']

export type PopupOpenChangeDetails = ChangeDetails<
  PopupOpenChangeReason,
  {
    trigger?: HTMLElement | undefined
    dismissSource?: PopupDismissSource
  }
>

type PopupChangeDetailsBase = ChangeDetails<
  string,
  {
    trigger?: HTMLElement | undefined
    dismissSource?: PopupDismissSource
  }
>

export interface PopupStoreContext<Details extends PopupChangeDetailsBase> {
  triggerElements: HTMLElement[]
  onOpenChangeProp?: ((open: boolean, details: Details) => void) | undefined
}

export function createPopupStoreContext<
  Details extends PopupChangeDetailsBase,
>(): PopupStoreContext<Details> {
  return {
    triggerElements: [],
    onOpenChangeProp: undefined,
  }
}

export const popupSelectors = {
  open: (state: PopupStoreState) => state.openProp ?? state.open,
  openOpen: (state: PopupStoreState) => state.openProp,
  modal: (state: PopupStoreState) => state.modal,
  triggerIdProp: (state: PopupStoreState) => state.triggerIdProp,
  triggerId: (state: PopupStoreState) => state.triggerId,
  activeTriggerId: (state: PopupStoreState) =>
    state.triggerIdProp ?? state.triggerId,
}

export function createPopupStoreActions<
  Details extends PopupChangeDetailsBase,
>() {
  return (scope: StoreScope<PopupStoreState, PopupStoreContext<Details>>) => {
    function setOpen(nextOpen: boolean, details: Details) {
      const context = scope.getContext()
      const open = popupSelectors.open(scope.getState())

      if (!open && !nextOpen) {
        return
      }

      context.onOpenChangeProp?.(nextOpen, details)

      if (details.isCanceled) return

      if (scope.isValueControlled('openProp')) {
        if (open && nextOpen) {
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
      open(details: Details) {
        setOpen(true, details)
      },
      close(details: Details) {
        setOpen(false, details)
      },
    }
  }
}

export type PopupStoreActions = ReturnType<
  ReturnType<typeof createPopupStoreActions>
>

export type PopupStore = {
  useSelector<Value>(selector: StoreSelector<PopupStoreState, Value>): Value
  getState: () => Readonly<PopupStoreState>
  getContext: () => Readonly<PopupStoreContext<PopupOpenChangeDetails>>
  open(details: PopupOpenChangeDetails): void
  close(details: PopupOpenChangeDetails): void
}
