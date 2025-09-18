import { cn } from '@/lib/utils'
import useAuthStore from '@/store/auth'

const PlatformModeToggle = () => {
  const { marketingMode, toggleMarketingMode, showPlatformModeSelector, user } = useAuthStore()
  const tabStyles = 'rounded-full px-4 h-fit cursor-pointer'
  
  return (
    <div className='flex items-center space-x-2 rounded-full border bg-transparent p-1'>
      <div
        className={cn(
          !marketingMode
            ? 'bg-primary text-white'
            : showPlatformModeSelector
              ? 'bg-transparent text-primary'
              : 'bg-transparent text-gray-400',
          tabStyles
        )}
        onClick={showPlatformModeSelector ? () => toggleMarketingMode() : undefined}
      >
        Sales
      </div>
      <div
        className={cn(
          marketingMode
            ? 'bg-primary text-white'
            : showPlatformModeSelector
              ? 'bg-transparent text-primary'
              : 'bg-transparent text-gray-400',
          tabStyles
        )}
        onClick={showPlatformModeSelector ? () => toggleMarketingMode() : undefined}
      >
        Marketing
      </div>
    </div>
  )
}

export default PlatformModeToggle
