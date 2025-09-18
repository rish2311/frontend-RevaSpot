import ErrorComponent from '@/components/custom/ErrorComponent'
import HUDLoader from '@/components/custom/HUDLoader'
import { getHistory, getLeads, getSegments, LeadsFilter } from '@/services'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AccessorKeyColumnDef, PaginationState } from '@tanstack/react-table'

import FilterButton from '@/components/custom/FilterButton'
import ShowHideColumnsButton from '@/components/custom/ShowHideColumnsButton'
import { VirtualizedDataTable } from '@/components/custom/VirtualisedDataTable'
import { convertUTCToLocal, formatNumber } from '@/lib/utils'
import useAuthStore from '@/store/auth'
import { useLocation, useRouteContext } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import ExportLeadsButton from './ExportLeadsButton'

interface LeadData {
  lead_id: string
  lead_created_at: string
  name: string
  lead_stage: string
  revspot_stage_group: string
  segments: string[]
  age_range: string
  location_type: string
  company_tier: string
  salary_range: string
  net_worth: string
  professional_level: string
  years_of_experience: string
}

import {
  Building,
  Globe,
  MapPin,
  Star,
  Award,
  Badge,
  User,
  Shield,
  Layers,
  Target,
  ChevronDown,
} from 'lucide-react'
import { Popover } from '@/components/ui/popover'
import { PopoverContent, PopoverTrigger } from '@radix-ui/react-popover'

let columns: AccessorKeyColumnDef<LeadData>[] = [
  {
    accessorKey: 'lead_id',
    header: 'Lead ID',
    cell: (info) => {
      const value = info.getValue()
      return <div>{value ? `${String(value).slice(0, 6)}...` : 'N/A'}</div>
    },
  },
  {
    accessorKey: 'lead_created_at',
    header: 'Lead Created At',
    cell: (info) => {
      const value = info.getValue()
      if (!value) return 'N/A'
      const dateTime = convertUTCToLocal(value as string)
      const date = new Date(dateTime)
      return (
        <div>
          {`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`}
        </div>
      )
    },
  },
  { accessorKey: 'lead_stage', header: 'Lead Stage', cell: (info) => info.getValue() || 'N/A' },
  {
    accessorKey: 'revspot_stage_group',
    header: 'Revspot Stage Group',
    cell: (info) => info.getValue() || 'N/A',
  },
  {
    accessorKey: 'segments',
    header: 'Segments',
    cell: (info) => {
      const value = String(info.getValue() || '')
      if (!value) return 'N/A'

      const segments = value.split(',').map((segment) => segment.trim())
      const [isOpen, setIsOpen] = useState(false)

      return (
        <Popover>
          <div className='flex items-center gap-2'>
            <span className='rounded bg-blue-100 px-2 py-1 text-sm text-blue-700'>
              {segments[0]}
            </span>
            {segments.length > 1 && (
              <PopoverTrigger
                onClick={() => setIsOpen(!isOpen)}
                className='text-sm text-blue-500 hover:underline'
              >
                +{segments.length - 1}
              </PopoverTrigger>
            )}
          </div>

          <PopoverContent className='flex gap-2 rounded-md border-2 bg-white p-2'>
            {segments.map((segment, index) => (
              <span key={index} className='rounded bg-blue-100 px-2 py-1 text-sm text-blue-700'>
                {segment}
              </span>
            ))}
          </PopoverContent>
        </Popover>
      )
    },
  },
  { accessorKey: 'age_range', header: 'Age Range', cell: (info) => info.getValue() || 'N/A' },
  {
    accessorKey: 'location_type',
    header: 'Location Type',
    cell: (info) => {
      const value = info.getValue()
      if (!value) return 'N/A'
      switch (value) {
        case 'india_metro':
          return (
            <div className='flex items-center gap-1'>
              <Building size={16} /> India Metro
            </div>
          )
        case 'international':
          return (
            <div className='flex items-center gap-1'>
              <Globe size={16} /> International
            </div>
          )
        case 'other':
          return (
            <div className='flex items-center gap-1'>
              <MapPin size={16} /> Other
            </div>
          )
        default:
          return 'N/A'
      }
    },
  },
  {
    accessorKey: 'company_tier',
    header: 'Company Tier',
    cell: (info) => {
      const value = info.getValue()
      if (!value) return 'N/A'
      switch (value) {
        case 'tier1':
          return (
            <div className='flex items-center gap-1'>
              <Star size={16} className='text-green-500' /> Tier 1
            </div>
          )
        case 'tier2':
          return (
            <div className='flex items-center gap-1'>
              <Award size={16} className='text-orange-500' /> Tier 2
            </div>
          )
        case 'tier3':
          return (
            <div className='flex items-center gap-1'>
              <Badge size={16} className='text-red-500' /> Tier 3
            </div>
          )
        default:
          return 'N/A'
      }
    },
  },
  {
    accessorKey: 'salary_range',
    header: 'Salary Range (lpa)',
    cell: (info) => {
      const value = String(info.getValue() || '')
      return (
        <div>{value ? (value.endsWith('lpa') ? value.slice(0, -3).trim() : value) : 'N/A'}</div>
      )
    },
  },
  { accessorKey: 'net_worth', header: 'Net Worth', cell: (info) => info.getValue() || 'N/A' },
  {
    accessorKey: 'professional_level',
    header: 'Professional Level',
    cell: (info) => {
      const value = String(info.getValue() || '')
      if (!value) return 'N/A'
      let colorClass = ''
      let icon: React.ReactNode = <User size={16} />

      switch (value.toLowerCase()) {
        case 'executive':
          colorClass = 'text-green-500'
          icon = <Shield size={16} />
          break
        case 'management':
          colorClass = 'text-pink-500'
          icon = <Layers size={16} />
          break
        case 'senior':
          colorClass = 'text-purple-500'
          icon = <Target size={16} />
          break
        default:
          colorClass = 'text-gray-500'
      }

      return (
        <div className={`flex items-center gap-1 ${colorClass}`}>
          {icon} {value}
        </div>
      )
    },
  },
  {
    accessorKey: 'years_of_experience',
    header: 'Experience (years)',
    cell: (info) => {
      const value = String(info.getValue() || '')
      return (
        <div>{value ? (value.endsWith('years') ? value.slice(0, -5).trim() : value) : 'N/A'}</div>
      )
    },
  },
]

let formFields: CustomFormField[] = [
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
  {
    id: 'files',
    label: 'Files',
    type: 'text',
    required: false,
    validation: z.array(z.string()).optional(),
    default: [],
  },
  {
    id: 'segments',
    label: 'Segments',
    type: 'text',
    required: false,
    validation: z.array(z.string()).optional(),
    default: [],
  },
  {
    id: 'lead_stage',
    label: 'Lead Stage',
    type: 'text',
    required: false,
    validation: z.array(z.string()).optional(),
    default: [],
  },
  {
    id: 'revspot_stage_group',
    label: 'Revspot Stage Group',
    type: 'text',
    required: false,
    validation: z.array(z.string()).optional(),
    default: [],
  },
  {
    id: 'age_range',
    label: 'Age Range',
    type: 'text',
    required: false,
    validation: z.array(z.string()).optional(),
    default: [],
  },
  {
    id: 'location_type',
    label: 'Location Type',
    type: 'text',
    required: false,
    validation: z.array(z.string()).optional(),
    default: [],
  },
  {
    id: 'company_tier',
    label: 'Company Tier',
    type: 'text',
    required: false,
    validation: z.array(z.string()).optional(),
    default: [],
  },
  {
    id: 'salary_range',
    label: 'Salary Range',
    type: 'text',
    required: false,
    validation: z.array(z.string()).optional(),
    default: [],
  },
  {
    id: 'net_worth',
    label: 'Net Worth',
    type: 'text',
    required: false,
    validation: z.array(z.string()).optional(),
    default: [],
  },
  {
    id: 'professional_level',
    label: 'Professional Level',
    type: 'text',
    required: false,
    validation: z.array(z.string()).optional(),
    default: [],
  },
  {
    id: 'years_of_experience',
    label: 'Years of Experience',
    type: 'text',
    required: false,
    validation: z.array(z.string()).optional(),
    default: [],
  },
]

const formFieldOptions: Record<string, string[]> = {
  lead_stage: ['Lead', 'Prospect', 'Sale', 'Qualified', 'Disqualified', 'Follow Up'],
  revspot_stage_group: ['Sales', 'Pre Sales', 'True Prospect', 'Converted'],
  age_range: [
    '17 and younger',
    '18-24 years',
    '25-34 years',
    '35-44 years',
    '45-54 years',
    '55-64 years',
    '65 and older',
  ],
  company_tier: ['tier1', 'tier2', 'tier3', 'tier4'],
  location_type: [
    'india_metro',
    'other',
    'international',
    'meragi_current_city',
    'meragi_new_city',
  ],
  salary_range: [
    '1-5 lpa',
    '5-10 lpa',
    '10-20 lpa',
    '20-30 lpa',
    '30-50 lpa',
    '50-100 lpa',
    '100+ lpa',
  ],
  net_worth: ['1 crore to 2 crore', '2 crore to 5 crore', '5 crore and above'],
  professional_level: ['Junior', 'Senior', 'Management', 'Executive', 'Other'],
  years_of_experience: [
    '0-1 years',
    '1-2 years',
    '2-3 years',
    '3-4 years',
    '4-5 years',
    '5-6 years',
    '6-7 years',
    '7-8 years',
    '8-9 years',
    '9-10 years',
    '10-11 years',
  ],
}

const Leads = () => {
  const { clientState } = useAuthStore()
  const queryFilter = useLocation({ select: (location) => location.state.data || {} })
  const authState = useRouteContext({ from: '__root__', select: ({ auth }) => auth })

  useEffect(() => {
    if (!clientState.crm) {
      const col_ids = ['lead_stage', 'revspot_stage_group']
      formFields = formFields.filter((field) => !col_ids.includes(field.id))
      columns = columns.filter((column) => !col_ids.includes(column.accessorKey))
    }
    if (authState.user?.org_name !== 'meragi') {
      formFieldOptions.location_type = formFieldOptions.location_type.filter(
        (location) => location !== 'meragi_current_city' && location !== 'meragi_new_city'
      )
    }
  }, [])

  const [filterConfig, setFilterConfig] = useState<any>(queryFilter)
  const [leadsTableFilter, setLeadsTableFilter] = useState<LeadsFilter>({
    params: filterConfig,
    offset: 0,
  })
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    Object.fromEntries(
      formFields
        .filter((field) => field.id !== 'dateRange' && field.id !== 'files')
        .map((field) => [field.id, true])
    )
  )

  const paginationState: PaginationState = {
    pageIndex: leadsTableFilter?.pageIndex ?? 0,
    pageSize: leadsTableFilter?.pageSize ?? 10,
  }

  const { data: filesData, error: fileHistoryError } = useQuery({
    queryKey: ['history', 'Enrichment'],
    queryFn: () => getHistory(),
    refetchOnWindowFocus: false,
  })
  const {
    isPending: isSegmentsPending,
    data: segmentsData,
    error: segmentsError,
  } = useQuery({
    queryKey: ['segments'],
    queryFn: getSegments,
    refetchOnWindowFocus: false,
  })
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['leads', leadsTableFilter],
    queryFn: () => getLeads(leadsTableFilter),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  })

  const files = useMemo(
    () =>
      filesData?.data?.map((item: any) => ({
        id: item.id,
        file_name: item.file_name,
      })) || [],
    [filesData]
  )

  const segments = useMemo(
    () =>
      segmentsData?.data?.map((item: any) => ({
        id: item._id,
        segment_name: item.name,
      })) || [],
    [segmentsData]
  )

  const segmentIdToNameMap = useMemo(
    () =>
      segmentsData?.data?.reduce((acc: Record<string, string>, item: any) => {
        acc[item._id] = item.name
        return acc
      }, {}) || {},
    [segmentsData]
  )

  const leadsWithSegmentNames = useMemo(() => {
    console.log('segmentIdToNameMap:', segmentIdToNameMap)
    console.log('Raw leads data:', data?.data?.leads?.[0]?.segments)
    return (
      data?.data?.leads?.map((lead: LeadData) => ({
        ...lead,
        segments: lead.segments
          .filter((segmentId: string) => segmentIdToNameMap[segmentId])
          .map((segmentId: string) => segmentIdToNameMap[segmentId])
          .join(', '),
      })) || []
    )
  }, [data, segmentIdToNameMap])

  console.log(leadsWithSegmentNames)
  if (isPending || isSegmentsPending) return <HUDLoader />
  if (fileHistoryError) return <ErrorComponent error={fileHistoryError} />
  if (segmentsError) return <ErrorComponent error={segmentsError} />
  if (isError) return <ErrorComponent error={error} />

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex flex-row items-center justify-between px-2'>
        <div className='flex items-center gap-x-2'>
          <h3 className='py-4 text-lg font-semibold'>
            Leads ({formatNumber(data.data?.total_count)})
          </h3>
          <ExportLeadsButton leadsFilter={leadsTableFilter} />
        </div>
        <div className='flex gap-x-2'>
          <ShowHideColumnsButton
            columns={formFields
              .filter((field) => field.id !== 'dateRange' && field.id !== 'files')
              .map((field) => ({ id: field.id, label: field.label }))}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
          />
          <FilterButton
            segments={segments}
            files={files}
            filterConfig={filterConfig}
            formFields={formFields}
            formFieldOptions={formFieldOptions}
            onSuccess={(config) => {
              setFilterConfig(config)
              setLeadsTableFilter({ params: config, offset: 0 })
            }}
            onReset={() => {
              setFilterConfig({})
              setLeadsTableFilter({ params: {}, offset: 0 })
            }}
          />
        </div>
      </div>
      <VirtualizedDataTable
        columns={columns}
        data={leadsWithSegmentNames}
        pagination={paginationState}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        rowCount={data.data.total_count}
        onPaginationChange={(pagination) => {
          const newPagination =
            typeof pagination === 'function' ? pagination(paginationState) : pagination
          setLeadsTableFilter((prevFilter) => ({
            ...prevFilter,
            ...newPagination,
            offset: (newPagination.pageIndex ?? 0) * (newPagination.pageSize ?? 50),
          }))
        }}
      />
    </div>
  )
}

export default Leads
