import { getCampaignMetrics } from '@/services/campaigns'
import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import CampaignLeads from './CampaignLeads'
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  LabelList,
  Tooltip,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
const CampaignView = () => {
  const { campaignId } = useParams({ from: '/campaigns/$campaignId/' })
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['campaign-metrics', campaignId],
    queryFn: () => getCampaignMetrics(campaignId),
    refetchInterval: 500
  })

  if (isLoading) return <div>Loading metrics...</div>
  const data = metrics?.data

  const statusChartData = data?.status_wise_count
    ? Object.entries(data.status_wise_count).map(([status, count]) => ({
      status: status.replace(/_/g, ' '),
      count: count,
    }))
    : []

  const chartConfig = {
    leads: {
      label: 'Leads',
      color: '#8884d8',
    },
  }

  return (
    <div className='space-y-6 p-6'>
      <h2 className='mb-6 text-3xl font-bold'>Campaign Performance</h2>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-lg'>Unique Connects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{metrics.data?.unique_connects || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-lg'>Total Connects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{metrics.data?.total_connects || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-lg'>Total Call Time</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const totalSeconds = metrics.data?.total_call_time || 0;
              const hours = Math.floor(totalSeconds / 3600);
              const minutes = Math.floor((totalSeconds % 3600) / 60);
              const seconds = totalSeconds % 60;

              if (hours > 0) {
                return <p className='text-3xl font-bold'>{hours}h {minutes}m {seconds}s</p>;
              } else if (minutes > 0) {
                return <p className='text-3xl font-bold'>{minutes}m {seconds}s</p>;
              } else {
                return <p className='text-3xl font-bold'>{seconds}s</p>;
              }
            })()}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-lg'>Average Call Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{metrics.data?.average_call_duration || 0}s</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-lg'>Qualified Percentage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{metrics.data?.qualified_percentage || 0}%</p>
          </CardContent>
        </Card>

        {/* New Metrics */}
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-lg'>Total Dials</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{metrics.data?.dials || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-lg'>Unique Dials</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{metrics.data?.unique_dials || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-lg'>Churn cycle</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{metrics.data?.churn_cycle || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-lg'>Total Connects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{metrics.data?.total_connects || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-lg'>Qualified Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{metrics.data?.qualified_leads || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-lg'>Connect Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{metrics.data?.connect_rate || 0}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-lg'>Unique Connect Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-3xl font-bold'>{metrics.data?.unique_connect_rate || 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Status Breakdown</CardTitle>
          <CardDescription>Distribution of leads by current status</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer height={250}>
            <ChartContainer config={chartConfig}>
              <BarChart
                data={statusChartData}
                layout='vertical'
                height={10}
                margin={{ left: 0, right: 100, top: 10, bottom: 10 }}
              >
                <CartesianGrid vertical={false} horizontal={false} />
                <XAxis type='number' hide width={20} />
                <YAxis
                  dataKey='status'
                  type='category'
                  className='max-w-fit capitalize'
                  tickLine={false}
                  axisLine={false}
                  height={100}
                  width={200}
                />
                <Tooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey='count' fill='hsl(var(--accent-foreground))' radius={8}>
                  <LabelList
                    dataKey='count'
                    position='right'
                    offset={2}
                    fontSize={12}
                    className='fill-foreground font-semibold capitalize'
                  />
                  {statusChartData.map((_, index) => (
                    <Cell key={index} fill={`hsl(${200 + index * 20}, 70%, 50%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <CampaignLeads total_leads={data?.total_leads} status={statusChartData} />
    </div>
  )
}

export default CampaignView
