import type { FloatingStore } from './floatingStore'
import { createChangeDetails } from '../createChangeDetails'
import { selectors } from './floatingStore'

type UseTriggerClickProps = {
  store: FloatingStore
  onClick?: React.MouseEventHandler
}

export function useTriggerClick<P extends UseTriggerClickProps>({
  store,
  onClick,
  ...props
}: P) {
  const open = store.useSelector(selectors.open)
  const activeTriggerId = store.useSelector(selectors.activeTriggerId)

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
