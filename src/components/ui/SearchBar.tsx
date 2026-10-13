import React, { useRef } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, value, onChange, onClear, placeholder = 'Search...', ...props }, ref) => {
    const internalRef = useRef<HTMLInputElement>(null)
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef

    const handleClear = () => {
      if (onClear) {
        onClear()
      } else if (onChange) {
        const event = {
          target: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>
        onChange(event)
      }
      inputRef.current?.focus()
    }

    const hasValue = Boolean(value && String(value).length > 0)

    return (
      <div className="relative flex items-center w-full">
        <div
          className="absolute left-3.5 flex items-center pointer-events-none text-text-muted shrink-0"
          aria-hidden="true"
        >
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="search"
          role="searchbox"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(
            'w-full min-h-[44px] pl-10 pr-10 py-2.5 rounded-input bg-surface text-body text-text-primary border border-border transition-colors duration-180 placeholder:text-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600',
            'hover:border-text-muted/60',
            className
          )}
          {...props}
        />

        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search query"
            className="absolute right-2 p-1.5 text-text-muted hover:text-text-primary rounded-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    )
  }
)

SearchBar.displayName = 'SearchBar'
