import { useNavigate } from '@tanstack/react-router'
import { PrimaryButton } from './Buttons'

export const NoDataToShow = () => {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-y-4 rounded-2xl bg-background py-4 text-secondary-foreground'>
      <img src='/nodata.svg' alt='No data to show' className='h-48' />
      <p>No data to show</p>
    </div>
  )
}

export const NoEnrichmentDataToShow = () => {
  const navigate = useNavigate()

  const handleGetStartedClick = () => {
    navigate({ to: '/enrichment', search: { type: 'bulk' } })
  }

  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-y-4 rounded-2xl bg-background py-4 text-secondary-foreground'>
      <img src='/emptyDocs.svg' alt='No data to show' />
      <p>No data to show</p>
      <p>Upload a sheet to get started</p>
      <PrimaryButton onClick={handleGetStartedClick}>Get Started</PrimaryButton>
    </div>
  )
}

export const NoEnrichmentHistoryToShow = () => {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-y-4 rounded-2xl bg-background py-8 text-secondary-foreground'>
      <img src='/emptyDocs.svg' alt='No data to show' className='h-24' />
      <p>No bulk list has been enriched yet</p>
      <p>Upload a file to get started</p>
    </div>
  )
}
