import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEffect, useState } from 'react'

import { ClearButton, PrimaryButton } from '@/components/custom/Buttons'
import HUDLoader from '@/components/custom/HUDLoader'
import InputField from '@/components/custom/InputField'
import { Form, FormDescription } from '@/components/ui/form'
import { enrichLead, getLeadStatus } from '@/services'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import isEmpty from 'lodash/isEmpty'
import { useForm } from 'react-hook-form'
import JsonView from 'react18-json-view'
import 'react18-json-view/src/dark.css'
import 'react18-json-view/src/style.css'
import { z } from 'zod'
import DisabledTabs from './DisabledTabs'
import History from './History'
import MapFields from './MapFields'
import ErrorCard from './ErrorCard'
import MediaUpload from './MediaUpload'
import ProfileCard, { ProfileData } from './ProfileCard'
import { toast } from 'sonner'
import { getCredits } from '@/services/credits'

export interface EnrichmentResult {
  msg: string
  lead_id: string
  tracking_id: string
}

// Define an enum for the enrichment states
enum EnrichmentState {
  IDLE = 'idle',
  PROCESSING = 'processing',
  ENRICHED = 'enriched',
  UNENRICHED = 'unenriched',
  TIMEOUT = 'timeout',
  ERROR = 'error',
}

const formFields: CustomFormField[] = [
  {
    id: 'lead_id',
    label: 'Lead Id',
    type: 'string',
    validation: z.string().optional(),
    default: '',
    isMappable: true,
  },
  {
    id: 'name',
    label: 'Name',
    validation: z.string().optional(),
    default: '',
    isMappable: true,
  },

  {
    id: 'email',
    label: 'Email',
    type: 'email',
    validation: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
    default: '',
    required: true,
    isMappable: true,
  },
  {
    id: 'phone',
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
    id: 'linkedin',
    label: 'LinkedIn Link',
    type: 'url',
    isMappable: true,
    validation: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
    default: '',
    required: true,
  },
]

const schema = z
  .object(Object.fromEntries(formFields.map((field) => [field.id, field.validation])))
  .superRefine((data, ctx) => {
    if (!data.email && !data.phone && !data.linkedin && !data.lead_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one of email, lead id, phone, or LinkedIn URL must be provided',
      })
    }
  })

const SingleForm = ({
  onSuccess,
  onReset,
  onError,
}: {
  onSuccess: (data: EnrichmentResult) => void
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
    mutationKey: ['enrichLead'],
    mutationFn: enrichLead,
    onSuccess: (response: EnrichmentResult) => {
      console.log('Lead enriched successfully:', response)
      onSuccess(response)
      queryClient.invalidateQueries({ queryKey: ['credits'] })
      queryClient.refetchQueries({ queryKey: ['credits'] })
    },
    onError: (error: any) => {
      console.error('Error enriching lead:', error)
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
          <span className='before:mr-1 before:text-red-500 before:content-["*"]'>
            It is mandatory to input at least one field from Email, Phone Number or LinkedIn URL.
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

const EnrichmentTabContent = () => {
  const queryClient = useQueryClient()
  const tabStyles =
    'rounded-full px-4 data-[state=inactive]:text-foreground data-[state=inactive]:font-normal data-[state=active]:bg-accent'
  const headerTabStyle =
    'px-4 data-[state=inactive]:text-foreground data-[state=inactive]:font-normal data-[state=active]:bg-accent'
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [jsonView, setJsonView] = useState<any | null>(null)
  const [enrichmentResult, setEnrichmentResult] = useState<EnrichmentResult | null>(null)
  const [enrichmentState, setEnrichmentState] = useState<EnrichmentState>(EnrichmentState.IDLE)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [csvColumns, setCsvColumns] = useState<string[] | null>(null)
  const [records, setRecords] = useState<number | null>(null)

  const search: Record<string, string> = useSearch({ from: '/enrichment/' })
  const defaultTab = search?.type === 'bulk' ? 'Bulk' : 'Single'

  const { data: leadData } = useQuery({
    queryKey: ['leadStatus', enrichmentResult?.lead_id],
    queryFn: () => getLeadStatus(enrichmentResult?.lead_id!),
    enabled: !!enrichmentResult?.lead_id,
    refetchInterval: (query) => {
      const maxRetries = 30
      const currentRetries = query.state.dataUpdateCount

      const lead = query.state.data?.data

      if (currentRetries > maxRetries) {
        if (lead?.status === 'processing') {
          setEnrichmentState(EnrichmentState.TIMEOUT)
          setProfile({})
          setEnrichmentResult(null)
        }
        return false
      }

      if (lead?.status === 'completed') {
        if (lead.enriched) {
          return false // let useEffect handle ENRICHED
        } else {
          setEnrichmentState(EnrichmentState.UNENRICHED)
          setProfile({})
          setEnrichmentResult(null)
          return false
        }
      }

      return 2000
    },
    refetchIntervalInBackground: true,
  })

  useEffect(() => {
    const fetchedLeadData = leadData?.data

    if (!fetchedLeadData) return

    if (fetchedLeadData.status === 'completed') {
      if (fetchedLeadData.enriched) {
        setProfile({
          photoUrl: fetchedLeadData.photoUrl,
          persona: fetchedLeadData.personality,
          name: fetchedLeadData.name,
          first_name: fetchedLeadData.first_name,
          last_name: fetchedLeadData.last_name,
          email: fetchedLeadData.email,
          phone: fetchedLeadData.phone,
          location: fetchedLeadData.location,
          age: fetchedLeadData.age,
          jobTitle: fetchedLeadData.job_title,
          companyName: fetchedLeadData.company_name,
          professionalLevel: fetchedLeadData.professional_level,
          companyTier: fetchedLeadData.company_tier,
          salary: fetchedLeadData.salary_range,
          netWorth: fetchedLeadData.net_worth,
          linkedin: fetchedLeadData.linkedin,
          estimated_lifetime_earnings: fetchedLeadData.estimated_lifetime_earnings,
          estimated_yearly_earnings: fetchedLeadData.estimated_yearly_earnings,
        })
        setJsonView({ ...fetchedLeadData })
        setEnrichmentState(EnrichmentState.ENRICHED)

        queryClient.invalidateQueries({ queryKey: ['credits'] })
        queryClient
          .fetchQuery({
            queryKey: ['credits'],
            queryFn: () => getCredits,
          })
          .then((newCredits) => {
            queryClient.setQueryData(['credits'], newCredits)
          })
      }
    }
  }, [leadData, queryClient])

  useEffect(() => {
    if (enrichmentResult?.lead_id) {
      setEnrichmentState(EnrichmentState.PROCESSING) // Set to processing when a lead ID is available
      queryClient.invalidateQueries({ queryKey: ['leadStatus', enrichmentResult.lead_id] })
    }
  }, [enrichmentResult])

  const handleSingleFormSuccess = (data: EnrichmentResult) => {
    setProfile(null)
    setEnrichmentResult(data)
    setEnrichmentState(EnrichmentState.PROCESSING) // Start processing state on form success
  }

  const handleSingleFormReset = () => {
    setProfile(null)
    setEnrichmentResult(null)
    setEnrichmentState(EnrichmentState.IDLE) // Reset to idle on form reset
  }

  const handleSingleFormError = () => {
    setProfile(null)
    setEnrichmentResult(null)
    setEnrichmentState(EnrichmentState.ERROR) // Set to error on form error
  }

  const handleBulkFormReset = () => {
    setUploadedFile(null)
    setCsvColumns(null)
    // No specific enrichment state for bulk in this part, but could be added
  }

  const handleBulkFormSuccess = () => {
    setUploadedFile(null)
    setCsvColumns(null)
    // No specific enrichment state for bulk in this part, but could be added
  }

  const renderSingleResultContent = () => {
    switch (enrichmentState) {
      case EnrichmentState.IDLE:
        return (
          <p className='mt-4 text-sm text-secondary-foreground'>
            Search a prospect to see the details!
          </p>
        )
      case EnrichmentState.PROCESSING:
        return (
          <div className='mt-4 flex h-[40vh] flex-col items-center justify-center rounded-[8px] bg-white'>
            <p className='mb-2 text-xl font-medium text-gray-700'>
              Hang on tight, this usually takes 15-30s
            </p>
            <div className='flex space-x-2'>
              <div className='h-2 w-2 animate-bounce rounded-full bg-blue-600 delay-0'></div>
              <div className='h-2 w-2 animate-bounce rounded-full bg-blue-600 delay-150'></div>
              <div className='h-2 w-2 animate-bounce rounded-full bg-blue-600 delay-300'></div>
            </div>
          </div>
        )
      case EnrichmentState.ENRICHED:
        return (
          <>
            <TabsContent value='Profile Card'>
              {profile && <ProfileCard profileData={profile} />}
            </TabsContent>
            <TabsContent value='JSON'>
              <div className='max-h-[50vh] overflow-y-scroll'>
                <JsonView src={jsonView} className='rounded-2xl bg-background p-4' />
              </div>
            </TabsContent>
          </>
        )
      case EnrichmentState.UNENRICHED:
        return (
          <ErrorCard
            variant='warning'
            msg='Lead could not be enriched. Not enough details were found about the lead.'
            clearForm={handleSingleFormReset}
          />
        )

      case EnrichmentState.TIMEOUT:
        return (
          <ErrorCard
            variant='warning'
            msg='Lead could not be enriched. Not enough details were found about the lead.'
            clearForm={handleSingleFormReset}
          />
        )
      case EnrichmentState.ERROR:
        return (
          <>
            <TabsContent value='Profile Card'>
              <ErrorCard />
            </TabsContent>
            <TabsContent value='JSON'>
              <JsonView src={{ error: 'Unable to process the request. Please try again' }} />
            </TabsContent>
          </>
        )
      default:
        return null
    }
  }

  return (
    <Tabs defaultValue={'enrichment'} className='flex h-full w-full flex-col px-1'>

      <TabsContent value='enrichment'>
        <div className='mt-4'>
          <h3 className='text-lg font-semibold'>Choose Method</h3>
          <p className='pt-4 text-sm'>
            <span className='font-semibold'>Single entry</span>: Enrich a single entity
          </p>
          <p className='pb-4 text-sm'>
            <span className='font-semibold'>Bulk entry</span>: Upload a csv list with data
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
                <Tabs defaultValue='Profile Card' className='flex w-full flex-col gap-4'>
                  <div className='flex flex-row items-start justify-between'>
                    <h3 className='text-lg font-semibold'>Result</h3>
                    {enrichmentState === EnrichmentState.ENRICHED ? (
                      <TabsList className='h-fit gap-x-4 rounded-full bg-background px-2 py-1'>
                        <TabsTrigger value='Profile Card' className={tabStyles}>
                          Profile Card
                        </TabsTrigger>
                        <TabsTrigger value='JSON' className={tabStyles}>
                          JSON
                        </TabsTrigger>
                      </TabsList>
                    ) : (
                      <DisabledTabs />
                    )}
                  </div>
                  {renderSingleResultContent()}
                </Tabs>
              </TabsContent>

              <TabsContent value='Bulk' className='row-span-2 p-4'>
                <div>
                  <MapFields
                    records={records}
                    enrichmentType='Enrichment'
                    uploadedFile={uploadedFile}
                    formFields={formFields.filter((formField) => formField.isMappable)}
                    onSuccess={handleBulkFormSuccess}
                    onReset={handleBulkFormReset}
                    onError={(msg) => new Error(msg)}
                    csvColumns={csvColumns}
                  />
                </div>
              </TabsContent>

              <TabsContent value='Bulk' className='col-span-2'>
                <div className='mt-6'>
                  <History historyType='Enrichment' />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </TabsContent>
    </Tabs>
  )
}

export default EnrichmentTabContent
