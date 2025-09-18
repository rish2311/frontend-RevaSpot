// @ts-nocheck
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import * as React from 'react'
import type { OptionList } from 'react-querybuilder'
import { isOptionGroupArray } from 'react-querybuilder'

export type MultiSelectProps = {
  options?: OptionList
  value: string[]
  onValueChange: (value: string[]) => void
}

export function MultiSelect({ options = [], value, onValueChange }: MultiSelectProps) {
  const toDropdownOptions = (list: OptionList) =>
    isOptionGroupArray(list)
      ? list.map((og) => (
          <React.Fragment key={og.label}>
            <DropdownMenuLabel>{og.label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {og.options.map((opt) => (
              <DropdownMenuCheckboxItem
                key={opt.name}
                disabled={!!opt.disabled}
                checked={value.includes(opt.name ?? '')}
                onCheckedChange={(checked) => {
                  onValueChange(
                    checked ? [...value, opt.name ?? ''] : value.filter((v) => v !== opt.name)
                  )
                }}
              >
                {opt.label}
              </DropdownMenuCheckboxItem>
            ))}
          </React.Fragment>
        ))
      : Array.isArray(list)
        ? list.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt.name}
              disabled={!!opt.disabled}
              checked={value.includes(opt.name)}
              onCheckedChange={(checked) => {
                onValueChange(checked ? [...value, opt.name] : value.filter((v) => v !== opt.name))
              }}
            >
              {opt.label}
            </DropdownMenuCheckboxItem>
          ))
        : null

  const maxOptions = 2

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' className={cn(value.length > 0 && 'px-1', 'rounded-full')}>
          {[...value].slice(0, maxOptions).map((it) => (
            <div key={it} className='rounded-full bg-accent px-2 py-1 text-sm'>
              {it}
            </div>
          ))}
          {value.length > maxOptions && (
            <div className='rounded-full bg-accent px-2 py-1 text-sm'>
              +{value.length - maxOptions}
            </div>
          )}
          {value.length === 0 && 'Choose...'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-fit'>{toDropdownOptions(options)}</DropdownMenuContent>
    </DropdownMenu>
  )
}
