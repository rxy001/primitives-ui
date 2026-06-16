import { render } from '@testing-library/react'
import { getMetadataProps } from '../metadata'
import { useFocusableWhenDisabled } from '../useFocusableWhenDisabled'

interface TestComponentProps<T extends React.ElementType> {
  as?: T
  disabled?: boolean
  focusableWhenDisabled?: boolean
  href?: string
  ref?: React.Ref<HTMLElement>
  tabIndex?: number
  children?: React.ReactNode
  testid?: string
}

function TestComponent<T extends React.ElementType = 'button'>({
  as,
  testid,
  ...props
}: TestComponentProps<T>) {
  const Element = as ?? 'button'

  const focusableProps = getMetadataProps(useFocusableWhenDisabled(props))

  return <Element data-testid={testid} {...focusableProps} />
}

const supportsDisabledElements = [
  'button',
  'input',
  'select',
  'textarea',
  'optgroup',
  'option',
  'fieldset',
] as const

const tabbableElements = [
  'button',
  'summary',
  'input',
  'select',
  'textarea',
  'a',
] as const

describe('useFocusableWhenDisabled', () => {
  describe('prop: disabled', () => {
    it('sets disabled prop for disabled elements that support disabled', () => {
      const { getByTestId } = render(
        <>
          {supportsDisabledElements.map((element) => (
            <TestComponent
              as={element}
              disabled
              key={element}
              data-testid={element}
            />
          ))}
        </>,
      )

      supportsDisabledElements.forEach((element) => {
        expect(getByTestId(element)).toBeDisabled()
      })
    })

    it('does not set disabled prop without native disabled for unsupported elements', () => {
      const { getByTestId } = render(
        <TestComponent testid='element' as='div' disabled />,
      )

      const element = getByTestId('element')
      expect(element).not.toBeDisabled()
    })
  })

  describe('prop: aria-disabled', () => {
    it('sets aria-disabled without native disabled for unsupported elements', () => {
      const { getByTestId } = render(
        <TestComponent testid='element' as='div' disabled />,
      )

      const element = getByTestId('element')
      expect(element).toHaveAttribute('aria-disabled', 'true')
    })

    it('does not set aria-disabled prop for disabled elements that support disabled', () => {
      const { getByTestId } = render(
        <>
          {supportsDisabledElements.map((element) => (
            <TestComponent
              as={element}
              disabled
              key={element}
              data-testid={element}
            />
          ))}
        </>,
      )

      supportsDisabledElements.forEach((element) => {
        expect(getByTestId(element)).not.toHaveAttribute('aria-disabled')
      })
    })

    it('sets aria-disabled for disabled but focusable elements', () => {
      const elements = [...supportsDisabledElements, 'div', 'span'] as const
      const { getByTestId } = render(
        <>
          {elements.map((element) => (
            <TestComponent
              disabled
              focusableWhenDisabled
              as={element}
              key={element}
              data-testid={element}
            />
          ))}
        </>,
      )

      elements.forEach((element) => {
        const el = getByTestId(element)
        expect(el).toHaveAttribute('aria-disabled', 'true')
        expect(el).not.toBeDisabled()
      })
    })
  })

  describe('prop: tabIndex', () => {
    it('sets tabIndex 0 for non-native tabbable elements', () => {
      const { getByTestId } = render(
        <TestComponent testid='element' as='div' />,
      )

      const element = getByTestId('element')
      expect(element).toHaveAttribute('tabindex', '0')
    })

    it('does not sets tabIndex for disabled non-native tabbable elements', () => {
      const { getByTestId } = render(
        <TestComponent testid='element' as='div' disabled />,
      )

      const element = getByTestId('element')
      expect(element).not.toHaveAttribute('tabindex')
    })

    it('sets tabIndex 0 for disabled but focusable non-native tabbable elements', () => {
      const { getByTestId } = render(
        <TestComponent
          testid='element'
          as='div'
          disabled
          focusableWhenDisabled
        />,
      )

      const element = getByTestId('element')
      expect(element).toHaveAttribute('tabindex', '0')
    })

    it('does not set tabIndex for native tabbable elements', () => {
      const { getByTestId } = render(
        <>
          {tabbableElements.map((element) => (
            <TestComponent as={element} key={element} data-testid={element} />
          ))}
        </>,
      )

      tabbableElements.forEach((element) => {
        expect(getByTestId(element)).not.toHaveAttribute('tabindex')
      })
    })

    it('does not set tabIndex for disabled native tabbable elements that support disabled', () => {
      const { getByTestId } = render(
        <TestComponent testid='element' as='button' disabled />,
      )

      const element = getByTestId('element')
      expect(element).not.toHaveAttribute('tabindex')
    })

    it('sets tabIndex -1 for disabled native tabbable elements without disabled support', () => {
      const { getByTestId } = render(
        <TestComponent testid='element' as='a' disabled />,
      )

      const element = getByTestId('element')
      expect(element).toHaveAttribute('tabindex', '-1')
    })

    it('does not set tabIndex for disabled but focusable native tabbable elements', () => {
      const { getByTestId } = render(
        <>
          {tabbableElements.map((element) => (
            <TestComponent
              disabled
              focusableWhenDisabled
              as={element}
              key={element}
              data-testid={element}
            />
          ))}
        </>,
      )

      tabbableElements.forEach((element) => {
        expect(getByTestId(element)).not.toHaveAttribute('tabindex')
      })
    })

    it('preserves an explicit tabIndex', async () => {
      const { getByTestId } = render(
        // oxlint-disable-next-line jsx-a11y/tabindex-no-positive
        <TestComponent testid='element' as='div' tabIndex={5} />,
      )

      const element = getByTestId('element')
      expect(element).toHaveAttribute('tabindex', '5')
    })
  })
})
