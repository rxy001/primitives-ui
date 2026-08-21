import type { CHANGE_REASONS, ChangeDetails } from './createChangeDetails'
import type { StoreSelector } from './createStore'
import { createChangeDetails } from './createChangeDetails'

type OpenChangeReason = ChangeDetails<
  CHANGE_REASONS['triggerPress'],
  {
    trigger?: HTMLElement | undefined
  }
>

type StoreState = {
  open: boolean
}

type UseTriggerClickProps = {
  store: {
    useSelector<Value>(selector: StoreSelector<StoreState, Value>): Value
    open(details: OpenChangeReason): void
    close(details: OpenChangeReason): void
  }
  onClick?: React.MouseEventHandler
}

const selectors = {
  open: (state: StoreState) => state.open,
}

export function useTriggerClick<P extends UseTriggerClickProps>({
  store,
  onClick,
  ...props
}: P) {
  const open = store.useSelector(selectors.open)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)

    if (event.defaultPrevented) return

    const details = createChangeDetails('trigger-press', event.nativeEvent, {
      trigger: event.currentTarget,
    })

    if (open) {
      store.close(details)
    } else {
      store.open(details)
    }
  }

  return {
    ...props,
    onClick: handleClick,
  }
}
