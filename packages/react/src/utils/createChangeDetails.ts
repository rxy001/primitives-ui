import type { Directory } from './types'

export const CHANGE_REASONS = {
  triggerPress: 'trigger-press',
  closePress: 'close-press',
  escapeKey: 'escape-key',
  pointerDownOutside: 'pointer-down-outside',
  focusOutside: 'focus-outside',
  ancestorClose: 'ancestor-close',
} as const

export type CHANGE_REASONS = typeof CHANGE_REASONS

interface ChangeReasonEventMap {
  [CHANGE_REASONS.triggerPress]: MouseEvent | PointerEvent | KeyboardEvent
  [CHANGE_REASONS.closePress]: MouseEvent | PointerEvent | KeyboardEvent
  [CHANGE_REASONS.escapeKey]: KeyboardEvent
  [CHANGE_REASONS.pointerDownOutside]: PointerEvent
  [CHANGE_REASONS.focusOutside]: FocusEvent
  [CHANGE_REASONS.ancestorClose]: null
}

export type ChangeReason = keyof ChangeReasonEventMap

type ReasonToEvent<Reason extends ChangeReason> = ChangeReasonEventMap[Reason]

export type ChangeDetails<
  Reason extends string,
  CustomProperties extends Directory = {},
> = {
  readonly reason: Reason
  readonly event: Reason extends ChangeReason
    ? ReasonToEvent<Reason>
    : Event | null
  cancel: () => void
  readonly isCanceled: boolean
} & CustomProperties

export function createChangeDetails<
  Reason extends ChangeReason,
  CustomProperties extends Directory = {},
>(
  reason: Reason,
  event: ReasonToEvent<Reason>,
  custom?: CustomProperties,
): ChangeDetails<Reason, CustomProperties> {
  let canceled = false

  return {
    ...custom,
    reason,
    event,
    cancel() {
      canceled = true
    },
    get isCanceled() {
      return canceled
    },
  } as ChangeDetails<Reason, CustomProperties>
}
