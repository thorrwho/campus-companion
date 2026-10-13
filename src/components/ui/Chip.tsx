import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
  label: string
  icon?: React.ReactNode
}

export const Chip: React.FC<ChipProps> = ({
  selected = false,
  label,
  icon,
  className,
  disabled,
  onClick,
  ...props
}) => {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-caption font-medium border transition-colors duration-180 select-none min-h-[36px]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        selected
          ? 'bg-accent-100 text-primary-700 border-primary-600 font-semibold'
          : 'bg-surface text-text-secondary border-border hover:border-text-muted/60 hover:text-text-primary',
        className
      )}
      {...props}
    >
      {selected ? (
        <Check className="w-3.5 h-3.5 text-primary-600 shrink-0" aria-hidden="true" />
      ) : (
        icon && <span className="shrink-0 text-text-muted" aria-hidden="true">{icon}</span>
      )}
      <span>{label}</span>
    </button>
  )
}
