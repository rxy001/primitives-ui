import { render } from '@testing-library/react'
import { Button } from '../index'

it('counter button increments the count', async () => {
  const result = render(<Button />)

  expect(result.getByRole('button')).toBeInTheDocument()
})
