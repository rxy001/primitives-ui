import type { Locator } from 'vitest/browser'
import { act } from '@testing-library/react'

export async function focus(locator: Locator) {
  await act(async () => {
    locator.element().focus()
  })
}
