import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { generateBlues } from '@/lib/colorSchemes'

export interface IFunnelData {
  stage: string
  count: number
  percentage: number
}

const FunnelMinichart = ({
  chartHeading,
  data,
  colorGenerator = generateBlues,
}: {
  chartHeading: string
  data: IFunnelData[]
  colorGenerator?: (index: number) => string
}) => {
  return (
    <ResponsiveContainer height={200}>
      <ChartContainer
        config={{
          data: { label: 'Count' },
        }}
      >
        <BarChart
          accessibilityLayer
          data={data}
          margin={{ left: -20, right: 20, top: 0, bottom: 0 }}
          layout='vertical'
          {...{
            overflow: 'visible',
          }}
        >
          <CartesianGrid vertical={false} horizontal={false} />
          <XAxis dataKey={'count'} type='number' hide />
          <YAxis dataKey={'stage'} type='category' tickLine={false} axisLine={false} width={80} />
          <ChartTooltip
            cursor={false}
            content={({ payload }) => {
              if (payload && payload.length) {
                const { stage, percentage } = payload[0].payload
                const color = colorGenerator(data.findIndex((d) => d.stage === stage))
                return (
                  <div className='flex items-center rounded-lg border bg-background px-2 py-1 shadow-sm'>
                    <span className='mr-2 h-2 w-2' style={{ backgroundColor: color }}></span>
                    <p className='flex flex-row gap-x-4'>
                      <span className='text-secondary-foreground'>{stage}</span>
                      <span className='text-foreground'>{percentage}%</span>
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey='count' fill='hsl(var(--accent-foreground))' radius={8}>
            <LabelList
              position='right'
              offset={4}
              fontSize={12}
              className='fill-foreground font-semibold'
            />
            {data.map((entry, index) => (
              <Cell key={index} fill={colorGenerator(index)} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </ResponsiveContainer>
  )
}

export default FunnelMinichart
