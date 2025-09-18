import { CheckCircleIcon, FrownIcon } from 'lucide-react'

interface ErrorCardProps {
  msg?: string
  clearForm?: () => void
}

interface SuccessCardProps {
  msg?: string
}

export const ErrorCard = ({ msg, clearForm }: ErrorCardProps) => {
  return (
    <div
      className='mx-auto my-4 flex h-[8vh] max-w-fit flex-col items-center justify-center gap-2 rounded-lg border-2 border-red-300 bg-red-100 p-4 shadow-md'
      role='alert'
    >
      <div className='flex items-center justify-center gap-2'>
        <FrownIcon className='h-6 w-6 text-red-400' />
        <span className='max-w-md text-center text-sm text-black'>
          {msg ?? 'Unable to process the request. Please try again.'}
        </span>
      </div>
    </div>
  )
}

export const SuccessCard = ({ msg }: SuccessCardProps) => {
  return (
    <div
      className='mx-auto my-4 flex h-[8vh] max-w-fit flex-col items-center justify-center gap-2 rounded-lg border-2 border-green-300 bg-green-100 p-4 shadow-md'
      role='alert'
    >
      <div className='flex items-center justify-center gap-2'>
        <CheckCircleIcon className='h-6 w-6 text-green-400' />
        <span className='max-w-md text-center text-sm text-black'>
          {msg ?? 'Lead call registered successfully.'}
        </span>
      </div>
    </div>
  )
}
