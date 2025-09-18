import {
  ConnectedState,
  LiveState,
  OutlineButton,
  PrimaryButton,
} from '@/components/custom/Buttons'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { XIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import IntegrateCrmForm from './IntegrateCrmForm'

import { INTEGRATIONS_CALLBACK_URL } from '@/config'
import { clientIntegrations, integrateCRM } from '@/services'
import useIntegration from '@/store/integration'
import { useAuth0 } from '@auth0/auth0-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

interface Integration {
  id: string
  name: string
  logo: string
  authLink: (client: string, domain?: string) => string
}

const integrationsList: Integration[] = [
  {
    id: 'hubspot',
    name: 'HubSpot',
    logo: '/logo_hubspot.png',
    authLink: (client: string) =>
      `https://app.hubspot.com/oauth/authorize?client_id=8185a921-a1bb-41dd-ba33-bc18db2824b5&redirect_uri=${INTEGRATIONS_CALLBACK_URL}&state=${client}:hubspot&scope=crm.schemas.contacts.write%20oauth%20crm.objects.leads.read%20crm.objects.leads.write%20crm.objects.contacts.write%20crm.objects.custom.read%20crm.objects.custom.write%20crm.schemas.contacts.read%20crm.objects.contacts.read`,
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    logo: '/logo_salesforce.jpeg',
    authLink: (client: string) =>
      `https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=3MVG9PwZx9R6_UrfaZ7b_r4mNN.mtgFWLeAmv1BalMTgnpiKKTTDl.qmzJE7YDQv4xU1zZHcFD2D3SevrwP66&redirect_uri=${INTEGRATIONS_CALLBACK_URL}&scope=api%20refresh_token&state=${client}:salesforce`,
  },
  {
    id: 'zoho',
    name: 'Zoho CRM',
    logo: '/logo_zoho.webp',
    authLink: (client: string) =>
      `https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id=1000.FVD8PK3ZCJNXELSDP4UXIFGZ7WIBSQ&scope=ZohoCRM.modules.ALL,ZohoCRM.settings.ALL,ZohoCRM.notifications.ALL,ZohoCRM.org.READ&redirect_uri=${INTEGRATIONS_CALLBACK_URL}&prompt=consent&access_type=offline&state=${client}:zoho`,
  },
  {
    id: 'leadsquared',
    name: 'LeadSquared',
    logo: '/logo_leadsquared.webp',
    authLink: (client: string) => '',
  },
  {
    id: 'freshsales',
    name: 'Freshsales',
    logo: '/Freshworks-logo.png',
    authLink: (client: string, baseUrl = 'https://revspot.myfreshsales.com') =>
      `${baseUrl}/org/oauth/v2/authorize` +
      `?response_type=code` +
      `&client_id=fw_ext_855050892060655871` +
      `&redirect_uri=${encodeURIComponent(INTEGRATIONS_CALLBACK_URL)}` +
      `&scope=${encodeURIComponent(
        'freshsales.contacts.upsert freshsales.contacts.fields.view freshsales.contacts.view freshsales.contacts.create freshsales.contacts.filters.view freshsales.contacts.delete freshsales.contacts.activities.view freshsales.contacts.edit freshsales.custom_fields.create freshsales.fields.view'
      )}` +
      `&prompt=consent` +
      `&state=${client}:freshsales`,
  },
]

enum ConnectionState {
  NotConnected,
  Connected,
  Live,
  Disabled,
}

const IntegrationCard = ({
  crm,
  status,
  onRefetch,
}: {
  crm: Integration
  status: any
  onRefetch: () => void
}) => {
  console.log(status)
  const authState = useAuth0()
  const [connectionState, setConnectionState] = useState(ConnectionState.NotConnected)
  const [openDialog, setOpenDialog] = useState(false)
  const [freshsalesUrl, setFreshworksUrl] = useState('')
  const [freshWorksApiKey, setFreshworksApiKey] = useState('')

  const mutation = useMutation({
    mutationFn: ({
      domain,
      api_key,
      state,
    }: {
      domain: string
      api_key: string
      state: string
    }) => {
      return integrateCRM({ domain, api_key, state })
    },
    onSuccess: (response) => {
      console.log('CRM integrated successfully:', response)
      toast.success('CRM integrated successfully!', { dismissible: true, duration: 2000 })
      setOpenDialog(false)
      setFreshworksUrl('')
      setFreshworksApiKey('')
      onRefetch()
    },
    onError: (error: any) => {
      console.error('Error integrating CRM:', error)
      toast.error('Failed to integrate CRM.')
    },
    retry: false,
  })

  useEffect(() => {
    if (status.crm) {
      if (status.crm === crm.id) {
        setConnectionState(ConnectionState.Connected)
      } else {
        setConnectionState(ConnectionState.Disabled)
      }
    } else {
      setConnectionState(ConnectionState.NotConnected)
    }
  }, [status.crm, crm.id])

  const handleIntegrationRedirect = () => {
    if (crm.id === 'freshsales') {
      setOpenDialog(true)
    } else {
      window.location.href = crm.authLink(authState.user?.org_name)
    }
  }

  const handleDialogClose = () => {
    setOpenDialog(false)
    setFreshworksUrl('')
    setFreshworksApiKey('')
  }

  const handleFreshworksSubmit = () => {
    if (!freshsalesUrl || !freshWorksApiKey) return

    mutation.mutate({
      domain: freshsalesUrl,
      api_key: freshWorksApiKey,
      state: `${authState.user?.org_name}:freshsales`,
    })
  }

  const getStatusComponent = () => {
    switch (connectionState) {
      case ConnectionState.Live:
        return <LiveState />
      case ConnectionState.Connected:
        return <ConnectedState />
      default:
        return null
    }
  }

  const getActionButton = () => {
    if (connectionState === ConnectionState.NotConnected) {
      return (
        <PrimaryButton className='px-8' onClick={handleIntegrationRedirect}>
          Connect
        </PrimaryButton>
      )
    }
    if (connectionState === ConnectionState.Disabled) {
      return (
        <PrimaryButton disabled className='px-8'>
          Connect
        </PrimaryButton>
      )
    }
    return (
      <OutlineButton className='px-8' disabled>
        Active
      </OutlineButton>
    )
  }

  return (
    <>
      <div className='flex flex-col items-center rounded-2xl border bg-background p-8 shadow-none'>
        <img src={crm.logo} alt={`${crm.name} Logo`} className='my-4 h-16 w-full object-contain' />
        {getActionButton()}
      </div>

      <Dialog open={openDialog} onOpenChange={handleDialogClose}>
        <DialogContent className='w-[400px] [&>button]:hidden'>
          <DialogHeader>
            <DialogTitle className='flex flex-row items-center justify-between'>
              {crm.id === 'freshsales' ? 'Connect Freshworks' : 'Complete connecting CRM'}
              <DialogClose asChild>
                <Button variant={'ghost'} size={'icon'} className='text-destructive'>
                  <XIcon />
                </Button>
              </DialogClose>
            </DialogTitle>
          </DialogHeader>

          {crm.id === 'freshsales' ? (
            <div className='flex flex-col gap-4'>
              <div>
                <label className='text-sm font-medium'>Freshworks domain URL:</label>
                <input
                  className='mt-1 w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  placeholder='https://yourcompany.myfreshsales.com'
                  value={freshsalesUrl}
                  onChange={(e) => setFreshworksUrl(e.target.value)}
                />
              </div>
              <div>
                <label className='text-sm font-medium'>Freshworks API key:</label>
                <input
                  type='password'
                  className='mt-1 w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                  placeholder='Your API Key'
                  value={freshWorksApiKey}
                  onChange={(e) => setFreshworksApiKey(e.target.value)}
                />
              </div>
              <div className='flex gap-2 pt-2'>
                <PrimaryButton
                  disabled={!freshsalesUrl || !freshWorksApiKey || mutation.isPending}
                  onClick={handleFreshworksSubmit}
                  className='flex-1'
                >
                  {mutation.isPending ? 'Connecting...' : 'Connect'}
                </PrimaryButton>
              </div>
            </div>
          ) : (
            <IntegrateCrmForm />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

const SkeletonCard = () => {
  return (
    <div className='flex flex-col items-center rounded-2xl border bg-background p-8'>
      <Skeleton className='my-4 h-16 w-full' />
      <Skeleton className='mb-2 h-6 w-24' />
      <Skeleton className='mb-4 h-4 w-16' />
      <Skeleton className='h-10 w-20' />
    </div>
  )
}


const Integrations = () => {
  const { queryParam: searchParams, callback, setQuery } = useIntegration()
  const {
    data: status,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['integration_status'],
    queryFn: () => clientIntegrations(),
    refetchIntervalInBackground: false,
    retry: false,
  })
  const didInitialise = useRef(false)

  const mutation = useMutation({
    mutationFn: () => {
      const queryData = Object.fromEntries(searchParams?.entries() || [])
      console.log(queryData)
      return integrateCRM(queryData)
    },
    onSuccess: (response) => {
      console.log('CRM integrated successfully:', response)
      toast.success('CRM integrated successfully!', { dismissible: true, duration: 2000 })
      refetch()
    },
    onError: (error: any) => {
      console.error('Error integrating CRM:', error)
      toast.error('Failed to integrate CRM. Please try again.')
    },
    mutationKey: ['integrations', searchParams?.toString()],
    retry: false,
  })

  useEffect(() => {
    if (callback) {
      if (didInitialise.current) {
        return
      }
      didInitialise.current = true
      mutation.mutate()
      setQuery(undefined!)
    }
  }, [callback, searchParams])

  return (
    <div className='flex h-full flex-col'>
      <h3 className='text-lg font-semibold'>Choose Integration Method</h3>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 my-4'>
        {!isLoading &&
          status?.data &&
          integrationsList.map((crm) => (
            <IntegrationCard crm={crm} key={crm.id} status={status.data} onRefetch={refetch} />
          ))}

        {isLoading && Array.from({ length: 5 }, (_, index) => <SkeletonCard key={index} />)}
      </div>

      {error && (
        <div className='mt-4 rounded-lg border border-red-200 bg-red-50 p-4'>
          <p className='text-red-800'>Failed to load integrations. Please refresh the page.</p>
        </div>
      )}
    </div>
  )
}

export default Integrations
