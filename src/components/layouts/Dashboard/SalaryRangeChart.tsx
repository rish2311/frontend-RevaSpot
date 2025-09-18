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
import { generateBlues } from '@/lib/colorSchemes'
import { BaseChartDataShape } from 'reaviz'

const SalaryRangeChart = ({ categoryData }: { categoryData: BaseChartDataShape<number>[] }) => {
  const totalLeads = categoryData.reduce((sum, item) => sum + item.data, 0)

  return (
    <ChartCard cardName='Salary Range in INR/Lakh' totalLeads={totalLeads}>
      <ResponsiveContainer height={200}>
        <ChartContainer
          config={{
            data: { label: 'Count' },
          }}
        >
          <BarChart
            accessibilityLayer
            data={categoryData}
            margin={{ left: -20, right: 20, top: 0, bottom: 0 }}
            layout='vertical'
            {...{
              overflow: 'visible',
            }}
          >
            <CartesianGrid vertical={false} horizontal={false} />
            <XAxis dataKey={'data'} type='number' hide />
            <YAxis dataKey={'key'} type='category' tickLine={false} axisLine={false} width={80} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey='data' fill='hsl(var(--accent-foreground))' radius={8}>
              <LabelList
                position='right'
                offset={4}
                fontSize={12}
                className='fill-foreground font-semibold'
              />
              {categoryData.map((entry, index) => (
                <Cell key={index} fill={generateBlues(index)} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export default SalaryRangeChart
