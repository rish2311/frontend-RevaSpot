import { ChevronDown, ChevronUp, Copy, Lock, Plus, Unlock, X } from 'lucide-react'
import type { Classnames, Controls, FullField, Translations } from 'react-querybuilder'
import { getCompatContextProvider } from 'react-querybuilder'
import { ShadcnUiActionElement } from './ShadcnUiActionElement'
import { ShadcnUiActionElementIcon } from './ShadcnUiActionElementIcon'
import { ShadcnUiDragHandle } from './ShadcnUiDragHandle'
import { ShadcnUiNotToggle } from './ShadcnUiNotToggle'
import { ShadcnUiValueSelector } from './ShadcnUiValueSelector'

import { ShadcnUiValueEditor } from './ShadcnUiValueEditor'
import './styles.scss'

export * from './ShadcnUiActionElement'
export * from './ShadcnUiValueSelector'

export const shadcnUiControlClassnames = {
  ruleGroup: 'rounded-lg shadow-sm border bg-background',
} satisfies Partial<Classnames>

export const shadcnUiControlElements = {
  actionElement: ShadcnUiActionElement,
  removeGroupAction: ShadcnUiActionElementIcon,
  removeRuleAction: ShadcnUiActionElementIcon,
  valueSelector: ShadcnUiValueSelector,
  valueEditor: ShadcnUiValueEditor,
  notToggle: ShadcnUiNotToggle,
  dragHandle: ShadcnUiDragHandle,
} satisfies Partial<Controls<FullField, string>>

export const shadcnUiTranslations = {
  addRule: {
    label: (
      <>
        <Plus className='h-2 w-2' /> Rule
      </>
    ),
  },
  addGroup: {
    label: (
      <>
        <Plus className='h-2 w-2' /> Group
      </>
    ),
  },
  removeGroup: { label: <X className='h-2 w-2' /> },
  removeRule: { label: <X className='h-2 w-2' /> },
  cloneRuleGroup: { label: <Copy className='h-2 w-2' /> },
  cloneRule: { label: <Copy className='h-2 w-2' /> },
  lockGroup: { label: <Unlock className='h-2 w-2' /> },
  lockRule: { label: <Unlock className='h-2 w-2' /> },
  lockGroupDisabled: { label: <Lock className='h-2 w-2' /> },
  lockRuleDisabled: { label: <Lock className='h-2 w-2' /> },
  shiftActionDown: { label: <ChevronDown className='h-2 w-2' /> },
  shiftActionUp: { label: <ChevronUp className='h-2 w-2' /> },
} satisfies Partial<Translations>

export const QueryBuilderShadcnUi = getCompatContextProvider({
  // controlClassnames: shadcnUiControlClassnames,
  controlElements: shadcnUiControlElements,
  translations: shadcnUiTranslations,
})
