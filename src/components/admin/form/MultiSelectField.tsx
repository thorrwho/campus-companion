import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronDown, Search, X, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Popover } from '@/components/ui/Popover'

export interface MultiSelectOption {
  value: string
  label: string
  badge?: string
}

export interface MultiSelectFieldProps {
  id?: string
  label?: string
  values: string[]
  onChange: (values: string[]) => void
  options: MultiSelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  helperText?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
  maxChipsDisplay?: number
  emptyOptionsMessage?: string
  emptyOptionsLink?: {
    label: string
    href: string
  }
}

export const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  id,
  label,
  values,
  onChange,
  options,
  placeholder = 'Select items...',
  searchPlaceholder = 'Filter items...',
  helperText,
  error,
  required,
  disabled,
  className,
  maxChipsDisplay = 6,
  emptyOptionsMessage,
  emptyOptionsLink,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState<number>(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const optionsListRef = useRef<HTMLUListElement>(null)

  const generatedId = React.useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setActiveIndex(-1)
  }, [])

  // Focus search input when open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Filter options based on query
  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options
    const q = query.toLowerCase()
    return options.filter((opt) => opt.label.toLowerCase().includes(q))
  }, [options, query])

  // Reset active index when query or filtered options change
  useEffect(() => {
    setActiveIndex(-1)
  }, [query])

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && optionsListRef.current) {
      const items = optionsListRef.current.querySelectorAll('[role="option"]')
      const target = items[activeIndex] as HTMLElement | undefined
      if (target) {
        target.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [activeIndex])

  const toggleOption = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val))
    } else {
      onChange([...values, val])
    }
  }

  const selectAllFiltered = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newVals = new Set(values)
    filteredOptions.forEach((opt) => newVals.add(opt.value))
    onChange(Array.from(newVals))
  }

  const clearAllFiltered = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (query.trim()) {
      const filteredSet = new Set(filteredOptions.map((o) => o.value))
      onChange(values.filter((v) => !filteredSet.has(v)))
    } else {
      onChange([])
    }
  }

  const removeValue = (val: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(values.filter((v) => v !== val))
  }

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    if (e.key === 'Escape') {
      e.preventDefault()
      handleClose()
      triggerRef.current?.focus()
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => {
        if (filteredOptions.length === 0) return -1
        return prev < filteredOptions.length - 1 ? prev + 1 : 0
      })
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => {
        if (filteredOptions.length === 0) return -1
        return prev > 0 ? prev - 1 : filteredOptions.length - 1
      })
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
        toggleOption(filteredOptions[activeIndex].value)
      }
      return
    }
  }

  // Determine empty states
  const isLabelDepartment = label?.toLowerCase().includes('department')
  const effectiveEmptyMessage =
    emptyOptionsMessage ||
    (isLabelDepartment ? 'No departments yet' : 'No options available')
  const effectiveEmptyLink =
    emptyOptionsLink ||
    (isLabelDepartment
      ? { label: 'Add departments', href: '/admin/departments' }
      : undefined)

  const isInvalid = Boolean(error)
  const selectedOptions = options.filter((opt) => values.includes(opt.value))
  const displayedChips = selectedOptions.slice(0, maxChipsDisplay)
  const hiddenCount = selectedOptions.length - displayedChips.length

  const allFilteredSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every((opt) => values.includes(opt.value))

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

        {values.length > 0 && !disabled && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-text-muted hover:text-text-primary transition-colors underline"
          >
            Clear all ({values.length})
          </button>
        )}
      </div>

      {/* Main trigger container */}
      <div
        ref={triggerRef}
        id={inputId}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={isInvalid}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={cn(
          'w-full min-h-[44px] p-2 text-left rounded-card border bg-surface text-body',
          'flex items-center justify-between gap-2 transition-all duration-180 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent',
          'disabled:bg-canvas disabled:text-text-muted disabled:cursor-not-allowed',
          isInvalid
            ? 'border-status-error focus:ring-status-error'
            : 'border-border hover:border-slate-400 dark:hover:border-slate-600'
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {displayedChips.length > 0 ? (
            <>
              {displayedChips.map((opt) => (
                <Badge
                  key={opt.value}
                  variant="primary"
                  size="sm"
                  className="pl-2 pr-1 py-0.5 inline-flex items-center gap-1"
                >
                  <span className="truncate max-w-[140px]">{opt.label}</span>
                  {!disabled && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => removeValue(opt.value, e)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          removeValue(opt.value, e as unknown as React.MouseEvent)
                        }
                      }}
                      className="hover:text-primary-900 rounded p-0.5"
                      title={`Remove ${opt.label}`}
                    >
                      <X className="w-3 h-3" />
                    </span>
                  )}
                </Badge>
              ))}
              {hiddenCount > 0 && (
                <span className="text-xs text-text-muted font-medium bg-canvas px-1.5 py-0.5 rounded border border-border">
                  +{hiddenCount} more
                </span>
              )}
            </>
          ) : (
            <span className="text-text-muted text-sm px-1.5">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-text-muted pr-1">
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform duration-180',
              isOpen && 'transform rotate-180'
            )}
          />
        </div>
      </div>

      {/* Shared Popover Portal */}
      <Popover
        isOpen={isOpen}
        onClose={handleClose}
        triggerRef={triggerRef}
        width="trigger"
        maxHeight={280}
      >
        {/* Search box */}
        <div className="p-2 border-b border-border bg-canvas/60 shrink-0">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-2.5 text-text-muted pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-surface border border-border rounded text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary-600"
            />
          </div>
        </div>

        {/* Select All / Clear Row */}
        {filteredOptions.length > 0 && (
          <div className="px-3 py-1.5 border-b border-border/80 bg-surface text-xs flex items-center justify-between text-text-secondary shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={selectAllFiltered}
                disabled={allFilteredSelected}
                className="font-medium text-primary-600 hover:text-primary-800 disabled:opacity-40 disabled:hover:text-primary-600 transition-colors cursor-pointer"
              >
                Select all
              </button>
              <span className="text-border">|</span>
              <button
                type="button"
                onClick={clearAllFiltered}
                className="font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
            <span className="text-text-muted">
              {values.length} selected
            </span>
          </div>
        )}

        {/* Listbox */}
        <ul
          ref={optionsListRef}
          role="listbox"
          aria-multiselectable="true"
          className="overflow-y-auto flex-1 py-1 divide-y divide-border/40 text-sm focus:outline-none"
        >
          {options.length === 0 ? (
            <li className="px-4 py-6 text-center text-text-muted text-xs space-y-2">
              <p>{effectiveEmptyMessage}</p>
              {effectiveEmptyLink && (
                <Link
                  to={effectiveEmptyLink.href}
                  onClick={handleClose}
                  className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-semibold underline"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{effectiveEmptyLink.label}</span>
                </Link>
              )}
            </li>
          ) : filteredOptions.length === 0 ? (
            <li className="px-3.5 py-4 text-center text-text-muted text-xs">
              No matches for "{query}"
            </li>
          ) : (
            filteredOptions.map((opt, index) => {
              const isSelected = values.includes(opt.value)
              const isFocused = index === activeIndex

              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggleOption(opt.value)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    'px-3.5 py-2 cursor-pointer flex items-center justify-between gap-2 transition-colors select-none',
                    isSelected
                      ? 'bg-accent-50 dark:bg-accent-950/40 text-primary-700 font-medium'
                      : 'text-text-primary hover:bg-canvas/60',
                    isFocused && 'bg-canvas ring-1 ring-primary-500/20'
                  )}
                >
                  <span className="truncate">{opt.label}</span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {opt.badge && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-canvas text-text-muted border border-border">
                        {opt.badge}
                      </span>
                    )}
                    <div
                      className={cn(
                        'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                        isSelected
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'border-border'
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </li>
              )
            })
          )}
        </ul>
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
