import { expectTypeOf } from 'vitest'
import type { DialogOpenChangeDetails } from '../../dialog'
import type { ChangeDetails, ChangeReason } from '../createChangeDetails'
import { createChangeDetails } from '../createChangeDetails'

describe('change details types', () => {
  it('narrows every known reason with its event and custom properties', () => {
    function check(details: ChangeDetails<ChangeReason, { source: string }>) {
      expectTypeOf(details.source).toEqualTypeOf<string>()
      switch (details.reason) {
        case 'escape-key':
          expectTypeOf(details.event).toEqualTypeOf<KeyboardEvent>()
          expectTypeOf(details.source).toEqualTypeOf<string>()
          break
        case 'pointer-down-outside':
          expectTypeOf(details.event).toEqualTypeOf<PointerEvent>()
          break
        case 'focus-outside':
          expectTypeOf(details.event).toEqualTypeOf<FocusEvent>()
          break
        case 'ancestor-close':
          expectTypeOf(details.event).toEqualTypeOf<null>()
          break
        case 'trigger-press':
        case 'close-press':
          expectTypeOf(details.event).toEqualTypeOf<
            MouseEvent | PointerEvent | KeyboardEvent
          >()
          break
        default:
          expectTypeOf(details).toEqualTypeOf<never>()
      }
    }
    check(
      createChangeDetails('escape-key', new KeyboardEvent('keydown'), {
        source: 'test',
      }),
    )
  })

  it('narrows public dialog change details', () => {
    function check(details: DialogOpenChangeDetails) {
      if (details.reason === 'escape-key') {
        expectTypeOf(details.event).toEqualTypeOf<KeyboardEvent>()
        expectTypeOf(details.trigger).toEqualTypeOf<HTMLElement | undefined>()
      }
    }
    check(createChangeDetails('escape-key', new KeyboardEvent('keydown')))
  })

  it('preserves the fallback for custom reasons and broad strings', () => {
    function check(details: ChangeDetails<'custom' | 'escape-key'>) {
      if (details.reason === 'custom') {
        expectTypeOf(details.event).toEqualTypeOf<Event | null>()
      } else {
        expectTypeOf(details.event).toEqualTypeOf<KeyboardEvent>()
      }
    }
    check(createChangeDetails('escape-key', new KeyboardEvent('keydown')))
    expectTypeOf<ChangeDetails<string>['event']>().toEqualTypeOf<Event | null>()
    expectTypeOf<ChangeDetails<never>>().toEqualTypeOf<never>()
  })

  it('preserves factory inference and cancellation', () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    const details = createChangeDetails('escape-key', event, { source: 'test' })
    expectTypeOf(details.reason).toEqualTypeOf<'escape-key'>()
    expectTypeOf(details.event).toEqualTypeOf<KeyboardEvent>()
    expectTypeOf(details.source).toEqualTypeOf<string>()
    expect(details.event).toBe(event)
    expect(details.source).toBe('test')
    expect(details.isCanceled).toBe(false)
    details.cancel()
    expect(details.isCanceled).toBe(true)
  })
})
