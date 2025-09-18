import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import * as React from 'react'
import { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'

export function DatePickerWithRange({
  className,
  date,
  setDate,
}: {
  className?: string
  date: DateRange | undefined
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>
}) {
  const handleValueChange = (value: string) => {
    const today = new Date()
    let from, to

    switch (value) {
      case 'today': // Today
        from = new Date(today)
        from.setHours(0, 0, 0, 0)
        to = new Date(today)
        to.setHours(23, 59, 59, 999)
        break
      case 'week': // This Week
        from = new Date(today)
        from.setDate(today.getDate() - today.getDay()) // Previous Sunday
        from.setHours(0, 0, 0, 0)
        to = new Date(from)
        to.setDate(from.getDate() + 6) // Following Saturday
        to.setHours(23, 59, 59, 999)
        break
      case 'month': // This Month
        from = new Date(today.getFullYear(), today.getMonth(), 1) // First day of the month
        from.setHours(0, 0, 0, 0)
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0) // Last day of the month
        to.setHours(23, 59, 59, 999)
        break
      default:
        from = to = undefined
    }

    setDate({ from, to })
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id='date'
            variant={'outline'}
            className={cn(
              'w-full justify-start border-secondary text-left font-normal',
              !date && 'text-foreground'
            )}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto space-y-2 p-2' align='end'>
          <ToggleGroup
            type='single'
            className='items-center justify-center rounded-2xl p-2'
            onValueChange={handleValueChange}
          >
            <ToggleGroupItem
              value='today'
              aria-label='Toggle today'
              className='h-fit rounded-full border border-secondary-foreground px-2 py-1 text-xs data-[state=on]:after:content-["✓"]'
            >
              Today
            </ToggleGroupItem>
            <ToggleGroupItem
              value='week'
              aria-label='Toggle week'
              className='h-fit rounded-full border border-secondary-foreground px-2 py-1 text-xs data-[state=on]:after:content-["✓"]'
            >
              This Week
            </ToggleGroupItem>
            <ToggleGroupItem
              value='month'
              aria-label='Toggle month'
              className='h-fit rounded-full border border-secondary-foreground px-2 py-1 text-xs data-[state=on]:after:content-["✓"]'
            >
              This Month
            </ToggleGroupItem>
          </ToggleGroup>
          <Calendar
            initialFocus
            mode='range'
            defaultMonth={date?.to}
            selected={date}
            onSelect={(selectedDate) => {
              if (selectedDate) {
                let from, to
                if (selectedDate.from) {
                  from = new Date(selectedDate.from)
                  from.setHours(0, 0, 0, 0)
                }
                if (selectedDate.to) {
                  to = new Date(selectedDate.to)
                  to.setHours(23, 59, 59, 999)
                }
                setDate({ from, to })
              } else {
                setDate(selectedDate)
              }
            }}
            numberOfMonths={2}
            modifiersClassNames={{
              today: 'border border-primary',
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
