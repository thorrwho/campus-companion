import React, { useState, useRef } from 'react'
import {
  Calendar,
  MapPin,
  Users,
  Bell,
  BookOpen,
  Award,
  Coffee,
  Laptop,
  Music,
  Heart,
  Camera,
  Globe,
  Building,
  Clock,
  Target,
  Compass,
  Briefcase,
  Shield,
  Zap,
  Sparkles,
  GraduationCap,
  Library,
  Activity,
  FileText,
  Layers,
  Cpu,
  Folder,
  Bookmark,
  Tag,
  Star,
  Search,
  ChevronDown,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover } from '@/components/ui/Popover'

export const CURATED_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Calendar,
  MapPin,
  Users,
  Bell,
  BookOpen,
  Award,
  Coffee,
  Laptop,
  Music,
  Heart,
  Camera,
  Globe,
  Building,
  Clock,
  Target,
  Compass,
  Briefcase,
  Shield,
  Zap,
  Sparkles,
  GraduationCap,
  Library,
  Activity,
  FileText,
  Layers,
  Cpu,
  Folder,
  Bookmark,
  Tag,
  Star,
}

export interface IconPickerProps {
  id?: string
  label?: string
  value: string
  onChange: (iconName: string) => void
  helperText?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export const IconPicker: React.FC<IconPickerProps> = ({
  id,
  label,
  value,
  onChange,
  helperText,
  error,
  required,
  disabled,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const generatedId = React.useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`

  const SelectedIcon = CURATED_ICONS[value] || Sparkles

  const filteredIconNames = Object.keys(CURATED_ICONS).filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  )

  const isInvalid = Boolean(error)

  return (
    <div ref={containerRef} className={cn('w-full space-y-1.5 text-left relative', className)}>
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

        {value && (
          <span className="text-xs text-text-muted font-mono">{value}</span>
        )}
      </div>

      {/* Button to open picker */}
      <button
        ref={triggerRef}
        type="button"
        id={inputId}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-invalid={isInvalid}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={cn(
          'w-full min-h-[42px] px-3.5 py-2 rounded-card border bg-surface text-body cursor-pointer',
          'flex items-center justify-between gap-2 transition-all duration-180',
          'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent',
          'disabled:bg-canvas disabled:text-text-muted disabled:cursor-not-allowed',
          isInvalid
            ? 'border-status-error focus:ring-status-error'
            : 'border-border hover:border-slate-400 dark:hover:border-slate-600'
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-accent-100 dark:bg-accent-950/60 text-primary-700 flex items-center justify-center shrink-0">
            <SelectedIcon className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-text-primary">
            {value || 'Select an icon'}
          </span>
        </div>

        <ChevronDown
          className={cn(
            'w-4 h-4 text-text-muted transition-transform duration-180',
            isOpen && 'transform rotate-180'
          )}
        />
      </button>

      {/* Popover grid */}
      <Popover
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
          setSearch('')
        }}
        triggerRef={triggerRef}
        width="trigger"
        maxHeight={320}
        className="p-3 space-y-3"
      >
        {/* Search box */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-2.5 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 30 curated icons..."
            autoFocus
            className="w-full pl-8 pr-7 py-1.5 text-sm bg-surface border border-border rounded text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary-600"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 text-text-muted hover:text-text-primary p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Grid of icons */}
        <div className="grid grid-cols-6 gap-2 max-h-52 overflow-y-auto p-1">
          {filteredIconNames.length === 0 ? (
            <div className="col-span-6 text-center py-4 text-xs text-text-muted">
              No matching icons
            </div>
          ) : (
            filteredIconNames.map((name) => {
              const IconComp = CURATED_ICONS[name]
              const isSelected = value === name
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onChange(name)
                    setIsOpen(false)
                    setSearch('')
                  }}
                  title={name}
                  className={cn(
                    'p-2.5 rounded-card flex flex-col items-center justify-center gap-1 transition-all cursor-pointer',
                    isSelected
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-canvas hover:bg-accent-50 dark:hover:bg-accent-950/40 text-text-secondary hover:text-primary-700 border border-border/50'
                  )}
                >
                  <IconComp className="w-5 h-5 shrink-0" />
                </button>
              )
            })
          )}
        </div>
      </Popover>

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
