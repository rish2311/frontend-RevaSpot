import { AlertCircle, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorCardProps {
  msg?: string
  clearForm?: () => void
  onRetry?: () => void
  variant?: 'error' | 'warning' | 'info'
}

const ErrorCard = ({ 
  msg, 
  clearForm, 
  onRetry, 
  variant = 'error' 
}: ErrorCardProps) => {
  const variants = {
    error: {
      containerClass: 'border-red-200 bg-red-50',
      iconClass: 'text-red-500',
      textClass: 'text-red-800',
      buttonClass: 'text-red-600 hover:text-red-800'
    },
    warning: {
      containerClass: 'border-amber-200 bg-amber-50',
      iconClass: 'text-amber-500',
      textClass: 'text-amber-800',
      buttonClass: 'text-amber-600 hover:text-amber-800'
    },
    info: {
      containerClass: 'border-blue-200 bg-blue-50',
      iconClass: 'text-blue-500',
      textClass: 'text-blue-800',
      buttonClass: 'text-blue-600 hover:text-blue-800'
    }
  }

  const currentVariant = variants[variant]

  return (
    <div
      className={`
        relative mx-auto my-6 max-w-md rounded-lg border 
        ${currentVariant.containerClass} 
        p-6 shadow-sm transition-all duration-200 hover:shadow-md
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Close button */}
      {clearForm && (
        <button
          onClick={clearForm}
          className={`
            absolute right-3 top-3 rounded-full p-1 transition-colors
            ${currentVariant.buttonClass}
            hover:bg-white/50
          `}
          aria-label="Close error message"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <AlertCircle className={`h-5 w-5 ${currentVariant.iconClass}`} />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          <p className={`text-sm leading-relaxed ${currentVariant.textClass}`}>
            {msg ?? 'Unable to process the request. Please try again.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ErrorCard
