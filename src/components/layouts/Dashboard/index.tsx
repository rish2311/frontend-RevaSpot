import DataCard from '@/components/custom/DataCard'
import ExperienceChart from './ExperienceChart'
import LocationChart from './LocationChart'
import NetWorthChart from './NetWorthChart'
import SalaryRangeChart from './SalaryRangeChart'
import SeniorityLevelChart from './SeniorityLevelChart'

import FilterButton from '@/components/custom/FilterButton'
import { NoEnrichmentDataToShow } from '@/components/custom/NoData'
import { getDashboardDataMetrics, getDashboardDataCriticalNumbers, getSegments } from '@/services'
import { getHistory } from '@/services/lead'
import useAuthStore from '@/store/auth'
import { useQuery } from '@tanstack/react-query'
import { ErrorComponent } from '@tanstack/react-router'
import { useMemo, useState, useEffect } from 'react'
import { z } from 'zod'
import AgeGroupChart from './AgeGroupChart'
import CompanyTierChart from './CompanyTierChart'
import { useRouter } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import MetricCard from '@/components/custom/MetricCard'

const Dashboard = () => {
  const { clientState, user } = useAuthStore()
  const router = useRouter()
  useEffect(() => {
    if (user?.org_name === 'brigade') {
      router.navigate({ to: '/campaigns' })
    }
  }, [])

  if (!clientState.crm && !clientState.sheet) {
    return (
      <DataCard cardName='Enrichment Data'>
        <NoEnrichmentDataToShow />
      </DataCard>
    )
  }

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
      label: 'Selected Files',
      type: 'text',
      required: false,
      validation: z.array(z.string()).optional(),
      default: [],
    },
    {
      id: 'segments',
      label: 'Selected Segments',
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
    queryFn: () => getSegments(),
    refetchOnWindowFocus: false,
  })

  const {
    isPending: isCriticalNumbersPending,
    isError: isCriticalNumbersError,
    data: criticalNumbersData,
    error: criticalNumbersError,
  } = useQuery({
    queryKey: ['critical-numbers', filterConfig],
    queryFn: () =>
      getDashboardDataCriticalNumbers(
        filterConfig.dateRange.from,
        filterConfig.dateRange.to,
        filterConfig.files,
        filterConfig.segments
      ),
    refetchOnWindowFocus: false,
  })

  const {
    isPending: isMetricsPending,
    isError: isMetricsError,
    data: metricsData,
    error: metricsError,
  } = useQuery({
    queryKey: ['metrics', filterConfig],
    queryFn: () =>
      getDashboardDataMetrics(
        filterConfig.dateRange.from,
        filterConfig.dateRange.to,
        filterConfig.files,
        filterConfig.segments
      ),
    refetchOnWindowFocus: false,
  })

  const files = useMemo(() => {
    return data?.data?.map((item: any) => ({
      id: item.id,
      file_name: item.file_name,
    }))
  }, [data])

  const segments = useMemo(
    () =>
      segmentsData?.data?.map((item: any) => ({
        id: item._id,
        segment_name: item.name,
      })),
    [segmentsData]
  )

  const metrics = useMemo(() => {
    if (!metricsData || !metricsData.data || !metricsData.data.metrics) {
      return {}
    }
    return Object.fromEntries(
      Object.entries(metricsData.data.metrics).map(([key, value]) => [
        key,
        Object.entries(value as Record<string, number>).map(([subKey, subValue]) => ({
          key: subKey,
          data: subValue,
        })),
      ])
    )
  }, [metricsData])
  // Helper function for rendering loading spinner
  const renderSpinner = () => (
    <div className='flex h-full w-full items-center justify-center py-8'>
      <Loader2 className='h-8 w-8 animate-spin text-primary' />
    </div>
  )

  if (isError) return <ErrorComponent error={error} />
  if (segmentsError) return <ErrorComponent error={segmentsError} />
  if (isMetricsError) return <ErrorComponent error={metricsError} />

  return (
    <div className='flex flex-col space-y-6'>
      <div className='flex flex-row items-center justify-between px-2'>
        <h3 className='text-lg font-semibold'>Dashboard</h3>
        <FilterButton
          filterConfig={filterConfig}
          formFields={formFields}
          files={files}
          segments={segments}
          onSuccess={(config) => {
            setFilterConfig(config)
          }}
        />
      </div>

      {/* Critical Numbers Card */}
      <DataCard cardName='Critical Numbers'>
        {isCriticalNumbersPending ? (
          renderSpinner()
        ) : (
          <div className='flex flex-row space-x-8'>
            {criticalNumbersData.data.total_leads && (

              <MetricCard
                iconPath='/money-bag.svg'
                iconBgColor='bg-[#FFFEDE]'
                label='Total Number of Leads'
                value={criticalNumbersData.data.total_leads}
              />
            )}
            {criticalNumbersData.data.enriched_leads && (
              <MetricCard
                iconPath='/funnel-dollar.svg'
                iconBgColor='bg-[#E1FFD4]'
                label='Enriched Leads'
                value={criticalNumbersData.data.enriched_leads}
              />
            )}
            {criticalNumbersData.data.enriched_percentage && (

              <MetricCard
                iconPath='/thumbs-up.svg'
                iconBgColor='bg-[#DCF8FF]'
                label='Enriched Percentage'
                value={`${criticalNumbersData.data.enriched_percentage}%`}
              />
            )}

          </div>
        )}
      </DataCard>

      {/* Lead Distribution Card */}
      <DataCard cardName='Lead Distribution'>
        {isMetricsPending ? (
          renderSpinner()
        ) : Object.values(metrics).every((value) => Array.isArray(value) && value.length === 0) ? (
          <NoEnrichmentDataToShow />
        ) : (
          <div className='grid grid-cols-12 gap-4'>
            <div className='col-span-7'>
              <AgeGroupChart categoryData={metrics.age_range} />
            </div>
            <div className='col-span-5'>
              <CompanyTierChart categoryData={metrics.company_tier} />
            </div>
            <div className='col-span-6'>
              <LocationChart categoryData={metrics.location_type} />
            </div>
            <div className='col-span-6'>
              <SalaryRangeChart categoryData={metrics.salary_range} />
            </div>
            <div className='col-span-5'>
              <NetWorthChart categoryData={metrics.net_worth} />
            </div>
            <div className='col-span-7'>
              <SeniorityLevelChart categoryData={metrics.professional_level} />
            </div>
            <div className='col-span-12'>
              <ExperienceChart categoryData={metrics.experience_range} />
            </div>
          </div>
        )}
      </DataCard>
    </div>
  )
}

export default Dashboard
