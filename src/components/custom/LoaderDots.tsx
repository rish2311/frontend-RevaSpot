import * as React from 'react'

interface ILoaderDotsProps {}

const LoaderDots: React.FunctionComponent<ILoaderDotsProps> = (props) => {
  return (
    <div className='flex items-center justify-center space-x-2 dark:invert'>
      <span className='sr-only'>Loading...</span>
      <div className='h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.3s]'></div>
      <div className='h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]'></div>
      <div className='h-2 w-2 animate-bounce rounded-full bg-slate-500'></div>
    </div>
  )
}

export default LoaderDots
