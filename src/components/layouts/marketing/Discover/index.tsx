import { getFilters, queryDiscover } from '@/services/discover'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { Spinner } from '@/components/custom/HUDLoader'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/custom/MultiSelectDiscover'
import { DiscoverQuery, EmptyValue } from '@/types'
import { SaveAudiencePopover } from './AudiencePopover'
import useAuthStore from '@/store/auth'
import { useRouter } from '@tanstack/react-router'

export type Option = {
  label: string
  value: string
}

export type Filter = {
  category: string
  subcategory: string
  name: string
  label: string
  options?: Option[]
  type: 'static' | 'dynamic'
  fetch_url: string
  operator: 'not_in' | 'in'
  empty_value: 'include' | 'exclude'
}

export type FiltersResponse = {
  filters: Filter[]
}

const Discover: React.FC = () => {
  const {user} = useAuthStore()
  const router = useRouter()
  useEffect(()=>{
    if(user?.org_name === 'brigade') {
      router.navigate({to: "/campaigns"})
    }
  }, [])
  const { data: filtersData, isFetching } = useQuery<FiltersResponse>({
    queryKey: ['filters'],
    queryFn: getFilters,
  })

  const [groupedFilters, setGroupedFilters] = useState<Record<string, Record<string, Filter[]>>>({})
  const [selectedFilters, setSelectedFilters] = useState<Filter[]>([])
  const [filterQuery, setFilterQuery] = useState<DiscoverQuery | null>(null)
  const [discoverEnabled, setDiscoverEnabled] = useState(false)
  const { data: discoverResults, isFetching: isFetchingAudience } = useQuery({
    queryKey: ['discoverResults', filterQuery],
    queryFn: () => queryDiscover(filterQuery!),
    enabled: discoverEnabled,
  })

  const queryClient = useQueryClient()

  useEffect(() => {
    if (
      filterQuery === null ||
      Object.values(filterQuery).some((filter: any) => filter.values.length === 0)
    ) {
      setDiscoverEnabled(false)
      queryClient.setQueryData(['discoverResults'], null)
    } else {
      setDiscoverEnabled(true)
    }
  }, [filterQuery])

  useEffect(() => {
    if (filtersData?.filters) {
      const extendedFilters: Filter[] = filtersData.filters.map((filter) => ({
        ...filter,
        options: filter.type === 'dynamic' ? undefined : filter.options,
        fetch_url: filter.type === 'dynamic' ? filter.fetch_url : '',
        operator: 'in' as const,
        empty_value: 'include' as const,
      }))

      const nestedFilters = extendedFilters.reduce(
        (acc: Record<string, Record<string, Filter[]>>, filter) => {
          if (!acc[filter.category]) {
            acc[filter.category] = {}
          }
          if (!acc[filter.category][filter.subcategory]) {
            acc[filter.category][filter.subcategory] = []
          }
          acc[filter.category][filter.subcategory].push(filter)
          return acc
        },
        {}
      )
      setGroupedFilters(nestedFilters)
    }
  }, [filtersData])

  const handleFilterSelect = (filter: Filter) => {
    setSelectedFilters((prev) => [...prev, filter])
    setFilterQuery((prev: any) => ({
      ...prev,
      [filter.name]: {
        values: [],
        label: filter.label,
        operator: filter.operator,
        empty_value: filter.empty_value,
      },
    }))
  }

  const formatNumber = (num: number) => {
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return num;
};

  return (
    <div className='flex gap-8'>
      {isFetching ? (
        <Spinner />
      ) : (
        <Card className='h-fit w-full basis-1/4 border-none'>
          <CardHeader>
            <CardTitle className='mb-2 text-xl font-semibold'>Filters</CardTitle>
            <CardDescription>Your applied filters will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type='multiple' className='w-full border-none'>
              {Object.entries(groupedFilters).map(([category, subCategories]) => (
                <AccordionItem
                  key={`category-${category}`}
                  value={`category-${category}`}
                  className='border-none px-4'
                >
                  <AccordionTrigger>
                    <Label className='text-md font-medium'>{category}</Label>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Accordion type='multiple' className='ml-4 w-full'>
                      {Object.entries(subCategories).map(([subcategory, filters]) => (
                        <AccordionItem
                          key={`subcategory-${subcategory}`}
                          value={`subcategory-${subcategory}`}
                          className='px-4'
                        >
                          <AccordionTrigger>
                            <Label className='text-md font-medium'>{subcategory}</Label>
                          </AccordionTrigger>
                          <AccordionContent>
                            <CardContent className='ml-2'>
                              {filters.map((filter) => (
                                <p
                                  key={filter.label}
                                  className='m-2 cursor-pointer text-sm'
                                  onClick={() => handleFilterSelect(filter)}
                                >
                                  {filter.label}
                                </p>
                              ))}
                            </CardContent>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      <section className='basis-1/3'>
        <Card className='border-none'>
          <CardHeader>
            <CardTitle>Selected Filters</CardTitle>
            <CardDescription>Your applied filters will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedFilters.map((filter, index) => (
              <MultiSelect
                key={`${filter.name}-${index}`}
                filter={filter}
                query={filterQuery}
                setQuery={setFilterQuery}
                onValueChange={(values) => {
                  setFilterQuery((prev: any) => ({
                    ...prev,
                    [filter.name]: {
                      ...prev[filter.name],
                      values,
                    },
                  }))
                }}
                onRemove={() => {
                  setSelectedFilters((prev) => {
                    const updatedFilters = prev.filter((_, i) => i !== index)

                    if (updatedFilters.length === 0) {
                      setFilterQuery(null)
                    } else {
                      setFilterQuery((prev: any) => {
                        const newQuery = { ...prev }
                        delete newQuery[filter.name]
                        return newQuery
                      })
                    }

                    return updatedFilters
                  })
                }}

              />
            ))}
          </CardContent>
        </Card>
      </section>

      <section className='basis-1/3'>
        <Card className='border-none'>
          <CardHeader>
            <CardTitle>
              Results{' '}
              {discoverResults?.stats ? `• ${formatNumber(discoverResults.stats.count)} Profiles found` : ''}
            </CardTitle>
            <CardDescription>Your results will appear here</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-2'>
{discoverEnabled && discoverResults?.sample_data && (
            <SaveAudiencePopover filterQuery={filterQuery} targetSize={discoverResults.stats.count} />
          )}            {
              isFetchingAudience && <Spinner />
            }
            {discoverEnabled && discoverResults?.sample_data !== undefined &&
              discoverResults?.sample_data?.length <= 0 ? (
              <Card className='border-none shadow-none'>
                <CardHeader>
                  <CardTitle>No Profiles found :(</CardTitle>
                </CardHeader>
              </Card>
            ) : (
              discoverResults?.sample_data.map((profile: any) => (
                <Card>
                  <CardHeader>
                    <CardTitle>{profile.name}</CardTitle>
                    <CardDescription>
                      {profile.company} • {profile.role_title}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default Discover
