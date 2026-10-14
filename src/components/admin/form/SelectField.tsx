import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover } from '@/components/ui/Popover'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectFieldProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  options: SelectOption[]
  helperText?: string
  error?: string
  required?: boolean
  placeholder?: string
}

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      id,
      label,
      options,
      helperText,
      error,
      required,
      placeholder,
      className,
      disabled,
      value,
      onChange,
      name,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState<number>(-1)

    const containerRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const optionsListRef = useRef<HTMLUListElement>(null)
    const hiddenSelectRef = useRef<HTMLSelectElement | null>(null)

    const generatedId = React.useId()
    const inputId = id || generatedId
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`

    const selectedOption = options.find((opt) => String(opt.value) === String(value))

    const handleClose = useCallback(() => {
      setIsOpen(false)
      setActiveIndex(-1)
    }, [])

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

    // Scroll selected option into view when opened
    useEffect(() => {
      if (isOpen && optionsListRef.current) {
        const timer = setTimeout(() => {
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

    const handleSelect = (opt: SelectOption) => {
      if (opt.disabled) return

      if (hiddenSelectRef.current) {
        hiddenSelectRef.current.value = opt.value
      }

      if (onChange) {
        const syntheticEvent = {
          target: { value: opt.value, name: name || '' },
          currentTarget: { value: opt.value, name: name || '' },
          type: 'change',
          bubbles: true,
          cancelable: true,
        } as unknown as React.ChangeEvent<HTMLSelectElement>
        onChange(syntheticEvent)
      }

      handleClose()
      triggerRef.current?.focus()
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
          if (options.length === 0) return -1
          return prev < options.length - 1 ? prev + 1 : 0
        })
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((prev) => {
          if (options.length === 0) return -1
          return prev > 0 ? prev - 1 : options.length - 1
        })
        return
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < options.length) {
          handleSelect(options[activeIndex])
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

        {/* Hidden native select for form compatibility and ref forwarding */}
        <select
          ref={(node) => {
            hiddenSelectRef.current = node
            if (typeof ref === 'function') {
              ref(node)
            } else if (ref) {
              ;(ref as React.MutableRefObject<HTMLSelectElement | null>).current = node
            }
          }}
          id={`${inputId}-hidden`}
          name={name}
          value={value}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
          onChange={() => {}}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom trigger button */}
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
            {selectedOption ? selectedOption.label : placeholder || 'Select an option...'}
          </span>

          <div className="flex items-center gap-1.5 shrink-0 text-text-muted">
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
          <ul
            ref={optionsListRef}
            role="listbox"
            className="overflow-y-auto flex-1 py-1 divide-y divide-border/40 text-sm focus:outline-none"
          >
            {options.length === 0 ? (
              <li className="px-3.5 py-4 text-center text-text-muted text-xs">
                No options available
              </li>
            ) : (
              options.map((opt, index) => {
                const isSelected = String(opt.value) === String(value)
                const isFocused = index === activeIndex

                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => !opt.disabled && setActiveIndex(index)}
                    className={cn(
                      'px-3.5 py-2 flex items-center justify-between gap-2 transition-colors select-none',
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed text-text-muted'
                        : 'cursor-pointer',
                      isSelected
                        ? 'bg-accent-50 dark:bg-accent-950/40 text-primary-700 font-medium'
                        : 'text-text-primary hover:bg-canvas/60',
                      isFocused && !opt.disabled && 'bg-canvas ring-1 ring-primary-500/20'
                    )}
                  >
                    <span className="truncate">{opt.label}</span>

                    {isSelected && (
                      <Check className="w-4 h-4 text-primary-600 shrink-0" />
                    )}
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
)

SelectField.displayName = 'SelectField'
