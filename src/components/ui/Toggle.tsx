import React from 'react'
import { cn } from '@/lib/utils'

export interface ToggleProps {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  className?: string
}

export const Toggle: React.FC<ToggleProps> = ({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}) => {
  const generatedId = React.useId()
  const toggleId = id || generatedId
  const labelId = `${toggleId}-label`
  const descId = `${toggleId}-desc`

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleToggle()
    }
  }

  return (
    <div className={cn('flex items-center justify-between gap-4 py-1 text-left', className)}>
      {(label || description) && (
        <div className="flex-1 select-none cursor-pointer" onClick={handleToggle}>
          {label && (
            <label
              id={labelId}
              htmlFor={toggleId}
              className="text-small font-medium text-text-primary block cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p id={descId} className="text-caption text-text-secondary mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}

      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={description ? descId : undefined}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          checked ? 'bg-primary-600' : 'bg-border'
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  )
}
