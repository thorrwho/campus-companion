import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ColorOption {
  name: string
  value: string // hex or color token
  bgClass: string
}

export const PRESET_COLORS: ColorOption[] = [
  { name: 'Blue', value: '#2563eb', bgClass: 'bg-blue-600' },
  { name: 'Indigo', value: '#4f46e5', bgClass: 'bg-indigo-600' },
  { name: 'Purple', value: '#9333ea', bgClass: 'bg-purple-600' },
  { name: 'Rose', value: '#e11d48', bgClass: 'bg-rose-600' },
  { name: 'Orange', value: '#ea580c', bgClass: 'bg-orange-600' },
  { name: 'Amber', value: '#d97706', bgClass: 'bg-amber-600' },
  { name: 'Emerald', value: '#059669', bgClass: 'bg-emerald-600' },
  { name: 'Teal', value: '#0d9488', bgClass: 'bg-teal-600' },
  { name: 'Cyan', value: '#0891b2', bgClass: 'bg-cyan-600' },
  { name: 'Slate', value: '#475569', bgClass: 'bg-slate-600' },
]

export interface ColorDotPickerProps {
  id?: string
  label?: string
  value: string
  onChange: (colorValue: string) => void
  colors?: ColorOption[]
  helperText?: string
  error?: string
  disabled?: boolean
  className?: string
}

export const ColorDotPicker: React.FC<ColorDotPickerProps> = ({
  id,
  label,
  value,
  onChange,
  colors = PRESET_COLORS,
  helperText,
  error,
  disabled,
  className,
}) => {
  const generatedId = React.useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`

  const selectedColor = colors.find(
    (c) => c.value.toLowerCase() === value.toLowerCase()
  )

  return (
    <div className={cn('w-full space-y-1.5 text-left', className)}>
      <div className="flex items-center justify-between">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-caption font-medium text-text-primary"
          >
            {label}
          </label>
        )}

        {selectedColor && (
          <span className="text-xs text-text-muted font-medium">
            {selectedColor.name} ({selectedColor.value})
          </span>
        )}
      </div>

      <div
        id={inputId}
        role="radiogroup"
        aria-label={label || 'Color picker'}
        className="flex items-center flex-wrap gap-2.5 p-2 rounded-card border border-border bg-surface"
      >
        {colors.map((c) => {
          const isSelected = c.value.toLowerCase() === value.toLowerCase()
          return (
            <button
              key={c.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(c.value)}
              title={c.name}
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center transition-all relative',
                c.bgClass,
                isSelected
                  ? 'ring-2 ring-primary-600 ring-offset-2 ring-offset-surface scale-110 shadow-sm'
                  : 'hover:scale-105 opacity-90 hover:opacity-100',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isSelected && (
                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
              )}
            </button>
          )
        })}
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
