import { ClearButton, PrimaryButton } from '@/components/custom/Buttons'
import HUDLoader from '@/components/custom/HUDLoader'
import SelectMappingField from '@/components/custom/SelectMappingField'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { fileEnrich, getClients } from '@/services'
import { useAuth0 } from '@auth0/auth0-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import isEmpty from 'lodash/isEmpty'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const MapFields = ({
  records,
  enrichmentType,
  uploadedFile,
  formFields,
  csvColumns,
  onSuccess,
  onReset,
  onError,
}: {
  records: number | null
  enrichmentType: string
  uploadedFile: File | null
  formFields: CustomFormField[]
  csvColumns: string[] | null
  onSuccess: () => void
  onReset?: () => void
  onError?: (msg: string) => void
}) => {
  const authState = useAuth0()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState<z.infer<typeof schema> | null>(null)
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const schema = z
    .object({
      mapping: z.object(
        Object.fromEntries(
          formFields.map((field) => [
            field.id,
            field.mapValidation ?? z.string().optional().or(z.literal('')),
          ])
        )
      ),
      for_client: z.string({
        required_error: 'Please select an client.',
      }),
      enrichment_type: z.string({
        required_error: 'Please select an enrichment type',
      }),
      extract_emails: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.mapping.email && !data.mapping.phone && !data.mapping.linkedin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one of email, phone, or LinkedIn URL must be provided',
        })
      }
    })

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      mapping: Object.fromEntries(formFields.map((formField) => [formField.id, formField.default])),
      for_client: authState!.user?.org_name ?? '',
      enrichment_type: 'enrichment',
      extract_emails: false,
    },
  })

  const { data: clients, error } = useQuery({
    queryKey: ['clients'],
    queryFn: () => getClients(),
    // refetchInterval: (query): number | false =>
    //   query.state.data?.data?.length === 0 ? false : 5000,
    refetchIntervalInBackground: false,
    enabled: authState!.user!.org_name == 'revspot_admin',
  })

  const mutation = useMutation({
    mutationKey: ['history', enrichmentType],
    mutationFn: ({
    file,
    mapping,
    enrichment_type,
    for_client,
    extract_emails,
  }: {
    file: File
    mapping: Record<string, string>
    enrichment_type: string
    for_client: string
    extract_emails?: boolean
  }) => fileEnrich(file, mapping, for_client, enrichment_type, extract_emails),
    onSuccess: (response) => {
      console.log('Bulk file enrichment successfully triggered:', response)
      onSuccess()
      toast.success(response.data?.message ?? 'Enrichment request started', {
        dismissible: true,
        duration: 2000,
      })
      form.reset()
      queryClient.invalidateQueries({ queryKey: ['history', enrichmentType] })
      queryClient.invalidateQueries({ queryKey: ['credits'] })
    },
    onError: (error: any) => {
      console.error('Error bulk enriching file:', error)
      if (onError) onError(error.message)
    },
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
    setSelectedColumns([])
    form.reset()
  }

  const onClearMapping = () => {
    setSelectedColumns([])
    form.reset()
  }

  const onSubmit = async (data: z.infer<typeof schema>) => {
    console.log('Form submitted:', data)
    if (!(await validateForm()) || !uploadedFile) console.log('Invalid')
    else {
      setFormData(data)
      setDialogOpen(true)
    }
  }

  const handleDialogConfirm = () => {
    if (formData && uploadedFile) {
      mutation.mutate({
        file: uploadedFile,
        mapping: formData.mapping,
        for_client: formData.for_client,
        enrichment_type: formData.enrichment_type,
        extract_emails: formData.extract_emails,
      })
    }
    setDialogOpen(false)
  }
  const handleCsvColumnSelect = (column: string, previousValue?: string) => {
    setSelectedColumns((prev) => {
      if (previousValue) {
        prev = prev.filter((col) => col !== previousValue)
      }
      if (!prev.includes(column)) {
        return [...prev, column]
      }
      return prev
    })
  }
  function AdvancedOptions() {
    const watchEnrichmentType = form.watch('enrichment_type')

    if (authState!.user!.org_name != 'revspot_admin') {
      return <></>
    }
    return (
      <div className='mb-2'>
        <Label htmlFor='configs' className='text-base'>
          Advanced options
        </Label>
        <div id='configs' className='mt-3 grid gap-4 sm:grid-cols-2 sm:gap-6'>
          <FormField
            control={form.control}
            name='for_client'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='mb-1'>Client Name:</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className='w-full border-none bg-background text-secondary-foreground focus:ring-0'>
                      <SelectValue placeholder='Select client' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Client Name</SelectLabel>
                      {clients.map(function(client: any) {
                        return (
                          <SelectItem key={client.company_name} value={client.company_name}>
                            {client.company_name}
                          </SelectItem>
                        )
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='enrichment_type'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='mb-1'>Enrichment Type:</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className='w-full border-none bg-background text-secondary-foreground focus:ring-0'>
                      <SelectValue placeholder='Select client' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Enrichment Types</SelectLabel>
                      <SelectItem value='enrichment'>Enrichment</SelectItem>
                      <SelectItem value='validation'>Validate</SelectItem>
                      <SelectItem value='validation and enrichment'>
                        Validate And Enrichment
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Conditional checkbox for email extraction when validation is selected */}
        {watchEnrichmentType === 'validation' && (
          <div className='mt-4'>
            <FormField
              control={form.control}
              name='extract_emails'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel>Extract Emails</FormLabel>
                    <FormDescription>
                      Enable email extraction during validation process
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='flex flex-col'>
      <h3 className='text-lg font-semibold'>Enrichment Configs</h3>
      <p className='py-2 text-sm'>
        {csvColumns
          ? 'Configure this enrichment request with additional options'
          : 'Upload a file to view enrichment options'}
      </p>
      {mutation.isPending && <HUDLoader />}
      {csvColumns && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col space-y-4 py-4 text-sm font-medium'
          >
            <AdvancedOptions />

            {/* <div className='flex w-full items-center justify-stretch space-x-6 text-xs font-semibold text-muted-foreground'>
              <p className='flex w-2/5'>Revspot Required Fields</p>
              <ChevronRight size={18} />
              <p className='flex w-3/5'>Uploaded file fields</p>
            </div> */}

            <Label className='text-base'>Field Mappings:</Label>
            {formFields.map((formField) => (
              <SelectMappingField
                key={formField.id}
                formField={formField}
                formControl={form.control}
                selectValues={csvColumns}
                selectedColumns={selectedColumns}
                onColumnSelect={handleCsvColumnSelect}
              />
            ))}
            <FormDescription>
              <span className='before:mr-1 before:text-red-500 before:content-["*"]'>
                It is mandatory to map at least one field from Email, Phone Number or LinkedIn URL.
              </span>
            </FormDescription>
            <div className='flex justify-end gap-4'>
              <ClearButton onClick={onClearMapping} disabled={csvColumns === null}>
                Clear Mapping
              </ClearButton>
              <ClearButton onClick={onCancel} disabled={csvColumns === null}>
                Clear
              </ClearButton>
              <PrimaryButton type='submit' disabled={csvColumns === null}>
                Submit
              </PrimaryButton>
            </div>
          </form>
        </Form>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogTitle>Confirmation Dialog</DialogTitle>
          <DialogDescription>
            Do you want to trigger {formData?.enrichment_type ?? 'enrichment'} for {records}{' '}
            records?
          </DialogDescription>
          <DialogFooter>
            <ClearButton onClick={() => setDialogOpen(false)}>No</ClearButton>
            <PrimaryButton onClick={handleDialogConfirm}>Yes</PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MapFields
