import ChartCard from '@/components/custom/ChartCard'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { generateOranges } from '@/lib/colorSchemes'
import { BaseChartDataShape } from 'reaviz'

const CompanyTierChart = ({ categoryData }: { categoryData: BaseChartDataShape<number>[] }) => {
  const totalLeads = categoryData.reduce((sum, item) => sum + item.data, 0)
  const pieConfig = categoryData.reduce(
    (acc, { key }) => {
      if (typeof key === 'string') {
        acc[key] = { label: key }
      }
      return acc
    },
    {} as Record<string, { label: string }>
  )

  return (
    <ChartCard cardName='Company Tier' totalLeads={totalLeads}>
      <ResponsiveContainer height={200}>
        <ChartContainer
          config={{
            ...pieConfig,
          }}
          className='[&_.recharts-pie-label-text]:fill-foreground'
        >
          <PieChart
            accessibilityLayer
            data={categoryData}
            margin={{ top: 0, bottom: 0 }}
            {...{
              overflow: 'visible',
            }}
          >
            <ChartTooltip content={<ChartTooltipContent nameKey='data' hideLabel />} />
            <Pie
              data={categoryData}
              dataKey='data'
              nameKey={'key'}
              label
              labelLine
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
            >
              {categoryData.map((entry, index) => (
                <Cell key={index} fill={generateOranges(index)} />
              ))}
            </Pie>
            <ChartLegend
              layout='vertical'
              align='left'
              verticalAlign='middle'
              content={<ChartLegendContent nameKey='key' />}
              className='flex flex-col justify-start gap-y-4 [&>*]:basis-1/4 [&>*]:justify-start'
            />
          </PieChart>
        </ChartContainer>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export default CompanyTierChart
