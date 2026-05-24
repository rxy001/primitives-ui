'use client'

import { useMergeRefs } from '@primitives-ui/utils'
import { useRef } from 'react'
import type { CommandState } from '../command'
import type { HookProps, HTMLElements, RenderProp } from '../utils/types'
import { useCommand } from '../command'
import { createHook, createPrimitive, useTagName } from '../utils'

export const useButton = createHook<'button', ButtonOwnProps, ButtonState>(
  function useButton({ nativeButton = true, ...props }: UseButtonProps) {
    const ref = useRef<HTMLButtonElement>(null)
    const tagName = useTagName(ref)
    const mergedRefs = useMergeRefs(props.ref, ref)

    const command = useCommand<'button'>({
      ...props,
      ref: mergedRefs,
      clickOnEnter: true,
      clickOnSpace: true,
    })

    props = {
      ...command.props,
      role: !nativeButton && tagName !== 'a' ? 'button' : undefined,
      type: nativeButton ? command.props.type || 'button' : undefined,
    }

    return {
      props,
      state: command.state,
    }
  },
)

export function Button({ render, ...other }: ButtonProps) {
  const { props, state } = useButton(other)

  return createPrimitive('button', props, {
    render,
    state,
  })
}

Button.displayName = 'Button'

export interface ButtonProps extends UseButtonProps {
  render?: RenderProp<ButtonState>
}

interface ButtonOwnProps {
  nativeButton?: boolean
  focusableWhenDisabled?: boolean
}

export interface ButtonState extends CommandState {}

export type UseButtonProps<Element extends HTMLElements = 'button'> = HookProps<
  Element,
  ButtonOwnProps
>
