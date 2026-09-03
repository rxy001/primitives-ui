import type { CHANGE_REASONS } from '../createChangeDetails'
import type { PopupOpenChangeDetails, PopupStore } from './store'
import { createChangeDetails } from '../createChangeDetails'
import { popupSelectors } from './store'

type UseTriggerClickProps = {
  store: PopupStore<PopupOpenChangeDetails<CHANGE_REASONS['triggerPress']>>
  onClick?: React.MouseEventHandler
}

export function useTriggerClick<P extends UseTriggerClickProps>({
  store,
  onClick,
  ...props
}: P) {
  const open = store.useSelector(popupSelectors.open)
  const activeTriggerId = store.useSelector(popupSelectors.activeTriggerId)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)

    if (event.defaultPrevented) return

    const details = createChangeDetails('trigger-press', event.nativeEvent, {
      trigger: event.currentTarget,
    })

    if (!open) {
      store.open(details)
      return
    }

    const isMountedByThisTrigger = activeTriggerId === event.currentTarget.id

    if (!isMountedByThisTrigger) {
      store.open(details)
      return
    }

    store.close(details)
  }

  return {
    ...props,
    onClick: handleClick,
  }
}
