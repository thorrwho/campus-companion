import React from 'react'
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import { useToastStore } from '@/store/useToastStore'
import { ToastType } from '@/types'
import { cn } from '@/lib/utils'

export const ToastContainer: React.FC = () => {
  const { toasts, dismiss } = useToastStore()

  if (toasts.length === 0) return null

  const iconMap: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-status-success shrink-0" aria-hidden="true" />,
    warning: <AlertTriangle className="w-5 h-5 text-status-warning shrink-0" aria-hidden="true" />,
    error: <AlertCircle className="w-5 h-5 text-status-error shrink-0" aria-hidden="true" />,
    info: <Info className="w-5 h-5 text-status-info shrink-0" aria-hidden="true" />,
  }

  const borderMap: Record<ToastType, string> = {
    success: 'border-status-success/30 bg-surface',
    warning: 'border-status-warning/30 bg-surface',
    error: 'border-status-error/30 bg-surface',
    info: 'border-status-info/30 bg-surface',
  }

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={cn(
            'pointer-events-auto flex items-start gap-3 p-3.5 rounded-card border shadow-overlay transition-all duration-180',
            borderMap[toast.type]
          )}
        >
          {iconMap[toast.type]}
          <div className="flex-1 text-small text-text-primary leading-snug pt-0.5">
            {toast.message}
          </div>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss notification"
            className="p-1 -mr-1 text-text-muted hover:text-text-primary rounded-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  )
}
