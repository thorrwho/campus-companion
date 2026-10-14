import React, { useState } from 'react'
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'

export interface ListEditorProps {
  id?: string
  label?: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  helperText?: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
  maxItems?: number
}

export const ListEditor: React.FC<ListEditorProps> = ({
  id,
  label,
  items,
  onChange,
  placeholder = 'Add new item...',
  helperText,
  error,
  required,
  disabled,
  className,
  maxItems,
}) => {
  const [newVal, setNewVal] = useState('')

  const generatedId = React.useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`

  const handleAdd = () => {
    const text = newVal.trim()
    if (!text) return
    if (maxItems && items.length >= maxItems) return
    onChange([...items, text])
    setNewVal('')
  }

  const handleRemove = (index: number) => {
    if (disabled) return
    onChange(items.filter((_, idx) => idx !== index))
  }

  const handleMoveUp = (index: number) => {
    if (disabled || index === 0) return
    const updated = [...items]
    const temp = updated[index - 1]
    updated[index - 1] = updated[index]
    updated[index] = temp
    onChange(updated)
  }

  const handleMoveDown = (index: number) => {
    if (disabled || index === items.length - 1) return
    const updated = [...items]
    const temp = updated[index + 1]
    updated[index + 1] = updated[index]
    updated[index] = temp
    onChange(updated)
  }

  const isInvalid = Boolean(error)

  return (
    <div className={cn('w-full space-y-2 text-left', className)}>
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

        {maxItems && (
          <span className="text-xs text-text-muted">
            {items.length} / {maxItems} items
          </span>
        )}
      </div>

      {/* Input row */}
      {(!maxItems || items.length < maxItems) && !disabled && (
        <div className="flex items-center gap-2">
          <input
            id={inputId}
            type="text"
            value={newVal}
            disabled={disabled}
            onChange={(e) => setNewVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAdd()
              }
            }}
            placeholder={placeholder}
            aria-invalid={isInvalid}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className="flex-1 min-h-[40px] px-3 py-2 text-body rounded-card border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAdd}
            disabled={!newVal.trim()}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add
          </Button>
        </div>
      )}

      {/* List items */}
      {items.length > 0 ? (
        <ul className="space-y-1.5 pt-1">
          {items.map((item, index) => (
            <li
              key={`${index}-${item.slice(0, 10)}`}
              className="flex items-center justify-between gap-2 p-2 rounded-card border border-border bg-surface hover:bg-canvas/50 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="w-5 h-5 rounded-full bg-canvas border border-border flex items-center justify-center text-xs font-mono text-text-muted shrink-0">
                  {index + 1}
                </span>
                <span className="text-sm text-text-primary truncate">{item}</span>
              </div>

              {!disabled && (
                <div className="flex items-center gap-1 shrink-0">
                  <IconButton
                    icon={<ArrowUp className="w-3.5 h-3.5" />}
                    aria-label="Move up"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => handleMoveUp(index)}
                    className="h-7 w-7 text-text-muted hover:text-text-primary"
                  />
                  <IconButton
                    icon={<ArrowDown className="w-3.5 h-3.5" />}
                    aria-label="Move down"
                    size="sm"
                    disabled={index === items.length - 1}
                    onClick={() => handleMoveDown(index)}
                    className="h-7 w-7 text-text-muted hover:text-text-primary"
                  />
                  <IconButton
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                    aria-label="Remove item"
                    size="sm"
                    onClick={() => handleRemove(index)}
                    className="h-7 w-7 text-text-muted hover:text-status-error"
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-4 border border-dashed border-border rounded-card bg-canvas/30 text-xs text-text-muted">
          No items added yet.
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
