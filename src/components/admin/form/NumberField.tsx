import React from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface NumberFieldProps {
  id?: string
  label?: string
  value: number
  onChange: (val: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  helperText?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export const NumberField: React.FC<NumberFieldProps> = ({
  id,
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  unit,
  helperText,
  error,
  required,
  disabled,
  className,
}) => {
  const generatedId = React.useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`

  const isInvalid = Boolean(error)

  const handleDecrement = () => {
    if (disabled) return
    const next = value - step
    if (min !== undefined && next < min) return
    onChange(next)
  }

  const handleIncrement = () => {
    if (disabled) return
    const next = value + step
    if (max !== undefined && next > max) return
    onChange(next)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10)
    if (isNaN(parsed)) {
      onChange(min || 0)
      return
    }
    let clamped = parsed
    if (min !== undefined && clamped < min) clamped = min
    if (max !== undefined && clamped > max) clamped = max
    onChange(clamped)
  }

  const canDecrement = !disabled && (min === undefined || value > min)
  const canIncrement = !disabled && (max === undefined || value < max)

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

        {unit && (
          <span className="text-xs text-text-muted font-medium">
            in {unit}
          </span>
        )}
      </div>

      <div className="flex items-center">
        <button
          type="button"
          disabled={!canDecrement}
          onClick={handleDecrement}
          aria-label="Decrease value"
          className="h-[42px] px-3 rounded-l-card border border-r-0 border-border bg-canvas hover:bg-surface text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>

        <input
          id={inputId}
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={handleInputChange}
          aria-invalid={isInvalid}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            'w-full min-h-[42px] px-3.5 py-2 text-center text-body border-y bg-surface text-text-primary font-mono',
            'transition-all duration-180 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:z-10',
            'disabled:bg-canvas disabled:text-text-muted disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            isInvalid
              ? 'border-status-error focus:ring-status-error'
              : 'border-border'
          )}
        />

        <button
          type="button"
          disabled={!canIncrement}
          onClick={handleIncrement}
          aria-label="Increase value"
          className="h-[42px] px-3 rounded-r-card border border-l-0 border-border bg-canvas hover:bg-surface text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
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
