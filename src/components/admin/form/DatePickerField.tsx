import React from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { cn } from '@/lib/utils'

export interface DatePickerFieldProps {
  id?: string
  label?: string
  value: string // Format: YYYY-MM-DD
  onChange: (val: string) => void
  minDate?: string
  maxDate?: string
  helperText?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
  showPresets?: boolean
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  id,
  label,
  value,
  onChange,
  minDate,
  maxDate,
  helperText,
  error,
  required,
  disabled,
  className,
  showPresets = true,
}) => {
  const generatedId = React.useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`

  const isInvalid = Boolean(error)

  const handlePreset = (daysOffset: number) => {
    if (disabled) return
    const targetDate = addDays(new Date(), daysOffset)
    onChange(format(targetDate, 'yyyy-MM-dd'))
  }

  return (
    <div className={cn('w-full space-y-1.5 text-left', className)}>
      <div className="flex items-center justify-between">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-caption font-medium text-text-primary"
          >
            {label}
            {required && <span className="text-status-error ml-1">*</span>}
          </label>
        )}

        {showPresets && !disabled && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handlePreset(0)}
              className="text-[11px] text-primary-600 hover:text-primary-700 bg-accent-50 dark:bg-accent-950/40 px-1.5 py-0.5 rounded border border-primary-200 dark:border-primary-800"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handlePreset(1)}
              className="text-[11px] text-primary-600 hover:text-primary-700 bg-accent-50 dark:bg-accent-950/40 px-1.5 py-0.5 rounded border border-primary-200 dark:border-primary-800"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handlePreset(7)}
              className="text-[11px] text-primary-600 hover:text-primary-700 bg-accent-50 dark:bg-accent-950/40 px-1.5 py-0.5 rounded border border-primary-200 dark:border-primary-800 cursor-pointer"
            >
              +7 days
            </button>
          </div>
        )}
      </div>

      <div className="relative flex items-center">
        <div className="absolute left-3 flex items-center pointer-events-none text-text-muted">
          <CalendarIcon className="w-4 h-4" />
        </div>

        <input
          id={inputId}
          type="date"
          value={value}
          min={minDate}
          max={maxDate}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={isInvalid}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            'w-full min-h-[42px] pl-10 pr-3.5 py-2 text-body rounded-card border bg-surface text-text-primary',
            'transition-all duration-180 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent',
            'disabled:bg-canvas disabled:text-text-muted disabled:cursor-not-allowed',
            isInvalid
              ? 'border-status-error focus:ring-status-error'
              : 'border-border hover:border-slate-400 dark:hover:border-slate-600'
          )}
        />
      </div>

      {error && (
        <p id={errorId} className="text-caption text-status-error font-medium">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={helperId} className="text-caption text-text-muted">
          {helperText}
        </p>
      )}
    </div>
  )
}
