import { useIsFetching } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

export const Spinner = () => {
  return <Loader2 className='animate-spin text-primary' size={32} />
}

const HUDLoader = () => {
  return (
    <div className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm'>
      <Spinner />
      <div className='mt-2 text-lg font-semibold'>Loading...</div>
    </div>
  )
}

export const GlobalHUDLoader = () => {
  const isFetching = useIsFetching()
  return isFetching && <HUDLoader />
}

export default HUDLoader
