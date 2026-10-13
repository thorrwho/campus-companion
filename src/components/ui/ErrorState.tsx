import React from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/utils'

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an unexpected error while loading this content. Please try again.',
  onRetry,
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'w-full p-8 sm:p-12 rounded-card bg-surface border border-status-error/30 text-center flex flex-col items-center justify-center my-4',
        className
      )}
    >
      <div className="w-14 h-14 rounded-modal bg-status-error-bg text-status-error flex items-center justify-center mb-4 shrink-0 shadow-card">
        <AlertCircle className="w-7 h-7" aria-hidden="true" />
      </div>

      <h3 className="text-h3 font-semibold text-text-primary mb-1.5">{title}</h3>
      <p className="text-small text-text-secondary max-w-sm mb-6 leading-normal">
        {message}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          size="md"
          onClick={onRetry}
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          Try Again
        </Button>
      )}
    </div>
  )
}
