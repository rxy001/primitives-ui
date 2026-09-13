import type { Ref } from 'react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getMetadataProps, getMetadataState, withMetadata } from '../metadata'
import { useFocusRing } from '../useFocusRing'

function FocusRingFixture({
  elementRef,
}: {
  elementRef?: Ref<HTMLButtonElement>
}) {
  const focusRingMetadata = useFocusRing({ ref: elementRef })
  return <button {...getMetadataProps(focusRingMetadata)}>target</button>
}

afterEach(cleanup)

describe('useFocusRing composition', () => {
  it('attaches and clears an external object ref', () => {
    const externalRef = createRef<HTMLButtonElement>()
    const renderResult = render(<FocusRingFixture elementRef={externalRef} />)
    expect(externalRef.current).toBe(renderResult.getByRole('button'))
    renderResult.unmount()
    expect(externalRef.current).toBeNull()
  })

  it('updates external callback refs when the consumer replaces them', () => {
    const previousRefCallback = vi.fn()
    const nextRefCallback = vi.fn()
    const renderResult = render(
      <FocusRingFixture elementRef={previousRefCallback} />,
    )
    const buttonElement = renderResult.getByRole('button')
    expect(previousRefCallback).toHaveBeenLastCalledWith(buttonElement)
    renderResult.rerender(<FocusRingFixture elementRef={nextRefCallback} />)
    expect(previousRefCallback).toHaveBeenLastCalledWith(null)
    expect(nextRefCallback).toHaveBeenLastCalledWith(buttonElement)
    renderResult.unmount()
    expect(nextRefCallback).toHaveBeenLastCalledWith(null)
  })

  it('preserves DOM props, unrelated events and existing metadata', () => {
    const onClick = vi.fn()
    function ComposedFocusRingFixture() {
      const focusRingMetadata = useFocusRing(
        withMetadata(
          {
            id: 'command',
            disabled: false,
            title: 'description',
            'aria-label': 'command label',
            onClick,
          },
          { state: { expanded: true } },
        ),
      )
      const focusRingState = getMetadataState(focusRingMetadata)
      return (
        <button
          {...getMetadataProps(focusRingMetadata)}
          data-expanded={focusRingState.expanded}
          data-focus-visible={focusRingState.focusVisible}
        />
      )
    }
    const renderResult = render(<ComposedFocusRingFixture />)
    const buttonElement = renderResult.getByRole('button', {
      name: 'command label',
    })
    expect(buttonElement.id).toBe('command')
    expect(buttonElement.title).toBe('description')
    expect(buttonElement.getAttribute('data-expanded')).toBe('true')
    expect(buttonElement.getAttribute('data-focus-visible')).toBe('false')
    fireEvent.click(buttonElement)
    expect(onClick).toHaveBeenCalledOnce()
  })
})
