import { useMergeRefs } from '@primitives-ui/utils'
import { useMemo, useRef } from 'react'
import { useTagName } from '../utils'

interface UseFocusableWhenDisabledProps {
  focusableWhenDisabled?: boolean
  disabled?: boolean
  onKeyDown?: React.KeyboardEventHandler
  tabIndex?: number
  ref?: React.Ref<HTMLElement>
}

const supportsDisabledElements = [
  'button',
  'input',
  'select',
  'textarea',
  'optgroup',
  'option',
  'fieldset',
]

export function useFocusableWhenDisabled<
  T extends UseFocusableWhenDisabledProps,
>({ focusableWhenDisabled, onKeyDown, ...props }: T) {
  const ref = useRef<HTMLDivElement>(null)
  const mergedRefs = useMergeRefs(ref, props.ref)
  const tagName = useTagName(ref)

  const supportsDisabled = useMemo(() => {
    if (!tagName) return true
    return supportsDisabledElements.includes(tagName)
  }, [tagName])

  const tabIndex = useTabIndex({
    tagName,
    supportsDisabled,
    focusableWhenDisabled,
    disabled: props.disabled,
    tabIndex: props.tabIndex,
  })

  const trulyDisabled = props.disabled && !focusableWhenDisabled

  return {
    props: {
      'aria-disabled':
        !trulyDisabled || !supportsDisabled ? props.disabled : undefined,
      ...props,
      tabIndex,
      ref: mergedRefs,
      disabled: trulyDisabled && supportsDisabled ? props.disabled : undefined,
      onKeyDown(event: React.KeyboardEvent) {
        if (props.disabled && focusableWhenDisabled && event.key !== 'Tab') {
          event.preventDefault()
        }

        if (props.disabled) {
          event.stopPropagation()
          return
        }
        onKeyDown?.(event)
      },
    },
  }
}

const tabbableElements = [
  'button',
  'summary',
  'input',
  'select',
  'textarea',
  'a',
]

function useTabIndex({
  tagName,
  disabled,
  tabIndex,
  supportsDisabled,
  focusableWhenDisabled,
}: {
  tagName?: string
  disabled?: boolean
  tabIndex?: number
  supportsDisabled?: boolean
  focusableWhenDisabled?: boolean
}) {
  const isNativeTabbable = useMemo(() => {
    if (!tagName) return true
    return tabbableElements.includes(tagName)
  }, [tagName])

  // Elements that support the `disabled` attribute don't need tabIndex.
  if (disabled && !focusableWhenDisabled)
    return isNativeTabbable && !supportsDisabled ? -1 : undefined
  if (tabIndex !== undefined) return tabIndex
  if (isNativeTabbable) return undefined
  return 0
}
