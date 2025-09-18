import ErrorComponent from '@/components/custom/ErrorComponent'
import FilterButton from '@/components/custom/FilterButton'
import HUDLoader from '@/components/custom/HUDLoader'
import { VirtualizedDataTable } from '@/components/custom/VirtualisedDataTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatNumber } from '@/lib/utils'
import { getOrigaCampaignAnalysis, getOrigaContacts } from '@/services'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { AccessorKeyColumnDef, PaginationState } from '@tanstack/react-table'
import { Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { z } from 'zod'

interface ContactData {
  lead_id: string
  lead_name: string
  lead_phone: string
  status: string
  created_at: string
  updated_at: string
  call_recording: string
  transcript: string
  report_data: Record<string, any>
}

const columns: AccessorKeyColumnDef<ContactData>[] = [
  {
    accessorKey: 'lead_id',
    header: 'Lead ID',
    cell: (info) => {
      const value = info.getValue()
      return <div>{value ? `${String(value).slice(0, 6)}...` : 'N/A'}</div>
    },
  },
  { accessorKey: 'lead_name', header: 'Name', cell: (info) => info.getValue() || 'N/A' },
  { accessorKey: 'lead_phone', header: 'Phone', cell: (info) => info.getValue() || 'N/A' },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: (info) => info.getValue() || 'N/A',
  },
  {
    accessorKey: 'updated_at',
    header: 'Updated At',
    cell: (info) => info.getValue() || 'N/A',
  },
  { accessorKey: 'status', header: 'Status', cell: (info) => info.getValue() || 'N/A' },
  {
    accessorKey: 'call_recording',
    header: 'Recording',
    cell: (info) => {
      const url = info.getValue() as string
      return url ? (
        <Button
          variant='outline'
          size='sm'
          onClick={() => {
            // Create a temporary anchor element to download the file
            const a = document.createElement('a')
            a.href = url
            a.download = `recording-${Date.now()}.wav`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
          }}
        >
          <Download className='mr-1 h-4 w-4' /> Download
        </Button>
      ) : (
        'N/A'
      )
    },
  },
  {
    accessorKey: 'transcript',
    header: 'Transcript',
    cell: (info) => {
      const transcript = info.getValue() as string
      if (!transcript) return 'N/A'

      const truncated = transcript.length > 20 ? transcript.substring(0, 20) + '...' : transcript

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='max-w-[200px] cursor-help truncate'>{truncated}</div>
            </TooltipTrigger>
            <TooltipContent side='bottom' className='max-w-md'>
              <div className='max-h-60 overflow-auto whitespace-pre-wrap rounded p-2 text-xs'>
                {transcript}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: 'report_data',
    header: 'Report Data',
    cell: (info) => {
      const reportData = info.getValue() as Record<string, any>
      if (!reportData) return 'N/A'

      const stringified = JSON.stringify(reportData)
      const truncated = stringified.length > 20 ? stringified.substring(0, 20) + '...' : stringified

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='max-w-[200px] cursor-help truncate'>{truncated}</div>
            </TooltipTrigger>
            <TooltipContent side='bottom' className='max-w-md'>
              <pre className='max-h-60 overflow-auto rounded p-2 text-xs'>
                {JSON.stringify(reportData, null, 2)}
              </pre>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
]

const formFields = [
  {
    id: 'dateRange',
    label: 'Date Range',
    type: 'date',
    required: false,
    validation: z
      .object({
        from: z.date().optional(),
        to: z.date().optional(),
      })
      .optional(),
    default: { from: undefined, to: undefined },
  },
]

interface CampaignAnalysisData {
  total_dials: number
  total_leads: number
  leads_dialed_at_least_once: number
  avg_dials_per_lead: number
  total_connects: number
  unique_connects: number
  total_talk_time: number
  avg_talk_time_per_connect: number
  avg_talk_time_per_unique_lead: number
  leads_qualified: number
  leads_unqualified: number
  leads_requested_callback: number
  leads_not_determined: number
  leads_qualified_percentage: number
}

interface StatItemProps {
  label: string
  value: string | number
  formatter?: (value: number) => string
}

const StatItem = ({ label, value, formatter }: StatItemProps) => {
  const displayValue = typeof value === 'number' && formatter ? formatter(value) : value

  return (
    <div className='space-y-1'>
      <p className='text-sm text-muted-foreground'>{label}</p>
      <p className='text-xl font-semibold'>{displayValue}</p>
    </div>
  )
}

const CampaignAnalysis = ({ campaignId }: { campaignId: string }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['campaign-analysis', campaignId],
    queryFn: () => getOrigaCampaignAnalysis({ campaign_id: campaignId }),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  })

  const analysisData = data?.data as CampaignAnalysisData | undefined

  if (isLoading) return <div>Loading analysis...</div>
  if (isError) return <div>Error loading campaign analysis</div>
  if (!analysisData) return <div>No analysis data available</div>

  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle>Campaign Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
          <StatItem label='Total Dials' value={analysisData.total_dials} formatter={formatNumber} />
          <StatItem label='Total Leads' value={analysisData.total_leads} formatter={formatNumber} />
          <StatItem
            label='Leads Dialed'
            value={analysisData.leads_dialed_at_least_once}
            formatter={formatNumber}
          />
          <StatItem
            label='Avg. Dials Per Lead'
            value={analysisData.avg_dials_per_lead.toFixed(2)}
          />
          <StatItem
            label='Total Connects'
            value={analysisData.total_connects}
            formatter={formatNumber}
          />
          <StatItem
            label='Unique Connects'
            value={analysisData.unique_connects}
            formatter={formatNumber}
          />
          <StatItem label='Total Talk Time (seconds)' value={analysisData.total_talk_time} />
          <StatItem
            label='Avg. Talk Time Per Connect (seconds)'
            value={analysisData.avg_talk_time_per_connect}
          />
          <StatItem
            label='Qualified Leads'
            value={`${formatNumber(analysisData.leads_qualified)} (${analysisData.leads_qualified_percentage.toFixed(2)}%)`}
          />
          <StatItem
            label='Unqualified Leads'
            value={analysisData.leads_unqualified}
            formatter={formatNumber}
          />
          <StatItem
            label='Requested Callback'
            value={analysisData.leads_requested_callback}
            formatter={formatNumber}
          />
          <StatItem
            label='Not Determined'
            value={analysisData.leads_not_determined}
            formatter={formatNumber}
          />
        </div>
      </CardContent>
    </Card>
  )
}

const CampaignDetails = () => {
  const params = useParams({ from: '/ai_calling/$campaignId/' })
  const [filterConfig, setFilterConfig] = useState<any>({})
  const [contactsFilter, setContactsFilter] = useState({
    params: { ...filterConfig, campaign_id: params.campaignId },
    offset: 0,
  })

  const paginationState: PaginationState = {
    pageIndex: contactsFilter?.offset ?? 0,
    pageSize: 10,
  }

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['contacts', contactsFilter],
    queryFn: () =>
      getOrigaContacts(contactsFilter.params, paginationState.pageSize, contactsFilter.offset),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  })

  const contacts = useMemo(() => data?.data || [], [data])

  if (isPending) return <HUDLoader />
  if (isError) return <ErrorComponent error={error} />

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex flex-row items-center justify-between px-2'>
        <h3 className='py-4 text-lg font-semibold'>Campaign Contacts</h3>
        <FilterButton
          filterConfig={filterConfig}
          formFields={formFields}
          onSuccess={(config) => {
            setFilterConfig(config)
            setContactsFilter({
              params: { ...config, campaign_id: params.campaignId },
              offset: 0,
            })
          }}
          onReset={() => {
            setFilterConfig({})
            setContactsFilter({
              params: { campaign_id: params.campaignId },
              offset: 0,
            })
          }}
        />
      </div>
      <CampaignAnalysis campaignId={params.campaignId} />
      <VirtualizedDataTable
        columns={columns}
        data={contacts}
        pagination={paginationState}
        rowCount={contacts.length || 0}
        onPaginationChange={(pagination) => {
          const newPagination =
            typeof pagination === 'function' ? pagination(paginationState) : pagination
          setContactsFilter((prevFilter) => ({
            ...prevFilter,
            ...newPagination,
            offset: (newPagination.pageIndex ?? 0) * (newPagination.pageSize ?? 50),
          }))
        }}
      />
    </div>
  )
}

export default CampaignDetails
