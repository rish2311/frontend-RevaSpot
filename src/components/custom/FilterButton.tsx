import { ClearButton, PrimaryButton } from '@/components/custom/Buttons'
import { DatePickerWithRange } from '@/components/custom/DateRangePicker'
import { MultiSelect } from '@/components/custom/MultiSelect'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { zodResolver } from '@hookform/resolvers/zod'
import { isEmpty } from 'lodash'
import { SlidersHorizontalIcon } from 'lucide-react'
import { useState } from 'react'
import { DateRange } from 'react-day-picker'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const FilterButton = ({
  filterConfig,
  formFields,
  formFieldOptions,
  files,
  segments,
  onSuccess,
  onReset,
  onError,
}: {
  filterConfig?: Record<string, any>
  formFields: CustomFormField[]
  formFieldOptions?: Record<string, string[]>
  files?: { id: string; file_name: string }[]
  segments?: { id: string; segment_name: string }[]
  onSuccess: (config: any) => void
  onReset?: () => void
  onError?: () => void
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const formSchema = z.object(
    Object.fromEntries(formFields.map((field) => [field.id, field.validation]))
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...Object.fromEntries(formFields.map((formField) => [formField.id, formField.default])),
      ...filterConfig,
    },
  })

  const validateForm = async (): Promise<boolean> => {
    const _ = form.formState.errors // also works if you read form.formState.isValid
    await form.trigger()
    if (form.formState.isValid) return true
    if (isEmpty(form.formState.errors)) console.error('Error in the form')
    else console.error(form.formState.errors)
    return false
  }

  const onCancel = () => {
    form.reset({
      ...Object.fromEntries(formFields.map((formField) => [formField.id, formField.default])),
      keepDefaultValues: false,
    })
    // TODO: Check if form.reset works without passing anything.
    if (onReset) onReset()
    setIsPopoverOpen(false)
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log('Form submitted:', data)
    if (!(await validateForm())) console.log('Invalid filter form')
    else {
      onSuccess(data)
      setIsPopoverOpen(false)
    }
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger
        className='flex items-center space-x-2 rounded-full border border-foreground px-4 py-2 text-sm'
        onClick={() => setIsPopoverOpen(!isPopoverOpen)}
      >
        <span>All Filters</span>
        <SlidersHorizontalIcon className='h-4 w-4' />
      </PopoverTrigger>
      <PopoverContent
        side='bottom'
        align='end'
        className='min-w-[30vw] max-w-[50vw] rounded-sm border border-secondary p-4'
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col flex-wrap space-y-4 text-sm'
          >
            <div className='flex max-h-[60vh] flex-col space-y-4 overflow-y-auto'>
              <FormField
                control={form.control}
                name='dateRange'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Filter by Date</FormLabel>
                    <FormControl>
                      <DatePickerWithRange
                        date={field.value as DateRange}
                        setDate={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {files && (
                <FormField
                  control={form.control}
                  name='files'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Filter by Files</FormLabel>
                      <FormControl>
                        <MultiSelect
                          //@ts-ignore
                          selectAllLabel='All Files'
                          maxCount={1}
                          options={files.map((file) => ({
                            label: file.file_name,
                            value: file.id,
                          }))}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          placeholder='Select Files'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {segments && (
                <FormField
                  control={form.control}
                  name='segments'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Filter by Segments</FormLabel>
                      <FormControl>
                        <MultiSelect
                          //@ts-ignore
                          selectAllLabel='All Segments'
                          maxCount={1}
                          options={segments.map((segment) => ({
                            label: segment.segment_name,
                            value: segment.id,
                          }))}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          placeholder='Select Segments'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {formFieldOptions &&
                formFields
                  .filter(
                    (formField) =>
                      formField.id !== 'dateRange' &&
                      formField.id !== 'files' &&
                      formField.id !== 'segments'
                  )
                  .map((formField) => (
                    <FormField
                      key={formField.id}
                      control={form.control}
                      name={formField.id}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{formField.label}</FormLabel>
                          <FormControl>
                            <ToggleGroup
                              type='multiple'
                              value={field.value}
                              onValueChange={field.onChange}
                              className='flex flex-wrap items-center justify-start rounded-2xl'
                            >
                              {formFieldOptions[formField.id].map((option: string) => (
                                <ToggleGroupItem
                                  key={option}
                                  value={option}
                                  className='h-fit rounded-full border border-secondary-foreground px-2 py-1 text-xs data-[state=on]:after:content-["✓"]'
                                >
                                  {option}
                                </ToggleGroupItem>
                              ))}
                            </ToggleGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
            </div>
            <div className='flex flex-row justify-end space-x-2'>
              <ClearButton onClick={onCancel} type='button'>
                Clear
              </ClearButton>
              <PrimaryButton type='submit'>Apply</PrimaryButton>
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  )
}

export default FilterButton
