import type { Directory } from './types'

export const CHANGE_REASONS = {
  triggerPress: 'trigger-press',
  closePress: 'close-press',
  escapeKey: 'escape-key',
  pointerDownOutside: 'pointer-down-outside',
  focusOutside: 'focus-outside',
} as const

export type CHANGE_REASONS = typeof CHANGE_REASONS

interface ChangeReasonEventMap {
  [CHANGE_REASONS.triggerPress]: MouseEvent | PointerEvent | KeyboardEvent
  [CHANGE_REASONS.closePress]: MouseEvent | PointerEvent | KeyboardEvent
  [CHANGE_REASONS.escapeKey]: KeyboardEvent
  [CHANGE_REASONS.pointerDownOutside]: PointerEvent
  [CHANGE_REASONS.focusOutside]: FocusEvent
}

export type ChangeReason = keyof ChangeReasonEventMap

type ReasonToEvent<Reason extends ChangeReason> = ChangeReasonEventMap[Reason]

export type ChangeDetails<
  Reason extends ChangeReason,
  CustomProperties extends Directory = {},
> = Reason extends ChangeReason
  ? {
      readonly reason: Reason
      readonly event: ReasonToEvent<Reason>
    } & CustomProperties
  : CustomProperties

export function createChangeDetails<
  Reason extends ChangeReason,
  CustomProperties extends Directory = {},
>(
  reason: Reason,
  event: ReasonToEvent<Reason>,
  custom?: CustomProperties,
): ChangeDetails<Reason, CustomProperties> {
  return {
    ...custom,
    reason,
    event,
  } as ChangeDetails<Reason, CustomProperties>
}
