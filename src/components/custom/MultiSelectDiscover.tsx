import React, { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, X, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Filter, Option } from '@/components/layouts/marketing/Discover'
import { getFilterOptions } from '@/services/discover'
import { Checkbox } from '../ui/checkbox'
import { Spinner } from './HUDLoader'

interface MultiSelectProps {
  filter: Filter
  query: any
  onValueChange?: (values: string[]) => void
  setQuery: (query: any) => void
  onRemove?: () => void
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ filter, query, setQuery, onRemove }) => {
  const [open, setOpen] = useState(false)
  const [selectedValues, setSelectedValues] = useState<string[]>(query[filter.name]?.values || [])
  const [options, setOptions] = useState<Option[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 700)

  useEffect(() => {
    if (filter.type === 'static') {
      setOptions(filter.options || [])
    }
  }, [filter])

  const fetchOptions = async (query: string = '') => {
    if (filter.type === 'dynamic' && filter.fetch_url) {
      try {
        const url = query
          ? `${filter.fetch_url}${filter.fetch_url.includes('?') ? '&' : '?'}query=${encodeURIComponent(query)}`
          : filter.fetch_url

        const data = await getFilterOptions(url)

        if (Array.isArray(data)) {
          const mappedOptions = data.map((option: any) => ({
            label: option.label,
            value: option.name,
          }))
          setOptions(mappedOptions)
        } else {
          setOptions([])
          console.error('Unexpected API response format:', data)
        }
      } catch (error) {
        console.error('Error fetching options:', error)
        setOptions([])
      }
    }
  }

  useEffect(() => {
    if (filter.type === 'dynamic') {
      setIsFetching(true)
      setOptions([])
      fetchOptions(debouncedSearchTerm).finally(() => {
        setIsFetching(false)
      })
    } else {
      const filtered = (filter.options || []).filter((option) =>
        option.label.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
      setOptions(filtered)
    }
  }, [debouncedSearchTerm, filter])

  const handleSelect = (value: string) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value]

    setSelectedValues(newSelectedValues)
    setQuery((prev: any) => ({
      ...prev,
      [filter.name]: {
        ...prev[filter.name],
        values: newSelectedValues,
      },
    }))
  }

  const handleOperatorToggle = () => {
    const newOperator = query[filter.name].operator === 'IN' ? 'NOT_IN' : 'IN'
    setQuery((prev: any) => ({
      ...prev,
      [filter.name]: {
        ...prev[filter.name],
        operator: newOperator,
      },
    }))
  }

  const handleEmptyValueToggle = () => {
    const newEmptyValue = query[filter.name].empty_value === 'include' ? 'exclude' : 'include'
    setQuery((prev: any) => ({
      ...prev,
      [filter.name]: {
        ...prev[filter.name],
        empty_value: newEmptyValue,
      },
    }))
  }

  const handleValueRemove = (valueToRemove: string) => {
    const newSelectedValues = selectedValues.filter((value) => value !== valueToRemove)
    setSelectedValues(newSelectedValues)

    setQuery((prev: any) => ({
      ...prev,
      [filter.name]: {
        ...prev[filter.name],
        values: newSelectedValues,
      },
    }))
  }

  return (
    <div className='mb-2 flex w-full flex-col items-center space-x-4 border-b py-2'>
      <div className='flex w-full gap-2'>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              role='combobox'
              aria-expanded={open}
              className='w-full justify-between'
            >
              <span className='truncate'>{filter.label}</span>
              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-full p-0'>
            <Command>
              <input
                placeholder='Search options...'
                value={searchTerm}
                className='p-2 text-sm'
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {filter.type === 'static' ? (
                <>
                  <CommandEmpty>No options found.</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem key={option.value} onSelect={() => handleSelect(option.value)}>
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedValues.includes(option.value) ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {option.value}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              ) : (
                <>
                  {isFetching ? (
                    <CommandItem>
                      <Spinner />
                    </CommandItem>
                  ) : (
                    <>
                      <CommandEmpty>No options found.</CommandEmpty>
                      <CommandGroup className='w-full'>
                        {options.map((option) => (
                          <CommandItem
                            key={option.value}
                            onSelect={() => handleSelect(option.value)}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedValues.includes(option.value) ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            {option.value}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
                </>
              )}
            </Command>
          </PopoverContent>
        </Popover>
        <Button variant='ghost' size='sm' className='h-8 w-8 p-0' onClick={onRemove}>
          <X className='h-4 w-4' />
        </Button>
      </div>

      <section className='flex w-full items-start justify-start gap-4'>
        <div className='my-4 flex items-start gap-2'>
          <Checkbox
            id='operator'
            checked={query[filter.name]?.operator === 'not_in'}
            onCheckedChange={handleOperatorToggle}
          />
          <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
            Operator: NOT_IN
          </label>
        </div>
        <div className='my-4 flex items-start gap-2'>
          <Checkbox
            id='empty-value'
            checked={query[filter.name]?.empty_value === 'exclude'}
            onCheckedChange={handleEmptyValueToggle}
          />
          <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
            Include Empty Value
          </label>
        </div>
      </section>

      {query?.[filter.name]?.values?.length > 0 && (
        <div className='my-2 flex w-full flex-wrap gap-2'>
          {query?.[filter.name]?.values?.map((value: string) => (
            <Badge key={value} variant='secondary' className='flex gap-2'>
              {value}
              <XIcon 
  className="h-3 w-3 cursor-pointer"  
                onClick={()=>handleValueRemove(value)} />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
