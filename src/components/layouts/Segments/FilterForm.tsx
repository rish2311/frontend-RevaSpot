import { ClearButton, PrimaryButton } from '@/components/custom/Buttons'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { zodResolver } from '@hookform/resolvers/zod'
import { isEmpty } from 'lodash'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const FilterForm = ({
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
    if (onReset) onReset()
  }

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log('Form submitted:', data)
    if (!(await validateForm())) console.log('Invalid filter form')
    else {
      onSuccess(data)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col flex-wrap space-y-4 text-sm'
      >
        <div className='flex h-[68vh] flex-grow flex-col space-y-4 overflow-y-auto'>
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
                          type={typeof formField.default === 'string' ? 'single' : 'multiple'}
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
  )
}

export default FilterForm
