import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { CheckIcon, XCircle, ChevronDown, XIcon, WandSparkles, Option, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import _ from 'lodash'
import LoaderDots from '../custom/LoaderDots'

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
const multiSelectVariants = cva(
  'm-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300',
  {
    variants: {
      variant: {
        default: 'border-foreground/10 text-foreground bg-card hover:bg-card/80',
        secondary:
          'border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        inverted: 'inverted',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export type Option = {
  /** The text to display for the option. */
  label: string
  /** The unique value associated with the option. */
  value: string
  /** Optional icon component to display alongside the option. */
  icon?: React.ComponentType<{ className?: string }>
}

type FetchOptions = (query?: string) => Promise<Option[]>

type OptionProps =
  | {
      options: Option[]
      fetchOptions?: never
    }
  | {
      options?: never
      fetchOptions?: FetchOptions
    }
  | {
      options?: Option[]
      fetchOptions?: FetchOptions
    }

/**
 * Props for MultiSelect component
 */
interface MultiSelectPropsCommon extends VariantProps<typeof multiSelectVariants> {
  /**
   * An array of option objects to be displayed in the multi-select component.
   * Each option object has a label, value, and an optional icon.
   */
  // options: Option[]
  // fetchOptions?: FetchOptions

  /**
   * Callback function triggered when the selected values change.
   * Receives an array of the new selected values.
   */
  onValueChange: (value: Option[]) => void

  /** The default selected values when the component mounts. */
  defaultValue?: Option[]

  /**
   * Placeholder text to be displayed when no values are selected.
   * Optional, defaults to "Select options".
   */
  placeholder?: string

  /**
   * Animation duration in seconds for the visual effects (e.g., bouncing badges).
   * Optional, defaults to 0 (no animation).
   */
  animation?: number

  /**
   * Maximum number of items to display. Extra selected items will be summarized.
   * Optional, defaults to 3.
   */
  maxCount?: number

  /**
   * The modality of the popover. When set to true, interaction with outside elements
   * will be disabled and only popover content will be visible to screen readers.
   * Optional, defaults to false.
   */
  modalPopover?: boolean

  /**
   * If true, renders the multi-select component as a child of another component.
   * Optional, defaults to false.
   */
  asChild?: boolean

  /**
   * Additional class names to apply custom styles to the multi-select component.
   * Optional, can be used to add custom styles.
   */
  className?: string
}

type MultiSelectProps = MultiSelectPropsCommon & OptionProps

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options: opts,
      fetchOptions,
      onValueChange,
      variant,
      defaultValue = [],
      placeholder = 'Select options',
      animation = 0,
      maxCount = 3,
      modalPopover = false,
      asChild = false,
      className,
      ...props
    },
    ref
  ) => {
    const [selectedOptions, setSelectedOptions] = React.useState<Option[]>(defaultValue)
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)
    const [isAnimating, setIsAnimating] = React.useState(false)

    const [isOptionsFetching, setIsOptionsFetching] = React.useState(false)
    const [options, setOptions] = React.useState<Option[]>((opts ??= []))

    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        setIsPopoverOpen(true)
      } else if (event.key === 'Backspace' && !event.currentTarget.value) {
        const newSelectedValues = [...selectedOptions]
        newSelectedValues.pop()
        setSelectedOptions(newSelectedValues)
        onValueChange(newSelectedValues)
      }
    }

    const _handleSearch = async (search?: string) => {
      if (!search && defaultValue.length > 0) {
        setOptions(defaultValue)
        setIsOptionsFetching(false)
        return
      }
      if (fetchOptions) {
        try {
          setIsOptionsFetching(true)
          const result = await fetchOptions(search)
          setOptions(result)
        } catch (e) {
          setOptions([])
        } finally {
          setIsOptionsFetching(false)
        }
      } else {
        // if (!search) {
        //   setOptions(defaultValue)
        // }
      }
    }

    const debouncedSearch = _.debounce(_handleSearch, 700)
    const handleSearch = (search?: string) => {
      debouncedSearch.cancel()
      setIsOptionsFetching(true)
      debouncedSearch(search)
    }

    const toggleOption = (option: Option) => {
      const newSelectedValues = selectedOptions.some((o) => o.value == option.value)
        ? selectedOptions.filter((value) => value.value !== option.value)
        : [...selectedOptions, option]
      setSelectedOptions(newSelectedValues)
      onValueChange(newSelectedValues)
    }

    const handleClear = () => {
      setSelectedOptions([])
      onValueChange([])
    }

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev)
      if (isPopoverOpen) {
      } else {
        if (fetchOptions) setOptions([])
      }
    }

    const clearExtraOptions = () => {
      const newSelectedValues = selectedOptions.slice(0, maxCount)
      setSelectedOptions(newSelectedValues)
      onValueChange(newSelectedValues)
    }

    const toggleAll = () => {
      if (selectedOptions.length === options.length) {
        handleClear()
      } else {
        // const allValues = options.map((option) => option.value)
        setSelectedOptions(options)
        onValueChange(options)
      }
    }

    const handleToggleAll = () => {
      const newSelectedOption = inverseSelection(selectedOptions, options)
      setSelectedOptions(newSelectedOption)
      onValueChange(newSelectedOption)
    }

    function inverseSelection(array1: Option[], array2: Option[]): Option[] {
      // Step 1: Create a Set of names from array2 for quick lookup
      const array2Names = new Set(array2.map((option) => option.value))

      // Step 2: Remove items from array1 that are in array2
      const filteredArray1 = array1.filter((option) => !array2Names.has(option.value))

      // Step 3: Add items from array2 that were not in array1
      const array1Names = new Set(array1.map((option) => option.value))
      const addedFromArray2 = array2.filter((option) => !array1Names.has(option.value))

      return filteredArray1.concat(addedFromArray2)
    }

    const onSelectViewChange = (visible: boolean) => {
      setIsPopoverOpen(visible)
      if (visible) {
        if (fetchOptions) {
          if (defaultValue.length > 0) {
            setOptions(defaultValue)
          } else {
            handleSearch('')
          }
        }
      }
    }

    // React.useEffect(() => {
    //   if (fetchOptions && options.length == 0) {
    //     _handleSearch()
    //   }
    // }, [])

    return (
      <Popover open={isPopoverOpen} onOpenChange={onSelectViewChange} modal={modalPopover}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            onClick={handleTogglePopover}
            className={cn(
              'flex h-auto min-h-10 w-full items-center justify-between rounded-md border bg-inherit p-1 hover:bg-inherit [&_svg]:pointer-events-auto',
              className
            )}
          >
            {selectedOptions.length > 0 ? (
              <div className='flex w-full items-center justify-between'>
                <div className='flex flex-wrap items-center'>
                  {selectedOptions.slice(0, maxCount).map((option, id) => {
                    // const option = options.find((o) => o.value === option.value)
                    const value = option.value
                    const IconComponent = option?.icon
                    return (
                      <Badge
                        key={id}
                        className={cn(
                          isAnimating ? 'animate-bounce' : '',
                          multiSelectVariants({ variant })
                        )}
                        style={{ animationDuration: `${animation}s` }}
                      >
                        {IconComponent && <IconComponent className='mr-2 h-4 w-4' />}
                        {option?.label}
                        <XCircle
                          className='ml-2 h-4 w-4 cursor-pointer'
                          onClick={(event) => {
                            event.stopPropagation()
                            toggleOption(option)
                          }}
                        />
                      </Badge>
                    )
                  })}
                  {selectedOptions.length > maxCount && (
                    <Badge
                      className={cn(
                        'border-foreground/1 bg-transparent text-foreground hover:bg-transparent',
                        isAnimating ? 'animate-bounce' : '',
                        multiSelectVariants({ variant })
                      )}
                      style={{ animationDuration: `${animation}s` }}
                    >
                      {`+ ${selectedOptions.length - maxCount} more`}
                      <XCircle
                        className='ml-2 h-4 w-4 cursor-pointer'
                        onClick={(event) => {
                          event.stopPropagation()
                          clearExtraOptions()
                        }}
                      />
                    </Badge>
                  )}
                </div>
                <div className='flex items-center justify-between'>
                  <XIcon
                    className='mx-2 h-4 cursor-pointer text-muted-foreground'
                    onClick={(event) => {
                      event.stopPropagation()
                      handleClear()
                    }}
                  />
                  <Separator orientation='vertical' className='flex h-full min-h-6' />
                  <ChevronDown className='mx-2 h-4 cursor-pointer text-muted-foreground' />
                </div>
              </div>
            ) : (
              <div className='mx-auto flex w-full items-center justify-between'>
                <span className='mx-3 text-sm text-muted-foreground'>{placeholder}</span>
                <ChevronDown className='mx-2 h-4 cursor-pointer text-muted-foreground' />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-auto p-0'
          align='start'
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder='Search...'
              onKeyDown={handleInputKeyDown}
              onValueChange={handleSearch}
            />
            {isOptionsFetching && (
              <CommandList>
                <div className='flex w-full flex-col items-center justify-center p-10'>
                  <LoaderDots />
                </div>
              </CommandList>
            )}
            {!isOptionsFetching && (
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem key='all' onSelect={handleToggleAll} className='cursor-pointer'>
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        selectedOptions.length === options.length
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <CheckIcon className='h-4 w-4' />
                    </div>
                    <span>(Select All)</span>
                  </CommandItem>
                  {options.map((option) => {
                    const isSelected = selectedOptions.some((o) => o.value == option.value)
                    return (
                      <CommandItem
                        key={option.value}
                        onSelect={() => toggleOption(option)}
                        className='cursor-pointer'
                      >
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'opacity-50 [&_svg]:invisible'
                          )}
                        >
                          <CheckIcon className='h-4 w-4' />
                        </div>
                        {option.icon && (
                          <option.icon className='mr-2 h-4 w-4 text-muted-foreground' />
                        )}
                        <span>{option.label}</span>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <div className='flex items-center justify-between'>
                    {selectedOptions.length > 0 && (
                      <>
                        <CommandItem
                          onSelect={handleClear}
                          className='flex-1 cursor-pointer justify-center'
                        >
                          Clear
                        </CommandItem>
                        <Separator orientation='vertical' className='flex h-full min-h-6' />
                      </>
                    )}
                    <CommandItem
                      onSelect={() => setIsPopoverOpen(false)}
                      className='max-w-full flex-1 cursor-pointer justify-center'
                    >
                      Close
                    </CommandItem>
                  </div>
                </CommandGroup>
              </CommandList>
            )}
          </Command>
        </PopoverContent>
        {animation > 0 && selectedOptions.length > 0 && (
          <WandSparkles
            className={cn(
              'my-2 h-3 w-3 cursor-pointer bg-background text-foreground',
              isAnimating ? '' : 'text-muted-foreground'
            )}
            onClick={() => setIsAnimating(!isAnimating)}
          />
        )}
      </Popover>
    )
  }
)

MultiSelect.displayName = 'MultiSelect'
