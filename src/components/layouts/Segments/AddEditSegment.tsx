import DataCard from '@/components/custom/DataCard'
import { useLocation, useNavigate, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { ClearButton, PrimaryButton } from '@/components/custom/Buttons'
import ErrorComponent from '@/components/custom/ErrorComponent'
import FilterBuilder from '@/components/custom/FilterBuilder'
import HUDLoader from '@/components/custom/HUDLoader'
import InputField from '@/components/custom/InputField'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { generateBlues, generateMixed, generateOranges } from '@/lib/colorSchemes'
import { getFunnelData } from '@/services/metrics'
import { getCriticalNumbersForFilter, upsertSegment } from '@/services/segment'
import useAuthStore from '@/store/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { formatQuery, RuleGroupType } from 'react-querybuilder'
import { parseMongoDB } from 'react-querybuilder/parseMongoDB'
import { z } from 'zod'
import CriticalNumbersCard from './CriticalNumbersCard'
import { fields } from './filterFields'
import FilterForm from './FilterForm'
import FunnelMinichart, { IFunnelData } from './FunnelMinichart'

const filterFormFields: CustomFormField[] = [
  {
    id: 'age_range',
    label: 'Age Range',
    type: 'text',
    required: false,
    validation: z.array(z.string()).optional(),
    default: [],
  },
  {
    id: 'gender',
    label: 'Gender',
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
    id: 'employed',
    label: 'Employed',
    type: 'text',
    required: false,
    validation: z.string().optional(),
    default: '',
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
    id: 'experience_range',
    label: 'Experience Range',
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
    id: 'worked_abroad',
    label: 'Worked Abroad',
    type: 'text',
    required: false,
    validation: z.string().optional(),
    default: '',
  },
  {
    id: 'university_tier',
    label: 'University Tier',
    type: 'text',
    required: false,
    validation: z.array(z.string()).optional(),
    default: [],
  },
  {
    id: 'iit_iim',
    label: 'IIT/IIM',
    type: 'text',
    required: false,
    validation: z.string().optional(),
    default: '',
  },
  {
    id: 'mba',
    label: 'MBA',
    type: 'text',
    required: false,
    validation: z.string().optional(),
    default: '',
  },
  {
    id: 'studied_abroad',
    label: 'Studied Abroad',
    type: 'text',
    required: false,
    validation: z.string().optional(),
    default: '',
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
]

const filterFormFieldOptions: Record<string, string[]> = {
  age_range: [
    '17 and younger',
    '18-24 years',
    '25-34 years',
    '35-44 years',
    '45-54 years',
    '55-64 years',
    '65 and older',
  ],
  gender: ['M', 'F'],
  location_type: ['india_metro', 'international', 'other'],
  employed: ['TRUE', 'FALSE'],
  professional_level: ['Junior', 'Senior', 'Management', 'Executive', 'Other'],
  experience_range: ['0-2 years', '3-5 years', '6-10 years', '11-20 years', '20+ years'],
  company_tier: ['tier1', 'tier2', 'tier3', 'tier4'],
  worked_abroad: ['TRUE', 'FALSE'],
  university_tier: ['tier1', 'tier2', 'tier3'],
  iit_iim: ['TRUE', 'FALSE'],
  mba: ['TRUE', 'FALSE'],
  studied_abroad: ['TRUE', 'FALSE'],
  salary_range: [
    '1-5 lpa',
    '5-10 lpa',
    '10-20 lpa',
    '20-30 lpa',
    '30-50 lpa',
    '50-100 lpa',
    '100+ lpa',
  ],
  net_worth: [
    'less than 50 lakhs',
    '50 lakhs to 1 crore',
    '1 crore to 2 crore',
    '2 crore to 5 crore',
    '5 crore and above',
  ],
}

interface SegmentDataInterface {
  _id: string;
  name: string;
  filter: {
    derived_variables: {
      age_range: {
        $in: string[];
      };
    };
  };
  created_at: string;
  updated_at: string;
  client: string;
  total_leads: number;
  enriched_leads: number;
  segment_leads: number;
  coverage: number;
}

const AddEditSegment = () => {
  const router = useRouter()
  const navigate = useNavigate()
  const { clientState } = useAuthStore()

  const segmentData = useLocation({
    select: (location) => {
      const data = location.state.data || {}
      return data
      // TODO: Remove this if using boolean values in filter
      // const filterData = data?.filter || {}
      // return {
      //   ...data,
      //   filter: Object.fromEntries(
      //     Object.entries(filterData).map(([key, value]) => [
      //       key,
      //       value === true ? 'TRUE' : value === false ? 'FALSE' : value,
      //     ])
      //   ),
      // }
    },
  })
  //@ts-ignore
  const [filterConfig, setFilterConfig] = useState<any>(segmentData?.filter ?? {})

  const {
    data: funnelData,
    isPending: isFunnelPending,
    error: funnelError,
  } = useQuery({
    //@ts-ignore
    queryKey: ['funnel', segmentData?._id, filterConfig],
    queryFn: () =>
      getFunnelData(
        undefined,
        undefined,
        undefined,
        //@ts-ignore
        segmentData?._id ? [segmentData?._id] : undefined,
        filterConfig
      ),
    refetchOnWindowFocus: false,
//@ts-ignore
    enabled: !!clientState.crm && (!!segmentData?._id || Object.keys(filterConfig).length > 0),
  })

  const defaultQuery = () => ({ combinator: 'and', rules: [] })
  const [query, setQuery] = useState<RuleGroupType>(
//@ts-ignore
    segmentData?.filter ? parseMongoDB(segmentData.filter, { listsAsArrays: true }) : defaultQuery()
  )

  const mutation = useMutation({
//@ts-ignore
    mutationFn: (newSegmentData: any) => upsertSegment(newSegmentData, segmentData?._id),
    onSuccess: (response_data) => {
      console.log('Segment upserted successfully', response_data.data)
      navigate({ to: '/segments' })
    },
    onError: (error) => {
      console.error('Error upserting segment:', error)
    },
  })

  const { data, error, isError } = useQuery({
    queryKey: ['critical_numbers', filterConfig],
    queryFn: () => getCriticalNumbersForFilter(filterConfig),
    refetchOnWindowFocus: false,
    initialData: segmentData,
//@ts-ignore
    enabled: !!segmentData?._id || Object.keys(filterConfig).length > 0,
  })

  const formFields: CustomFormField[] = [
    {
      id: 'name',
      label: 'Segment Name',
      validation: z.string().min(1, 'Segment name is required'),
//@ts-ignore
      default: segmentData?.name || '',
      required: true,
    },
  ]

  const schema = z.object(
    Object.fromEntries(formFields.map((field) => [field.id, field.validation]))
  )

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: Object.fromEntries(
      formFields.map((formField) => [formField.id, formField.default])
    ),
  })

  const onSubmit = async (data: z.infer<typeof schema>) => {
    console.log('Form submitted:', { ...data, filter: filterConfig })
    mutation.mutate({ ...data, filter: filterConfig })
  }

  const onCancel = () => {
    router.history.back()
  }

  const handleFilterApply = () => {
    const segmentFilter = JSON.parse(formatQuery(query, 'mongodb'))
    console.log('Filter applied:', segmentFilter)
    setFilterConfig(segmentFilter)
  }

  const handleFilterReset = () => {
    setQuery(defaultQuery())
    setFilterConfig({})
  }

  if (mutation.isPending) return <HUDLoader />
  if (mutation.isError) return <ErrorComponent error={mutation.error} />
  if (isError) return <ErrorComponent error={error} />

  return (
    <div className='flex flex-col space-y-4'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-row items-center justify-between space-x-2'
        >
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem className='flex w-full flex-row items-center'>
                <FormLabel
                  className={`h-full min-w-[10vw] font-medium text-secondary-foreground after:ml-1 after:text-red-500 after:content-["*"]`}
                >
                  Segment Name
                </FormLabel>
                <FormControl>
                  <Input
                    type={'text'}
                    placeholder={'Type Here'}
                    className='m-0 border-none bg-background'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='flex flex-row items-center space-x-2'>
            <ClearButton onClick={onCancel} type='button'>
              Cancel
            </ClearButton>
            <PrimaryButton type='submit'>{
              //@ts-ignore
              segmentData?._id ? 'Update' : 'Create'}</PrimaryButton>
          </div>
        </form>
      </Form>
      <DataCard cardName='Segment Filter'>
        <Accordion
          type='single'
          collapsible
          defaultValue='filterBuilder'
          className='rounded-2xl border-none border-secondary px-2'
        >
          <AccordionItem value='filterBuilder'>
            <AccordionTrigger>Filter Builder</AccordionTrigger>
            <AccordionContent className='flex flex-col gap-y-2'>
              <FilterBuilder query={query} setQuery={setQuery} fields={fields} />
              <div className='flex flex-row items-center justify-end space-x-2'>
                <ClearButton onClick={handleFilterReset}>Clear</ClearButton>
                <PrimaryButton onClick={handleFilterApply}>Apply</PrimaryButton>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        {data?.data && (
          <CriticalNumbersCard
            criticalNumbers={{
              total_leads: data?.data?.total_leads,
              enriched_leads: data?.data?.enriched_leads,
              segment_leads: data?.data?.segment_leads,
              coverage: data?.data?.coverage,
            }}
          />
        )}
        {clientState.crm && funnelData?.data && (
          <Card className='mt-4 rounded-2xl border border-secondary shadow-none'>
            <CardContent>
              <div className='flex w-full flex-row space-x-8'>
                {Object.entries(funnelData?.data).map(([key, funnel]) => (
                  <div className='flex w-full flex-col' key={key}>
                    <p className='py-2 text-sm font-semibold'>{key}</p>
                    <FunnelMinichart
                      key={key}
                      chartHeading={key}
                      colorGenerator={
                        key === 'Processed Leads'
                          ? generateMixed
                          : key === 'Profiled Leads' || key === 'Enriched Leads'
                            ? generateOranges
                            : generateBlues
                      }
                      data={funnel as IFunnelData[]}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </DataCard>
    </div>
  )

  return (
    <div className='grid grid-cols-12 gap-4'>
      <div className='col-span-7 overflow-y-auto'>
        <DataCard
          cardName='Segment Filter'
        // extraComponent={<Button variant={'ghost'}>Reset All</Button>}
        >
          <FilterForm
            filterConfig={filterConfig}
            formFields={filterFormFields}
            formFieldOptions={filterFormFieldOptions}
            onSuccess={(config) => {
              setFilterConfig(config)
            }}
            onReset={() => {
              setFilterConfig({})
            }}
          />
        </DataCard>
      </div>
      <div className='col-span-5 overflow-y-auto px-0.5'>
        <h3 className='text-lg font-semibold'>Segment Details</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 py-4'>
            <InputField formControl={form.control} formField={formFields[0]} />
            {/* TODO: Show leads & critical numbers based on these filters */}
            {/* <FormDescription>
              <span className='before:mr-1 before:text-red-500 before:content-["*"]'>
                Segment name is required.
              </span>
            </FormDescription> */}
            <div className='flex justify-end gap-4'>
              <ClearButton onClick={onCancel} type='button'>
                Cancel
              </ClearButton>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default AddEditSegment
