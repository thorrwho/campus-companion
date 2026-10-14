import React from 'react'
import { cn } from '@/lib/utils'

export interface ToggleFieldProps {
  id?: string
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  badge?: string
}

export const ToggleField: React.FC<ToggleFieldProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
  disabled,
  className,
  badge,
}) => {
  const generatedId = React.useId()
  const inputId = id || generatedId

  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 p-3.5 rounded-card border border-border bg-surface select-none transition-colors',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
    >
      <div className="space-y-0.5 flex-1 pr-2">
        <div className="flex items-center gap-2">
          <label
            htmlFor={inputId}
            className="text-body font-medium text-text-primary cursor-pointer"
          >
            {label}
          </label>
          {badge && (
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-accent-100 text-primary-700">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-caption text-text-secondary leading-normal">
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        id={inputId}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2',
          checked ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700',
          disabled && 'cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  )
}
