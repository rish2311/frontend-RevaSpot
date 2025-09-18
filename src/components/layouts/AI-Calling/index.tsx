import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'

import { ClearButton, PrimaryButton } from '@/components/custom/Buttons'
import HUDLoader from '@/components/custom/HUDLoader'
import InputField from '@/components/custom/InputField'
import { Form, FormDescription } from '@/components/ui/form'
import { triggerSingleCall } from '@/services'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import isEmpty from 'lodash/isEmpty'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import History from './History'
import MapFields from './MapFields'
import MediaUpload from './MediaUpload'
import { ErrorCard, SuccessCard } from './StatusCards'

export interface AICallingResult {
  msg: string
  lead_id: string
  tracking_id: string
}

const formFields: CustomFormField[] = [
  {
    id: 'lead_id',
    label: 'Lead Id',
    type: 'string',
    validation: z.string().optional(),
    default: '',
    isMappable: false,
  },
  {
    id: 'agent_identifier',
    label: 'Agent Id',
    type: 'string',
    validation: z.string().optional(),
    default: 'revspot_property_total_env',
    isMappable: false,
  },
  {
    id: 'lead_name',
    label: 'Name',
    validation: z.string().optional(),
    default: '',
    isMappable: true,
    required: true,
  },
  {
    id: 'lead_phone',
    label: 'Phone',
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
    id: 'call_schedule_time',
    label: 'Call Schedule Time',
    type: 'datetime-local',
    isMappable: true,
    validation: z.string().optional().or(z.literal('')),
    default: '',
  },
]

const schema = z.object(Object.fromEntries(formFields.map((field) => [field.id, field.validation])))

const SingleForm = ({
  onSuccess,
  onReset,
  onError,
}: {
  onSuccess: (data: AICallingResult) => void
  onReset?: () => void
  onError?: () => void
}) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: Object.fromEntries(
      formFields.map((formField) => [formField.id, formField.default])
    ),
  })

  const queryClient = useQueryClient()
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

  const mutation = useMutation({
    mutationKey: ['ingleLead'],
    mutationFn: triggerSingleCall,
    onSuccess: (response: AICallingResult) => {
      console.log('Lead called successfully:', response)
      onSuccess(response)
      //   queryClient.invalidateQueries({ queryKey: ['credits'] })
      //   queryClient.refetchQueries({ queryKey: ['credits'] })
    },
    onError: (error: any) => {
      console.error('Error calling lead:', error)
      toast.error(error.response.data.error.text)
      if (onError) onError()
    },
  })

  const onCancel = () => {
    if (onReset) onReset()
    form.reset()
  }

  const onSubmit = async (data: z.infer<typeof schema>) => {
    console.log('Form submitted:', data)
    if (!(await validateForm())) console.log('Invalid')
    else mutation.mutate(data)
  }
  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
    }
  }

  return (
    <Form {...form}>
      {mutation.isPending && <HUDLoader />}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={handleKeyDown}
        className='w-full space-y-4 py-4'
      >
        {formFields.map((formField) => (
          <InputField formControl={form.control} formField={formField} key={formField.id} />
        ))}
        <FormDescription>
          <span className='before:mr-1 before:italic before:text-black before:content-["NOTE:"]'>
            Default call schedule time is immediate, subject to queue delay.
          </span>
        </FormDescription>
        <div className='flex justify-end gap-4'>
          <ClearButton onClick={onCancel}>Cancel</ClearButton>
          <PrimaryButton type='submit'>Submit</PrimaryButton>
        </div>
      </form>
    </Form>
  )
}

const AICalling = () => {
  const queryClient = useQueryClient()
  const tabStyles =
    'rounded-full px-4 data-[state=inactive]:text-foreground data-[state=inactive]:font-normal data-[state=active]:bg-accent'
  const headerTabStyle =
    'px-4 data-[state=inactive]:text-foreground data-[state=inactive]:font-normal data-[state=active]:bg-accent'
  const [aiCallingResult, setAICallingResult] = useState<AICallingResult | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [csvColumns, setCsvColumns] = useState<string[] | null>(null)
  const [records, setRecords] = useState<number | null>(null)
  const [aiCallingError, setAICallingError] = useState(false)

  const search: Record<string, string> = useSearch({ from: '/ai_calling/' })
  const defaultTab = search?.type === 'bulk' ? 'Bulk' : 'Single'

  const handleSingleFormSuccess = (data: AICallingResult) => {
    setAICallingResult(data)
    setAICallingError(false)
  }

  const handleSingleFormReset = () => {
    setAICallingResult(null)
    setAICallingError(false)
  }

  const handleSingleFormError = () => {
    setAICallingResult(null)
    setAICallingError(true)
  }

  const handleBulkFormReset = () => {
    setUploadedFile(null)
    setCsvColumns(null)
    setAICallingError(false)
  }

  const handleBulkFormSuccess = () => {
    setUploadedFile(null)
    setCsvColumns(null)
    setAICallingError(false)
  }

  return (
    <div className='mt-4'>
      <h3 className='text-lg font-semibold'>Choose Method</h3>
      <p className='pt-4 text-sm'>
        <span className='font-semibold'>Single entry</span>: Call a single entity
      </p>
      <p className='pb-4 text-sm'>
        <span className='font-semibold'>Bulk entry</span>: Upload a csv list with data to call
      </p>

      <Tabs defaultValue={defaultTab === 'Bulk' ? 'Bulk' : 'Single'}>
        <div className='grid grid-cols-2 content-start items-start'>
          {/*left column*/}
          <div>
            <TabsList className='h-fit max-w-fit gap-x-4 rounded-full bg-background px-2 py-1'>
              <TabsTrigger value='Single' className={tabStyles}>
                Single
              </TabsTrigger>
              <TabsTrigger value='Bulk' className={tabStyles}>
                Bulk
              </TabsTrigger>
            </TabsList>

            <TabsContent value='Single' className='row-start-2 p-4'>
              <div>
                <SingleForm
                  onSuccess={handleSingleFormSuccess}
                  onReset={handleSingleFormReset}
                  onError={handleSingleFormError}
                />
              </div>
            </TabsContent>

            <TabsContent value='Bulk' className='h-full'>
              <MediaUpload
                records={records}
                setRecords={setRecords}
                setFile={setUploadedFile}
                setCsvColumns={setCsvColumns}
                uploadedFile={uploadedFile}
              />
            </TabsContent>
          </div>

          <TabsContent value='Single' className='col-start-2 row-span-2 p-4'>
            {aiCallingResult && <SuccessCard msg='Lead called successfully.' />}
            {aiCallingError && <ErrorCard msg='Error calling lead.' />}
          </TabsContent>

          <TabsContent value='Bulk' className='row-span-2 p-4'>
            <div>
              <MapFields
                records={records}
                enrichmentType='AI-Calling'
                uploadedFile={uploadedFile}
                formFields={formFields.filter((formField) => formField.isMappable)}
                onSuccess={handleBulkFormSuccess}
                onReset={handleBulkFormReset}
                onError={(msg: string) => new Error(msg)}
                csvColumns={csvColumns}
              />
            </div>
          </TabsContent>

          <TabsContent value='Bulk' className='col-span-2'>
            <div className='mt-6'>
              <History historyType='AI-Calling' />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default AICalling
