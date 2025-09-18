import DataCard from '@/components/custom/DataCard'
import MetricCard from '@/components/custom/MetricCard'

interface ICriticalNumbers {
  total_leads?: number
  enriched_leads?: number
  segment_leads?: number
  coverage?: number | string
}

export default function CriticalNumbersCard({
  criticalNumbers,
  extraComponent,
}: {
  criticalNumbers: ICriticalNumbers
  extraComponent?: React.ReactNode
}) {
  return (
    <DataCard cardName='Critical Numbers' extraComponent={extraComponent}>
      <div className='flex flex-row space-x-8'>
        <MetricCard
          iconPath='/money-bag.svg'
          iconBgColor='bg-[#FFFEDE]'
          label='Total Number of Leads'
          value={criticalNumbers.total_leads}
        />
        <MetricCard
          iconPath='/funnel-dollar.svg'
          iconBgColor='bg-[#E1FFD4]'
          label='Enriched Leads'
          value={criticalNumbers.enriched_leads}
        />
        <MetricCard
          iconPath='/exclamation-mark.svg'
          iconBgColor='bg-[#FFF3F3]'
          label='Segment Leads'
          value={criticalNumbers.segment_leads}
        />
        <MetricCard
          iconPath='/thumbs-up.svg'
          iconBgColor='bg-[#DCF8FF]'
          label='Coverage Percentage'
          value={criticalNumbers.coverage ? `${criticalNumbers.coverage}%` : '----'}
        />
      </div>
    </DataCard>
  )
}
