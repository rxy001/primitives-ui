import { createContext } from '@primitives-ui/utils'
import type { AccordionItemState } from './AccordionItem'
import type { AccordionRootState } from './AccordionRoot'

export interface AccordionRootContextValue<Value = any> {
  value: Value[]
  disabled: boolean
  handleValueChange: (value: Value, nextOpen: boolean) => void
  state: AccordionRootState
}

export const [AccordionRootProvider, useAccordionRootContext] =
  createContext<AccordionRootContextValue>({
    contextName: 'AccordionRootContext',
    hookName: 'useAccordionRootContext',
    providerName: 'AccordionRootProvider',
    strict: true,
  })

export interface AccordionItemContextValue {
  state: AccordionItemState
  triggerId: string | undefined
  setTriggerId: React.Dispatch<React.SetStateAction<string | undefined>>
}

export const [AccordionItemProvider, useAccordionItemContext] =
  createContext<AccordionItemContextValue>({
    contextName: 'AccordionItemContext',
    hookName: 'useAccordionItemContext',
    providerName: 'AccordionItemProvider',
    strict: true,
  })

export interface AccordionPanelDefaultsContextValue {
  keepMounted: boolean
}

export const [
  AccordionPanelDefaultsProvider,
  useAccordionPanelDefaultsContext,
] = createContext<AccordionPanelDefaultsContextValue>({
  contextName: 'AccordionPanelDefaultsContext',
  hookName: 'useAccordionPanelDefaultsContext',
  providerName: 'AccordionPanelDefaultsProvider',
  strict: true,
})
