import { Skeleton } from '@/components/ui/skeleton'

const ContactSkeleton = () => {
  return (
    <div className='flex flex-col items-center justify-center rounded-lg bg-background p-6 text-sm shadow-md'>
      <Skeleton className='my-2 h-4 w-32' />
      <div className='flex w-full flex-col space-y-4'>
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton className='h-8 w-full' />
        ))}
      </div>
      <Skeleton className='mt-4 h-6 w-3/5' />
    </div>
  )
}

export default ContactSkeleton
