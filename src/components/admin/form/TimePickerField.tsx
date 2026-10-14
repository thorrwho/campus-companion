import React from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TimePickerFieldProps {
  id?: string
  label?: string
  value: string // Format: HH:mm
  onChange: (val: string) => void
  helperText?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
  showPresets?: boolean
}

export const TimePickerField: React.FC<TimePickerFieldProps> = ({
  id,
  label,
  value,
  onChange,
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

  const presets = [
    { value: '09:00', label: '9 AM' },
    { value: '12:00', label: '12 PM' },
    { value: '14:00', label: '2 PM' },
    { value: '17:00', label: '5 PM' },
  ]

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
          <div className="flex items-center gap-1">
            {presets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => onChange(preset.value)}
                className="text-[11px] text-text-secondary hover:text-primary-600 bg-canvas hover:bg-accent-50 dark:hover:bg-accent-950/40 px-1.5 py-0.5 rounded border border-border cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative flex items-center">
        <div className="absolute left-3 flex items-center pointer-events-none text-text-muted">
          <Clock className="w-4 h-4" />
        </div>

        <input
          id={inputId}
          type="time"
          value={value}
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
