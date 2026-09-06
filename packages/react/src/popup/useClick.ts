import type { PopupOpenChangeDetails, PopupStore } from './store'
import { CHANGE_REASONS } from '../utils'
import { createChangeDetails } from '../utils'
import { popupSelectors } from './store'

type UseClickProps = {
  store: PopupStore<PopupOpenChangeDetails<CHANGE_REASONS['triggerPress']>>
  onClick?: React.MouseEventHandler
  disable?: boolean
}

export function useClick<P extends UseClickProps>({
  store,
  disable,
  onClick,
  ...props
}: P) {
  const open = store.useSelector(popupSelectors.open)
  const activeTriggerId = store.useSelector(popupSelectors.activeTriggerId)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    onClick?.(event)

    if (event.defaultPrevented || disable) return

    const details = createChangeDetails(
      CHANGE_REASONS.triggerPress,
      event.nativeEvent,
      {
        trigger: event.currentTarget,
      },
    )

    if (!open) {
      store.open(details)
      return
    }

    const isOpenByThisTrigger = activeTriggerId === event.currentTarget.id

    if (!isOpenByThisTrigger) {
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
