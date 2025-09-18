import { OutlineButton } from '@/components/custom/Buttons'
import DataCard from '@/components/custom/DataCard'
import ErrorComponent from '@/components/custom/ErrorComponent'
import FilterButton from '@/components/custom/FilterButton'
import HUDLoader from '@/components/custom/HUDLoader'
import { Card, CardContent } from '@/components/ui/card'
import { generateBlues, generateMixed, generateOranges } from '@/lib/colorSchemes'
import { pascalCase } from '@/lib/utils'
import { getFunnelData, getHistory, getSegmentData, getWeekOnWeekPerformance } from '@/services'
import useAuthStore from '@/store/auth'
import { useQuery } from '@tanstack/react-query'
import { useLocation, useNavigate, useRouter } from '@tanstack/react-router'
import { ArrowLeftIcon, PencilIcon, UserRoundSearchIcon } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import CriticalNumbersCard from './CriticalNumbersCard'
import FunnelMinichart, { IFunnelData } from './FunnelMinichart'
import SegmentBreakdownCard from './SegmentBreakdownCard'

const DEFAULT_FILTER = {
  dateRange: {
    from: undefined,
    to: undefined,
  },
  files: [],
}

const SegmentView = () => {
  const navigate = useNavigate()
  const router = useRouter()
  const stateData = useLocation({ select: (location) => location.state || {} })
  const { clientState } = useAuthStore()

  const formFields: CustomFormField[] = [
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
  ]
  const [filterConfig, setFilterConfig] = useState(
    Object.fromEntries(formFields.map((formField) => [formField.id, formField.default]))
  )

  const { isPending, isError, data, error } = useQuery({
    queryKey: ['segments', stateData.data._id, filterConfig],
    queryFn: () => getSegmentData(stateData.data._id, filterConfig),
    refetchOnWindowFocus: false,
    // refetchOnMount: false,
    // refetchOnReconnect: false,
    initialData: stateData,
    enabled: filterConfig != DEFAULT_FILTER,
  })

  const { data: filesData, error: fileHistoryError } = useQuery({
    queryKey: ['history', 'Enrichment'],
    queryFn: () => getHistory(),
    refetchOnWindowFocus: false,
  })

  const { data: weekOnWeekPerformance, error: weekOnWeekPerformanceError } = useQuery({
    queryKey: ['weekOnWeekPerformance', stateData.data._id, filterConfig],
    queryFn: () =>
      getWeekOnWeekPerformance(
        filterConfig?.dateRange?.from,
        filterConfig?.dateRange?.to,
        filterConfig?.files,
        [stateData.data._id]
      ),
    refetchOnWindowFocus: false,
    enabled: !!clientState.crm,
  })

  // Profile Fit: '675fdc4b48ddfb1730b077c0'
  const { data: funnelData, error: funnelError } = useQuery({
    queryKey: ['funnel', stateData.data._id, filterConfig],
    queryFn: () =>
      getFunnelData(
        filterConfig?.dateRange?.from,
        filterConfig?.dateRange?.to,
        filterConfig?.files,
        [stateData.data._id]
      ),
    refetchOnWindowFocus: false,
    enabled: !!clientState.crm,
  })

  if (isPending) return <HUDLoader />
  if (isError) return <ErrorComponent error={error} />
  if (fileHistoryError) return <ErrorComponent error={fileHistoryError} />
  if (funnelError) return <ErrorComponent error={funnelError} />
  if (weekOnWeekPerformanceError) return <ErrorComponent error={weekOnWeekPerformanceError} />

  const files = filesData?.data?.map((item: any) => ({
    id: item.id,
    file_name: item.file_name,
  }))

  const renderFilter = (filter: any = {}) => {
    return Object.entries(filter).map(([key, value]: [string, any]) => {
      if (key === '$or' || key === '$and') {
        return (
          <div key={key} className='ml-4'>
            <span className='block text-sm text-secondary-foreground underline'>
              {key.replace(/^\$/, '').toUpperCase()}
            </span>
            {value.map((subFilter: any, index: number) => (
              <div key={index} className='ml-4'>
                {renderFilter(subFilter)}
              </div>
            ))}
          </div>
        )
      } else {
        const displayKey = key.startsWith('derived_variables.')
          ? pascalCase(key.replace('derived_variables.', ''))
          : pascalCase(key)

        let displayValue
        if (typeof value === 'object' && value !== null) {
          const [operator, val] = Object.entries(value)[0]
          displayValue = Array.isArray(val)
            ? val.map((v) => pascalCase(v)).join(', ')
            : pascalCase(val as string)
        } else if (typeof value === 'boolean') {
          displayValue = value ? 'TRUE' : 'FALSE'
        } else {
          displayValue = value as string
        }

        return (
          <div key={key} className='ml-4'>
            <span className='block text-sm text-secondary-foreground'>{displayKey}</span>
            <span className='block text-lg font-medium text-foreground'>
              {/* {operator?.toUpperCase()} */}
              {displayValue}
            </span>
          </div>
        )
      }
    })
  }

  return (
    <div className='flex flex-col space-y-6'>
      <div className='flex justify-between'>
        <div className='flex items-center space-x-2'>
          <ArrowLeftIcon
            onClick={() => router.history.back()}
            className='hover:text-primary hover:underline'
          />
          <h3 className='text-lg font-semibold'>{data.data.name}</h3>
        </div>
        <FilterButton
          filterConfig={filterConfig}
          formFields={formFields}
          files={files}
          onSuccess={(config) => {
            setFilterConfig(config)
          }}
        />
      </div>
      <DataCard
        cardName='Definition'
        extraComponent={
          <OutlineButton
            onClick={() => {
              navigate({
                to: `/segments/update`,
                state: { data: data.data },
              })
            }}
          >
            <PencilIcon />
            Edit
          </OutlineButton>
        }
      >
        <div className='grid grid-cols-4 gap-4 p-2'>{renderFilter(data?.data?.filter)}</div>
      </DataCard>
      <CriticalNumbersCard
        criticalNumbers={{
          total_leads: data.data.total_leads,
          enriched_leads: data.data.enriched_leads,
          segment_leads: data.data.segment_leads,
          coverage: data.data.coverage,
        }}
        extraComponent={
          <OutlineButton
            onClick={() => {
              navigate({
                to: '/leads',
                state: { data: { ...filterConfig, segments: [data.data._id] } },
              })
            }}
          >
            <UserRoundSearchIcon /> Explore leads
          </OutlineButton>
        }
      />
      {funnelData?.data && (
        <DataCard cardName='Funnel'>
          <Card className='rounded-2xl border border-secondary shadow-none'>
            <CardContent>
              <div className='flex w-full flex-row space-x-8'>
                {Object.entries(funnelData?.data).map(([key, funnel]) => (
                  <div className='flex w-full flex-col' key={key}>
                    <p className='py-2 text-sm font-semibold'>{key}</p>
                    <FunnelMinichart
                      chartHeading={key}
                      data={funnel as IFunnelData[]}
                      key={key}
                      colorGenerator={
                        key === 'Processed Leads'
                          ? generateMixed
                          : key === 'Profiled Leads' || key === 'Enriched Leads'
                            ? generateOranges
                            : generateBlues
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </DataCard>
      )}
      {weekOnWeekPerformance?.data && (
        <SegmentBreakdownCard segments={weekOnWeekPerformance.data} />
      )}
    </div>
  )
}

export default SegmentView
