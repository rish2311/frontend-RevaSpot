import { XCircle, FrownIcon, XIcon, Clock9 } from 'lucide-react'

interface PendingCardProps {
  msg?: string
}

const PendingCard = ({ msg}: PendingCardProps) => {
  return (
    <div
      className='mx-auto flex my-4 h-[8vh] max-w-fit flex-col items-center justify-center gap-2 rounded-lg border-2 border-red-300 bg-green-100 p-4 shadow-md'
      role='alert'
    >
      <div className='flex items-center justify-center gap-2'>
        <Clock9 className='h-6 w-6 text-green-400'/>
        <span className='text-sm max-w-md text-center text-black'>
          {msg ?? 'We are working on your request. please try later'}
        </span>
      </div>
    </div>
  )
}

export default PendingCard
