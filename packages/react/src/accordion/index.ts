import { AccordionHeader, useAccordionHeader } from './AccordionHeader'
import { AccordionItem, useAccordionItem } from './AccordionItem'
import { AccordionPanel, useAccordionPanel } from './AccordionPanel'
import { AccordionRoot, useAccordionRoot } from './AccordionRoot'
import { AccordionTrigger, useAccordionTrigger } from './AccordionTrigger'

const Accordion = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Header: AccordionHeader,
  Trigger: AccordionTrigger,
  Panel: AccordionPanel,
}

export {
  Accordion,
  useAccordionHeader,
  useAccordionItem,
  useAccordionPanel,
  useAccordionRoot,
  useAccordionTrigger,
}

export type {
  UseAccordionHeaderProps,
  AccordionHeaderProps,
  AccordionHeaderState,
} from './AccordionHeader'

export type {
  UseAccordionRootProps,
  AccordionRootProps,
  AccordionRootState,
} from './AccordionRoot'

export type {
  UseAccordionItemProps,
  AccordionItemProps,
  AccordionItemState,
} from './AccordionItem'

export type {
  UseAccordionPanelProps,
  AccordionPanelProps,
  AccordionPanelState,
} from './AccordionPanel'

export type {
  UseAccordionTriggerProps,
  AccordionTriggerProps,
  AccordionTriggerState,
} from './AccordionTrigger'
