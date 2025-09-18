import DataCard from '@/components/custom/DataCard'
import { NoDataToShow } from '@/components/custom/NoData'
import {
  FunnelArc,
  FunnelAxis,
  FunnelAxisLabel,
  FunnelAxisLine,
  FunnelChart,
  FunnelSeries,
} from 'reaviz'

interface IFunnel {
  totalProcessedLeads: number
  totalLeadsEnriched: number
  revspotQualityLeads: number
}

const FunnelCard = ({
  funnel,
  extraComponent,
}: {
  funnel?: IFunnel
  extraComponent?: React.ReactNode
}) => {
  const funnelData = [
    { key: 'Total Processed Leads', data: funnel?.totalProcessedLeads ?? 0 },
    { key: 'Total Leads Enriched', data: funnel?.totalLeadsEnriched ?? 0 },
    { key: 'Profile Fit Leads', data: funnel?.revspotQualityLeads ?? 0 },
  ]

  return (
    <DataCard cardName='Funnel' extraComponent={extraComponent}>
      {funnel ? (
        <FunnelChart
          className='rounded-2xl border border-secondary'
          data={funnelData}
          height={400}
          margins={16}
          series={
            <FunnelSeries
              arc={
                <FunnelArc
                  variant='layered'
                  gradient={null}
                  colorScheme={['#8ABAFF', '#5D9AF2', '#3079E3']}
                />
              }
              axis={
                <FunnelAxis
                  line={<FunnelAxisLine strokeColor={'hsl(var(--background))'} strokeWidth={4} />}
                  label={
                    <FunnelAxisLabel
                      position='bottom'
                      fill={'hsl(var(--foreground))'}
                      fontFamily='Inter'
                    />
                  }
                />
              }
            />
          }
        />
      ) : (
        <div className='rounded-2xl border border-secondary'>
          <NoDataToShow />
        </div>
      )}
    </DataCard>
  )
}

export default FunnelCard
