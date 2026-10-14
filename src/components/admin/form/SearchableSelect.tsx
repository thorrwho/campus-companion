import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronDown, Search, X, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover } from '@/components/ui/Popover'

export interface SearchableOption {
  value: string
  label: string
  description?: string
  sublabel?: string
  badge?: string
  group?: string
}

export interface SearchableSelectProps {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  options: SearchableOption[]
  placeholder?: string
  searchPlaceholder?: string
  helperText?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
  isClearable?: boolean
  emptyMessage?: string
  emptyLink?: {
    label: string
    href: string
  }
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  helperText,
  error,
  required,
  disabled,
  className,
  isClearable = true,
  emptyMessage = 'No options available',
  emptyLink,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState<number>(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const optionsListRef = useRef<HTMLDivElement>(null)

  const generatedId = React.useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`

  const selectedOption = options.find((opt) => opt.value === value)

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setActiveIndex(-1)
  }, [])

  // Filter options based on query (case-insensitive on label and description/sublabel)
  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options
    const q = query.toLowerCase()
    return options.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(q)
      const desc = opt.description || opt.sublabel || ''
      const matchDesc = desc.toLowerCase().includes(q)
      const matchGroup = (opt.group || '').toLowerCase().includes(q)
      return matchLabel || matchDesc || matchGroup
    })
  }, [options, query])

  // Group filtered options if any option specifies a group
  const groupedOptions = useMemo(() => {
    const hasAnyGroup = filteredOptions.some((opt) => Boolean(opt.group))
    if (!hasAnyGroup) {
      return [{ groupName: '', items: filteredOptions }]
    }

    const map = new Map<string, SearchableOption[]>()
    for (const opt of filteredOptions) {
      const g = opt.group || 'OTHER'
      if (!map.has(g)) {
        map.set(g, [])
      }
      map.get(g)!.push(opt)
    }

    return Array.from(map.entries()).map(([groupName, items]) => ({
      groupName,
      items,
    }))
  }, [filteredOptions])

  // Focus search input and scroll selected item into view on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus()
        if (optionsListRef.current) {
          const selectedEl = optionsListRef.current.querySelector(
            '[aria-selected="true"]'
          ) as HTMLElement | null
          if (selectedEl) {
            selectedEl.scrollIntoView({ block: 'nearest' })
          }
        }
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(-1)
  }, [query])

  // Scroll active item into view during keyboard navigation
  useEffect(() => {
    if (activeIndex >= 0 && optionsListRef.current) {
      const items = optionsListRef.current.querySelectorAll('[role="option"]')
      const target = items[activeIndex] as HTMLElement | undefined
      if (target) {
        target.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [activeIndex])

  const handleSelect = (val: string) => {
    onChange(val)
    handleClose()
    triggerRef.current?.focus()
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
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
        handleSelect(filteredOptions[activeIndex].value)
      }
      return
    }
  }

  const isInvalid = Boolean(error)

  return (
    <div ref={containerRef} className={cn('w-full space-y-1.5 text-left relative', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-caption font-medium text-text-primary"
        >
          {label}
          {required && <span className="text-status-error ml-1">*</span>}
        </label>
      )}

      {/* Main select button */}
      <button
        ref={triggerRef}
        type="button"
        id={inputId}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={isInvalid}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={cn(
          'w-full min-h-[42px] px-3.5 py-2 text-left rounded-card border bg-surface text-body',
          'flex items-center justify-between gap-2 transition-all duration-180 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent',
          'disabled:bg-canvas disabled:text-text-muted disabled:cursor-not-allowed',
          isInvalid
            ? 'border-status-error focus:ring-status-error'
            : 'border-border hover:border-slate-400 dark:hover:border-slate-600'
        )}
      >
        <span className={cn('truncate', !selectedOption && 'text-text-muted')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div className="flex items-center gap-1.5 shrink-0 text-text-muted">
          {isClearable && selectedOption && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onChange('')
                }
              }}
              title="Clear selection"
              className="p-1 rounded hover:bg-canvas hover:text-text-primary transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform duration-180',
              isOpen && 'transform rotate-180'
            )}
          />
        </div>
      </button>

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

        {/* Options List with Group Headings */}
        <div
          ref={optionsListRef}
          role="listbox"
          className="overflow-y-auto flex-1 divide-y divide-border/40 text-sm focus:outline-none"
        >
          {options.length === 0 ? (
            <div className="px-4 py-6 text-center text-text-muted text-xs space-y-2">
              <p>{emptyMessage}</p>
              {emptyLink && (
                <Link
                  to={emptyLink.href}
                  onClick={handleClose}
                  className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-semibold underline"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{emptyLink.label}</span>
                </Link>
              )}
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="px-3.5 py-4 text-center text-text-muted text-xs">
              No matches for "{query}"
            </div>
          ) : (
            groupedOptions.map((group) => (
              <div key={group.groupName || 'all'} className="py-1">
                {group.groupName && (
                  <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-text-muted bg-canvas/50 sticky top-0 border-y border-border/40 backdrop-blur-xs select-none">
                    {group.groupName}
                  </div>
                )}
                {group.items.map((opt) => {
                  const flatIndex = filteredOptions.indexOf(opt)
                  const isSelected = opt.value === value
                  const isFocused = flatIndex === activeIndex
                  const descriptionText = opt.description || opt.sublabel

                  return (
                    <div
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(opt.value)}
                      onMouseEnter={() => setActiveIndex(flatIndex)}
                      className={cn(
                        'px-3.5 py-2 cursor-pointer flex items-center justify-between gap-2 transition-colors select-none',
                        isSelected
                          ? 'bg-accent-50 dark:bg-accent-950/40 text-primary-700 font-medium'
                          : 'text-text-primary hover:bg-canvas/60',
                        isFocused && 'bg-canvas ring-1 ring-primary-500/20'
                      )}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{opt.label}</span>
                        {descriptionText && (
                          <span className="text-xs text-text-muted truncate">
                            {descriptionText}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {opt.badge && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-canvas text-text-muted border border-border">
                            {opt.badge}
                          </span>
                        )}
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary-600 shrink-0" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
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
