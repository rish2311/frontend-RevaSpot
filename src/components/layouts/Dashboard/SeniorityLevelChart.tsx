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

import ChartCard from '@/components/custom/ChartCard'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { generateOranges } from '@/lib/colorSchemes'
import { BaseChartDataShape } from 'reaviz'

const SeniorityLevel = ({ categoryData }: { categoryData: BaseChartDataShape<number>[] }) => {
  const totalLeads = categoryData.reduce((sum, item) => sum + item.data, 0)

  return (
    <ChartCard cardName='Seniority Level' totalLeads={totalLeads}>
      <ResponsiveContainer height={200}>
        <ChartContainer
          config={{
            data: { label: 'Count' },
          }}
        >
          <BarChart
            accessibilityLayer
            data={categoryData}
            margin={{ top: 20 }}
            {...{
              overflow: 'visible',
            }}
          >
            <CartesianGrid vertical={false} horizontal={false} />
            <YAxis dataKey={'data'} hide />
            <XAxis dataKey={'key'} tickLine={false} tickMargin={4} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey='data' fill='hsl(var(--accent-foreground))' radius={8}>
              <LabelList
                position='top'
                offset={8}
                fontSize={12}
                className='fill-foreground font-semibold'
              />
              {categoryData.map((entry, index) => (
                <Cell key={index} fill={generateOranges(index)} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export default SeniorityLevel
