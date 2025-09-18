import { Loader2Icon } from 'lucide-react'

const InProgressCard = () => {
  return (
    <div className='flex items-center justify-center rounded-lg bg-success-background p-4 shadow-md'>
      <Loader2Icon className='h-6 w-6 animate-spin text-success' />
      <span className='ml-2 text-success'>Request under process. Please wait</span>
    </div>
  )
}

export default InProgressCard
