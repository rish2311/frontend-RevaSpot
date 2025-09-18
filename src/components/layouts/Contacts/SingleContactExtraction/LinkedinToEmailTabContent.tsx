import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState, useEffect } from 'react'

import { ClearButton, PrimaryButton } from '@/components/custom/Buttons'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import DisabledTabs from '../../Enrichment/DisabledTabs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getLeadContact, getLeadContactInfo, leadLinkedinData } from '@/services'
import ContactCard, { ContactData } from '../../Enrichment/ContactCard'
import { toast } from 'sonner'
import ContactSkeleton from '../../Enrichment/ContactSkeleton'
import ErrorCard from '../../Enrichment/ErrorCard'
import { getCredits } from '@/services/credits'
import PendingCard from '../../Enrichment/PendingCard'
import SingleEnrichmentHistory from './SingleEnrichmentHistory'

export interface LeadContactTrackingResult {
  msg: string
  contact_id: string
  tracking_id: string
}

const schema = z.object({
  linkedinUrl: z.string().url('Please enter a valid LinkedIn URL'),
  contactType: z.enum(['professional_email', 'personal_email', 'phone']),
})

const SingleForm = ({
  onSuccess,
  onError,
  onReset,
}: {
  onSuccess: (response: LeadContactTrackingResult) => void
  onError: () => void
  onReset?: () => void
}) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      linkedinUrl: '',
      contactType: 'professional_email',
    },
  })

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationKey: ['leadContactTracking'],
    mutationFn: getLeadContact,
    onSuccess: (response: LeadContactTrackingResult) => {
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

  const onSubmit = (data: z.infer<typeof schema>) => {
    const leadLinkedin: leadLinkedinData = {
      linkedin: data.linkedinUrl,
      contact_type: data.contactType,
    }
    mutation.mutate(leadLinkedin)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={handleKeyDown}
        className='space-y-4 py-4'
      >
        <FormField
          control={form.control}
          name='linkedinUrl'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='font-medium text-secondary-foreground after:ml-1 after:text-red-500 after:content-["*"]'>
                Enter LinkedIn URL
              </FormLabel>
              <FormControl>
                <Input
                  type='url'
                  placeholder='Type Here'
                  {...field}
                  className='border-none bg-background'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='contactType'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='font-medium text-secondary-foreground'>Email Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className='flex flex-row space-x-4'
                >
                  <FormItem className='flex items-center space-x-2'>
                    <FormControl>
                      <RadioGroupItem value='professional_email' />
                    </FormControl>
                    <FormLabel className='font-normal'>Professional</FormLabel>
                  </FormItem>
                  <FormItem className='flex items-center space-x-2'>
                    <FormControl>
                      <RadioGroupItem value='personal_email' />
                    </FormControl>
                    <FormLabel className='font-normal'>Personal</FormLabel>
                  </FormItem>
                  <FormItem className='flex items-center space-x-2'>
                    <FormControl>
                      <RadioGroupItem value='phone' />
                    </FormControl>
                    <FormLabel className='font-normal'>Phone</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        <div className='flex justify-end gap-4'>
          <ClearButton onClick={onCancel}>Cancel</ClearButton>
          <PrimaryButton type='submit'>Submit</PrimaryButton>
        </div>
      </form>
    </Form>
  )
}

const LinkedinToEmailTabContent = () => {
  const [leadTrackingInfo, setLeadTrackingInfo] = useState<LeadContactTrackingResult | null>(null)
  const [leadTrackingError, setLeadTrackingError] = useState(false)
  const [leadContact, setLeadContact] = useState<ContactData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [unfoundOrFailed, setUnfoundOrFailed] = useState(false)
  const [requestPending, setRequestPending] = useState(false)
  const queryClient = useQueryClient()
  const resultDisabled = !leadContact
  const { data: leadData } = useQuery({
    enabled: !!leadTrackingInfo?.contact_id,
    queryKey: ['leadContact', leadTrackingInfo?.contact_id],
    queryFn: () => getLeadContactInfo(leadTrackingInfo?.contact_id!),
    refetchInterval: (query): number | false => {
      const status = query.state.data?.data?.status
      const updateCount = query.state.dataUpdateCount

      if (status === 'failed' && !leadTrackingError) {
        setLeadTrackingInfo(null)
        setLeadTrackingError(true)
        setUnfoundOrFailed(true)
        setIsLoading(false)
        toast.error('Could not find phone information')
        return false
      }

      if (status === 'pending' && updateCount > 10 && !leadTrackingError) {
        setLeadTrackingInfo(null)
        setLeadTrackingError(true)
        setRequestPending(true)
        setIsLoading(false)
        toast.error('Request timed out. Please try again.')
        return false
      }

      queryClient.invalidateQueries({ queryKey: ['single-history'] })
      queryClient.refetchQueries({ queryKey: ['single-history'] })
      return status === 'completed' ? false : 2000
    },
    refetchIntervalInBackground: true,
  })

  useEffect(() => {
    if (leadData && leadData.data && leadData.data.status === 'completed') {
      if (leadData.data.email_status === 'unfound' || leadData.data.email === null) {
        setUnfoundOrFailed(true)
        setIsLoading(false)
        toast.error('Could not find email information')
      } else if (leadData.data.email_status === 'valid') {
        setLeadContact({ ...leadData.data })
        setUnfoundOrFailed(false)
        setIsLoading(false)
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
  }, [leadData])

  const onHandleSuccess = (data: LeadContactTrackingResult) => {
    setLeadTrackingInfo(data)
    setUnfoundOrFailed(false)
    setIsLoading(true)
  }

  const onHandleReset = () => {
    setLeadTrackingInfo(null)
    setLeadContact(null)
    setUnfoundOrFailed(false)
    setIsLoading(false)
  }

  const onHandleError = () => {
    setLeadTrackingInfo(null)
    setLeadTrackingError(true)
    setLeadContact(null)
    setIsLoading(false)

    console.log('loading on error', isLoading)
  }

  const tabStyles =
    'rounded-full px-4 data-[state=inactive]:text-foreground data-[state=inactive]:font-normal data-[state=active]:bg-accent'

  return (
    <div className='grid grid-cols-2 gap-x-8'>
      <div className='flex flex-1 flex-col'>
        <Tabs defaultValue='Single' className='w-full'>
          <TabsContent value='Single'>
            <SingleForm
              onSuccess={onHandleSuccess}
              onReset={onHandleReset}
              onError={onHandleError}
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className='mt-4 flex flex-1 flex-col'>
        <Tabs defaultValue='Profile Card' className='w-full'>
          <div className='flex flex-row items-start justify-between'>
            <h3 className='text-lg font-semibold'>Result</h3>
            {resultDisabled ? (
              <DisabledTabs />
            ) : (
              <TabsList className='h-fit gap-x-4 rounded-full bg-background px-2 py-1'>
                <TabsTrigger value='Profile Card' className={tabStyles} disabled={resultDisabled}>
                  Profile Card
                </TabsTrigger>
                <TabsTrigger value='JSON' className={tabStyles} disabled={resultDisabled}>
                  JSON
                </TabsTrigger>
              </TabsList>
            )}
          </div>

          <div className='h-4' />

          {requestPending ? (
            <PendingCard msg='Fetching contact information...' />
          ) : isLoading ? (
            <ContactSkeleton />
          ) : unfoundOrFailed ? (
            <ErrorCard msg='Contact Information Not Found' clearForm={onHandleReset} />
          ) : leadContact ? (
            <>
              <TabsContent value='Profile Card'>
                <ContactCard contactData={leadContact} contact_type='email' />
              </TabsContent>
              <TabsContent value='JSON'>
                <pre className='rounded bg-gray-100 p-2'>
                  {JSON.stringify(leadContact, null, 2)}
                </pre>
              </TabsContent>
            </>
          ) : (
            <p className='text-sm text-secondary-foreground'>
              Search a prospect to see the details!
            </p>
          )}
        </Tabs>
      </div>
      <Tabs defaultValue='Single' className='col-span-2'>
        <TabsContent value='Single'>
          <SingleEnrichmentHistory historyType='personal_email,professional_email,phone' />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default LinkedinToEmailTabContent
