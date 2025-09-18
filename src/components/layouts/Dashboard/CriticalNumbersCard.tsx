import DataCard from '@/components/custom/DataCard'
import MetricCard from '@/components/custom/MetricCard'

interface ICriticalNumbers {
  coverage: ICriticalNumbersCoverage
  qualification: ICriticalNumbersQualification
  conversion: ICriticalNumbersConversion
}

interface ICriticalNumbersCoverage {
  total_leads: number
  enriched_leads: number
  enriched_percentage: number | string
}

interface ICriticalNumbersQualification {
  overall: number | string
  enriched: number | string
  profileFit: number | string
}

interface ICriticalNumbersConversion {
  overall: number | string
  enriched: number | string
  profileFit: number | string
}

export default function CriticalNumbersCard({
  criticalNumbers,
}: {
  criticalNumbers: ICriticalNumbers
}) {
  return (
    <DataCard cardName='Critical Numbers'>
      <div className='flex flex-col space-y-6'>
        <div className='flex flex-col space-y-2'>
          <h4 className='text-dm font-semibold text-secondary-foreground'>Coverage</h4>
          {(criticalNumbers.coverage.total_leads &&  criticalNumbers.coverage.enriched_leads && criticalNumbers.coverage.enriched_percentage) && (
            <div className='flex flex-row space-x-8'>
              <MetricCard
                iconPath='/money-bag.svg'
                iconBgColor='bg-[#FFFEDE]'
                label='Total Number of Leads'
                value={criticalNumbers.coverage.total_leads}
              />
              <MetricCard
                iconPath='/funnel-dollar.svg'
                iconBgColor='bg-[#E1FFD4]'
                label='Enriched Leads'
                value={criticalNumbers.coverage.enriched_leads}
              />
              <MetricCard
                iconPath='/thumbs-up.svg'
                iconBgColor='bg-[#DCF8FF]'
                label='Enrichment Percentage'
                value={criticalNumbers.coverage.enriched_percentage}
              />
            </div>
          )}
        </div>
        <div className='flex flex-col space-y-2'>
          <h4 className='text-dm font-semibold text-secondary-foreground'>Qualification</h4>
          <div className='flex flex-row space-x-8'>
            <MetricCard
              iconPath='/money-bag.svg'
              iconBgColor='bg-[#FFFEDE]'
              label='Overall Funnel'
              value={criticalNumbers.qualification.overall}
            />
            <MetricCard
              iconPath='/funnel-dollar.svg'
              iconBgColor='bg-[#E1FFD4]'
              label='Enriched Funnel'
              value={criticalNumbers.qualification.enriched}
            />
            <MetricCard
              iconPath='/thumbs-up.svg'
              iconBgColor='bg-[#DCF8FF]'
              label='Profile Fit Funnel'
              value={criticalNumbers.qualification.profileFit}
            />
          </div>
        </div>
        <div className='flex flex-col space-y-2'>
          <h4 className='text-dm font-semibold text-secondary-foreground'>Conversion</h4>
          <div className='flex flex-row space-x-8'>
            <MetricCard
              iconPath='/money-bag.svg'
              iconBgColor='bg-[#FFFEDE]'
              label='Overall Funnel'
              value={criticalNumbers.conversion.overall}
            />
            <MetricCard
              iconPath='/funnel-dollar.svg'
              iconBgColor='bg-[#E1FFD4]'
              label='Enriched Funnel'
              value={criticalNumbers.conversion.enriched}
            />
            <MetricCard
              iconPath='/thumbs-up.svg'
              iconBgColor='bg-[#DCF8FF]'
              label='Profile Fit Funnel'
              value={criticalNumbers.conversion.profileFit}
            />
          </div>
        </div>
      </div>
    </DataCard>
  )
}
