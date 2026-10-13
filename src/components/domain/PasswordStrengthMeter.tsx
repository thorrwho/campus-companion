import React from 'react'
import { Check, X } from 'lucide-react'
import { evaluatePasswordRules, getPasswordStrength } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface PasswordStrengthMeterProps {
  password: string
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const { strength, score } = getPasswordStrength(password)
  const rules = evaluatePasswordRules(password)

  const ruleList = [
    { label: 'At least 8 characters', met: rules.minLength },
    { label: 'One uppercase letter', met: rules.hasUppercase },
    { label: 'One number', met: rules.hasNumber },
    { label: 'One special character', met: rules.hasSpecialChar },
  ]

  const strengthColor = {
    Weak: 'bg-status-error text-status-error',
    Medium: 'bg-status-warning text-status-warning',
    Strong: 'bg-status-success text-status-success',
  }[strength]

  return (
    <div className="w-full flex flex-col gap-2.5 mt-1">
      {/* 3-segment strength bar */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-caption">
          <span className="text-text-muted">Password strength:</span>
          <span
            className={cn(
              'font-semibold',
              strength === 'Weak' && 'text-status-error',
              strength === 'Medium' && 'text-status-warning',
              strength === 'Strong' && 'text-status-success'
            )}
          >
            {password ? strength : 'None'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full" aria-hidden="true">
          <div
            className={cn(
              'rounded-full transition-colors duration-180',
              score >= 1 ? strengthColor.split(' ')[0] : 'bg-border'
            )}
          />
          <div
            className={cn(
              'rounded-full transition-colors duration-180',
              score >= 2 ? strengthColor.split(' ')[0] : 'bg-border'
            )}
          />
          <div
            className={cn(
              'rounded-full transition-colors duration-180',
              score >= 3 ? strengthColor.split(' ')[0] : 'bg-border'
            )}
          />
        </div>
      </div>

      {/* Rules checklist */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1" aria-label="Password requirements">
        {ruleList.map((item) => (
          <li
            key={item.label}
            className={cn(
              'flex items-center gap-1.5 text-caption transition-colors duration-180',
              item.met ? 'text-status-success' : 'text-text-muted'
            )}
          >
            {item.met ? (
              <Check className="w-3.5 h-3.5 shrink-0 text-status-success" aria-hidden="true" />
            ) : (
              <X className="w-3.5 h-3.5 shrink-0 text-text-muted" aria-hidden="true" />
            )}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
