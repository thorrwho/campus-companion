import React, { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Input, InputProps } from './Input'

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'leftIcon' | 'rightElement'> {
  showToggle?: boolean
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showToggle = true, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false)

    const toggleVisibility = () => {
      setIsVisible((prev) => !prev)
    }

    return (
      <Input
        ref={ref}
        type={isVisible ? 'text' : 'password'}
        leftIcon={<Lock className="w-4 h-4" aria-hidden="true" />}
        rightElement={
          showToggle ? (
            <button
              type="button"
              onClick={toggleVisibility}
              aria-label={isVisible ? 'Hide password' : 'Show password'}
              className="p-2 text-text-muted hover:text-text-primary rounded-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 transition-colors"
            >
              {isVisible ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          ) : undefined
        }
        {...props}
      />
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
