import SelectInputField from '@/components/custom/SelectInputField'
import { Form, FormDescription } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import isEmpty from 'lodash/isEmpty'
import { ChevronRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formFields: CustomFormField[] = [
  {
    id: 'name',
    label: 'Name',
    validation: z.string().optional(),
    default: '',
    isMappable: true,
    required: true,
  },
  {
    id: 'email',
    label: 'Email ID',
    type: 'email',
    isMappable: true,
    validation: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
    default: '',
    required: true,
  },
  {
    id: 'phone',
    label: 'Phone Number',
    type: 'tel',
    isMappable: true,
    validation: z
      .string()
      .length(10, 'Please enter a valid phone number (without country code prefix)')
      .optional()
      .or(z.literal('')),
    default: '',
    required: true,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn Link',
    type: 'url',
    isMappable: true,
    validation: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
    default: '',
    required: true,
  },
]

const MapStagesForm = ({
  onSuccess,
  onReset,
  onError,
}: {
  onSuccess: () => void
  onReset?: () => void
  onError?: (msg: string) => void
}) => {
  const schema = z.object(
    Object.fromEntries(
      formFields.map((field) => [
        field.id,
        field.mapValidation ?? z.string().optional().or(z.literal('')),
      ])
    )
  )

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: Object.fromEntries(
      formFields.map((formField) => [formField.id, formField.default])
    ),
  })

  const validateForm = async (): Promise<boolean> => {
    const _ = form.formState.errors // also works if you read form.formState.isValid
    await form.trigger()
    if (form.formState.isValid) {
      return true
    }
    if (isEmpty(form.formState.errors)) {
      console.error('Error in the form')
    } else {
      console.error(form.formState.errors)
    }
    return false
  }

  const onCancel = () => {
    if (onReset) onReset()
    form.reset()
  }

  const onSubmit = async (data: z.infer<typeof schema>) => {
    console.log('Form submitted:', data)
  }

  return (
    <div className='flex flex-col'>
      <h3 className='text-lg font-semibold'>Map Stages of CRM</h3>
      <p className='py-4 text-sm'>
        These the field names that we will look at for different stages of enrichment data
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col space-y-4 py-4 text-sm font-medium'
        >
          <div className='flex w-full items-center justify-stretch space-x-6 text-xs font-semibold text-muted-foreground'>
            <p className='flex w-2/5'>Revspot Required Fields</p>
            <ChevronRight size={18} />
            <p className='flex w-3/5'>CRM fields</p>
          </div>
          {formFields.map((formField) => (
            <SelectInputField
              key={formField.id}
              formField={formField}
              formControl={form.control}
              selectValues={[]}
            />
          ))}
          <FormDescription>
            <span className='font-normal text-foreground before:mr-1 before:text-red-500 before:content-["*"]'>
              It is mandatory to map all the fields in order for us to enrich your data
            </span>
          </FormDescription>
        </form>
      </Form>
    </div>
  )
}

export default MapStagesForm
