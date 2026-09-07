import { expectTypeOf } from 'vitest'
import type { AvatarImageProps } from '../../avatar/AvatarImage'
import type { ButtonProps, ButtonState } from '../../button/Button'
import type { DialogDescriptionProps } from '../../dialog/DialogDescription'
import type { DialogTitleProps } from '../../dialog/DialogTitle'
import type { HTMLProps, RenderProp } from '../types'
import { Button } from '../../button/Button'

type RenderCallback<T> = Extract<T, (...args: any[]) => any>

describe('render prop types', () => {
  it('uses native button props, events, ref and state in JSX callbacks', () => {
    const element = (
      <Button
        render={(props, state) => {
          expectTypeOf(props.type).toEqualTypeOf<
            'button' | 'submit' | 'reset' | undefined
          >()
          expectTypeOf(props.ref).toEqualTypeOf<HTMLProps<'button'>['ref']>()
          expectTypeOf(state).toEqualTypeOf<ButtonState>()
          expectTypeOf<
            Parameters<NonNullable<typeof props.onClick>>[0]['currentTarget']
          >().toEqualTypeOf<EventTarget & HTMLButtonElement>()
          return <button {...props} />
        }}
      />
    )
    expect(element).toBeDefined()
    expectTypeOf<
      Parameters<RenderCallback<ButtonProps['render']>>[0]
    >().toEqualTypeOf<HTMLProps<'button'>>()
  })

  it('uses the default native element for other primitives', () => {
    expectTypeOf<
      Parameters<RenderCallback<AvatarImageProps['render']>>[0]
    >().toEqualTypeOf<HTMLProps<'img'>>()
    expectTypeOf<
      Parameters<RenderCallback<DialogDescriptionProps['render']>>[0]
    >().toEqualTypeOf<HTMLProps<'p'>>()
    expectTypeOf<
      Parameters<RenderCallback<DialogTitleProps['render']>>[0]
    >().toEqualTypeOf<HTMLProps<'h2'>>()
    expectTypeOf<Parameters<RenderCallback<RenderProp>>[0]>().toEqualTypeOf<
      HTMLProps<'div'>
    >()
  })

  it('continues to accept JSX elements and explicit custom props', () => {
    const element: ButtonProps['render'] = <button />
    expect(element).toBeDefined()
    expectTypeOf<
      Parameters<RenderCallback<RenderProp<undefined, { value: number }>>>[0]
    >().toEqualTypeOf<{ value: number }>()
  })
})
