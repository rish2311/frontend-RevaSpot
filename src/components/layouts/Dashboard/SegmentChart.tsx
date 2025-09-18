import DataCard from '@/components/custom/DataCard'
import { NoDataToShow } from '@/components/custom/NoData'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'

const chartConfig = {
  processed_leads: {
    label: 'Pre Sales',
    color: '#3079E3',
  },
  enriched_leads: {
    label: 'Sales',
    color: '#FFDDC0',
  },
  rql_leads: {
    label: 'True Prospect',
    color: '#6BD0E8',
  },
  converted_leads: {
    label: 'Converted',
    color: '#EA974F',
  },
} satisfies ChartConfig

const SegmentChart = ({
  segments,
  extraComponent,
}: {
  segments?: any[]
  extraComponent?: React.ReactNode
}) => {
  return (
    <DataCard cardName='Week-on-week performance' extraComponent={extraComponent}>
      <div className='grid grid-cols-12 gap-4'>
        {segments ? (
          <>
            <div className='col-span-9'>
              <ResponsiveContainer
                height={400}
                className={'rounded-2xl border border-secondary p-4'}
              >
                <ChartContainer config={chartConfig}>
                  <BarChart
                    accessibilityLayer
                    data={segments}
                    margin={{ left: 0 }}
                    {...{
                      overflow: 'visible',
                    }}
                  >
                    <CartesianGrid vertical={false} horizontal={false} />
                    <XAxis dataKey='date' tickLine={false} tickMargin={10} />
                    <YAxis
                      label={{
                        value: 'Leads',
                        angle: 0,
                        position: 'outsideLeft',
                      }}
                      tickLine={false}
                      tick={false}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator='dashed' />}
                    />
                    <Bar dataKey='processed_leads' fill={'#3079E3'} radius={100} />
                    <Bar dataKey='enriched_leads' fill={'#FFDDC0'} radius={100} />
                    <Bar dataKey='rql_leads' fill={'#6BD0E8'} radius={100} />
                    <Bar dataKey='converted_leads' fill={'#EA974F'} radius={100} />
                  </BarChart>
                </ChartContainer>
              </ResponsiveContainer>
            </div>
            <div className='col-span-3'>
              <div className='mx-4 rounded-2xl border border-secondary p-4'>
                {Object.entries(chartConfig).map(([key, val]) => {
                  const total = segments.reduce((acc, segment) => acc + (segment[key] || 0), 0)
                  return (
                    <div key={key} className='mt-2 flex items-center space-x-2'>
                      <div
                        className={`h-4 w-4 rounded-md`}
                        style={{ backgroundColor: val.color }}
                      ></div>
                      <span>{`${val.label} (${total})`}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        ) : (
          <div className='col-span-12 rounded-2xl border border-secondary'>
            <NoDataToShow />
          </div>
        )}
      </div>
    </DataCard>
  )
}

export default SegmentChart
