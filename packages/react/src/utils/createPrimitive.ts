import { isFunction, mergeProps } from '@primitives-ui/utils'
import { cloneElement, createElement, isValidElement } from 'react'
import type { InferMetadataStateFromProps, MetadataProps } from './metadata'
import type { HTMLProps, HTMLElements, Directory } from './types'
import {
  getMetadataProps,
  getMetadataProvider,
  getMetadataState,
} from './metadata'

export type CreatePrimitiveParams<
  T extends HTMLElements,
  State extends Directory | undefined,
> = {
  render?:
    | ((props: HTMLProps<T>, state: State) => React.ReactNode)
    | React.JSX.Element
  stateAttributesMapping?: StateAttributesMapping<State>
}

export function createPrimitive<
  Element extends HTMLElements,
  Props extends MetadataProps,
>(
  tag: Element,
  props: Props,
  params: CreatePrimitiveParams<Element, InferMetadataStateFromProps<Props>>,
) {
  const { render, stateAttributesMapping } = params
  const state = getMetadataState(props)
  const provider = getMetadataProvider(props)
  const elementProps = getMetadataProps(props)
  const stateProps = getStateAttributesProps(state, stateAttributesMapping)

  const mergedProps = mergeProps(elementProps, stateProps) as HTMLProps<Element>

  let element

  if (isFunction(render)) {
    element = render(mergedProps, state)
  } else if (isValidElement<any>(render)) {
    element = cloneElement(render, mergeProps(render.props, mergedProps))
  } else {
    element = createElement(tag, mergedProps)
  }

  if (provider) {
    element = provider(element)
  }

  return element
}

type StateAttributesMapping<State> = {
  [Property in keyof State]?: (
    state: State[Property],
  ) => Directory<string> | null
}

export function getStateAttributesProps<State extends Directory>(
  state?: State,
  customMapping?: StateAttributesMapping<State>,
) {
  const props: Directory<string> = {}

  if (!state) {
    return props
  }

  for (const key in state) {
    const value = state[key]
    if (
      customMapping &&
      Object.prototype.hasOwnProperty.call(customMapping, key)
    ) {
      const customProps = customMapping[key]!(value)
      if (customProps != null) {
        Object.assign(props, customProps)
      }
      continue
    }
    if (value === true) {
      props[`data-${kebabCase(key)}`] = ''
    } else if (value) {
      props[`data-${kebabCase(key)}`] = value.toString()
    }
  }

  return props
}

function kebabCase(str: string): string {
  if (typeof str !== 'string' || str.trim() === '') {
    return str
  }

  return str
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .toLowerCase()
}
