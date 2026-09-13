import { expect, it, vi } from 'vitest'
import { createDocumentCache } from '../createDocumentCache'

it('shares a value within a document and isolates other documents', () => {
  const create = vi.fn(() => ({}))
  const getValue = createDocumentCache(create)
  const otherDocument = document.implementation.createHTMLDocument()

  expect(getValue(document)).toBe(getValue(document))
  expect(getValue(otherDocument)).not.toBe(getValue(document))
  expect(create).toHaveBeenCalledTimes(2)
})

it.each([false, 0, '', null, undefined])('caches falsy value %s', (value) => {
  const create = vi.fn(() => value)
  const getValue = createDocumentCache(create)

  expect(getValue(document)).toBe(value)
  expect(getValue(document)).toBe(value)
  expect(create).toHaveBeenCalledTimes(1)
})
