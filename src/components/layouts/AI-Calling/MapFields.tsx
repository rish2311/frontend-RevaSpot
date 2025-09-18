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
import { getClients, getOrigaAgents, triggerBulkCall } from '@/services'
import { useAuth0 } from '@auth0/auth0-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import isEmpty from 'lodash/isEmpty'
import { useState } from 'react'
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
      agent_identifier: z.string({
        required_error: 'Please select an agent identifier',
      }),
    })
    .superRefine((data, ctx) => {
      if (!data.mapping.lead_name || !data.mapping.lead_phone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'lead_id, lead_name, and lead_phone must be provided',
        })
      }
    })

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      mapping: Object.fromEntries(formFields.map((formField) => [formField.id, formField.default])),
      for_client: authState!.user?.org_name ?? '',
      agent_identifier: 'revspot_property_total_env',
    },
  })

  const { data: clients, error } = useQuery({
    queryKey: ['clients'],
    queryFn: () => getClients(),
    refetchIntervalInBackground: false,
    enabled: authState!.user!.org_name == 'revspot',
  })

  const { data: agents, error: agentsError } = useQuery({
    queryKey: ['agents'],
    queryFn: () => getOrigaAgents(),
    refetchIntervalInBackground: false,
    enabled: authState!.user!.org_name == 'revspot',
  })

  const mutation = useMutation({
    mutationKey: ['callBulkLeads'],
    mutationFn: ({
      file,
      mapping,
      agent_identifier,
      for_client,
    }: {
      file: File
      mapping: Record<string, string>
      agent_identifier: string
      for_client: string
    }) => triggerBulkCall(file, mapping, agent_identifier, for_client),
    onSuccess: (response) => {
      console.log('Bulk file enrichment successfully triggered:', response)
      onSuccess()
      toast.success(response.data?.message ?? 'Enrichment request started', {
        dismissible: true,
        duration: 2000,
      })
      form.reset()
      queryClient.invalidateQueries({ queryKey: ['history', enrichmentType] })
      // queryClient.invalidateQueries({ queryKey: ['credits'] })
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
        agent_identifier: formData.agent_identifier,
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
    if (authState!.user!.org_name != 'revspot') {
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
                      {clients.map(function (client: any) {
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
            name='agent_identifier'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='mb-1'>Agent Identifier:</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className='w-full border-none bg-background text-secondary-foreground focus:ring-0'>
                      <SelectValue placeholder='Select agent identifier' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Agent Identifier</SelectLabel>
                      {agents.data.map(function (agent: any) {
                        return (
                          <SelectItem key={agent.agent_identifier} value={agent.agent_identifier}>
                            {agent.agent_identifier}
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
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col'>
      <h3 className='text-lg font-semibold'>Campaign Configs</h3>
      <p className='py-2 text-sm'>
        {csvColumns
          ? 'Configure this campaign with additional options'
          : 'Upload a file to view campaign options'}
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
                Mandatory
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
            Do you want to trigger {enrichmentType} for {records} records?
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
