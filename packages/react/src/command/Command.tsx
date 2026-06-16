'use client'

import { useEvent } from '@primitives-ui/utils'
import { useRef } from 'react'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import {
  withMetadata,
  useFocusRing,
  createPrimitive,
  createHook,
  isTextField,
  useFocusableWhenDisabled,
} from '../utils'

export const useCommand = createHook<'div', CommandOwnProps, CommandState>(
  function useCommand({
    clickOnEnter = true,
    clickOnSpace = true,
    focusableWhenDisabled = false,
    ...props
  }: UseCommandProps) {
    const activeRef = useRef(false)
    const { disabled = false } = props

    const { onKeyDown } = props
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      activeRef.current = false
      onKeyDown?.(event)

      if (event.defaultPrevented) return

      const element = event.currentTarget

      // Avoid treating text inputs as clickable buttons activated via Space or Enter.
      if (isTextField(element)) return
      if (event.target !== event.currentTarget) return
      if (element.isContentEditable) return

      if (
        (event.key === 'Enter' && !clickOnEnter) ||
        (event.key === ' ' && !clickOnSpace)
      ) {
        event.preventDefault()
        return
      }

      if (isNativeSupportClick(event)) return

      const shouldClickOnEnter = clickOnEnter && event.key === 'Enter'
      const shouldClickOnSpace = clickOnSpace && event.key === ' '

      if (shouldClickOnEnter) {
        element.click()
        event.preventDefault()
      }

      if (shouldClickOnSpace) {
        activeRef.current = true
        event.preventDefault()
      }
    }

    const { onKeyUp } = props
    const handleKeyUp = useDisableEvent(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        onKeyUp?.(event)
        if (event.defaultPrevented) return

        if (activeRef.current && event.key === ' ') {
          activeRef.current = false
          event.currentTarget.click()
          event.preventDefault()
        }
      },
      disabled,
    )

    const handleClick = useDisableEvent(props.onClick, disabled)

    const handleMouseDown = useDisableEvent(props.onMouseDown, disabled)

    const handlePointerDown = useDisableEvent(props.onPointerDown, disabled)

    props = {
      ...props,
      disabled,
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
      onClick: handleClick,
      onMouseDown: handleMouseDown,
      onPointerDown: handlePointerDown,
    }

    const focusableProps = useFocusableWhenDisabled({
      focusableWhenDisabled,
      ...props,
    })

    const focusRingProps = useFocusRing(focusableProps)

    return withMetadata(focusRingProps, {
      state: {
        disabled,
      },
    })
  },
)

export function Command({ render, ...other }: CommandProps) {
  const props = useCommand(other)

  return createPrimitive('div', props, {
    render,
  })
}

Command.displayName = 'Command'

export interface CommandProps extends UseCommandProps {
  render?: RenderProp<CommandState>
}

function useDisableEvent(
  onEvent?: React.EventHandler<React.SyntheticEvent>,
  disabled?: boolean,
) {
  return useEvent((event: React.SyntheticEvent) => {
    if (disabled) {
      event.stopPropagation()
      event.preventDefault()

      return
    }
    onEvent?.(event)
  })
}

function isNativeSupportClick(event: React.KeyboardEvent) {
  const element = event.currentTarget
  if (event.key === 'Enter') {
    return (
      element.tagName === 'BUTTON' ||
      element.tagName === 'SUMMARY' ||
      element.tagName === 'A'
    )
  }
  if (event.key === ' ') {
    return (
      element.tagName === 'BUTTON' ||
      element.tagName === 'SUMMARY' ||
      element.tagName === 'INPUT' ||
      element.tagName === 'SELECT'
    )
  }
  return false
}

interface CommandOwnProps {
  clickOnEnter?: boolean

  clickOnSpace?: boolean

  disabled?: boolean

  autoFocus?: boolean

  focusableWhenDisabled?: boolean
}

export interface CommandState {
  focusVisible: boolean
  disabled: boolean
}

export type UseCommandProps<Element extends HTMLElements = 'div'> = HookProps<
  Element,
  CommandOwnProps
>
