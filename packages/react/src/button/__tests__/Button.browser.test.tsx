import { useState } from 'react'
import { render } from 'vitest-browser-react'

function Test() {
  const [count, setCount] = useState(1)

  return (
    <div>
      <p>Count is {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}

it('counter button increments the count', async () => {
  const screen = await render(<Test />)

  await screen.getByRole('button').click()

  await expect.element(screen.getByText('Count is 2')).toBeVisible()
})
