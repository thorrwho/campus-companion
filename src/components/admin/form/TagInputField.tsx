import React, { useState, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

export interface TagInputFieldProps {
  id?: string
  label?: string
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  helperText?: string
  error?: string
  required?: boolean
  disabled?: boolean
  maxTags?: number
  className?: string
  suggestions?: string[]
}

export const TagInputField: React.FC<TagInputFieldProps> = ({
  id,
  label,
  tags,
  onChange,
  placeholder = 'Add tag and press Enter...',
  helperText,
  error,
  required,
  disabled,
  maxTags,
  className,
  suggestions,
}) => {
  const [inputVal, setInputVal] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const generatedId = React.useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`

  const isInvalid = Boolean(error)

  const addTag = (rawTag: string) => {
    const cleaned = rawTag.trim().replace(/^#/, '')
    if (!cleaned) return
    if (tags.some((t) => t.toLowerCase() === cleaned.toLowerCase())) {
      setInputVal('')
      return
    }
    if (maxTags && tags.length >= maxTags) return

    onChange([...tags, cleaned])
    setInputVal('')
  }

  const removeTag = (tagToRemove: string) => {
    if (disabled) return
    onChange(tags.filter((t) => t !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputVal)
    } else if (e.key === 'Backspace' && inputVal === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  const availableSuggestions = suggestions
    ? suggestions.filter(
        (s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase())
      )
    : []

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

        {maxTags && (
          <span className="text-xs text-text-muted">
            {tags.length} / {maxTags} tags
          </span>
        )}
      </div>

      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          'w-full min-h-[44px] p-2 text-left rounded-card border bg-surface text-body',
          'flex flex-wrap items-center gap-1.5 transition-all duration-180 cursor-text',
          'focus-within:ring-2 focus-within:ring-primary-600 focus-within:border-transparent',
          disabled && 'bg-canvas text-text-muted cursor-not-allowed',
          isInvalid
            ? 'border-status-error ring-1 ring-status-error'
            : 'border-border hover:border-slate-400 dark:hover:border-slate-600'
        )}
      >
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="neutral"
            size="sm"
            className="pl-2 pr-1 py-0.5 inline-flex items-center gap-1 text-xs"
          >
            <span>#{tag}</span>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeTag(tag)
                }}
                className="hover:text-status-error rounded p-0.5"
                title={`Remove ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </Badge>
        ))}

        {(!maxTags || tags.length < maxTags) && (
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={inputVal}
            disabled={disabled}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (inputVal.trim()) addTag(inputVal)
            }}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] bg-transparent text-sm py-1 px-1 text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        )}
      </div>

      {availableSuggestions.length > 0 && !disabled && (
        <div className="flex flex-wrap items-center gap-1 pt-1">
          <span className="text-xs text-text-muted mr-1">Suggestions:</span>
          {availableSuggestions.slice(0, 5).map((sugg) => (
            <button
              key={sugg}
              type="button"
              onClick={() => addTag(sugg)}
              className="text-xs text-text-secondary hover:text-primary-600 bg-canvas hover:bg-accent-50 dark:hover:bg-accent-950/40 px-2 py-0.5 rounded border border-border transition-colors"
            >
              +{sugg}
            </button>
          ))}
        </div>
      )}

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
