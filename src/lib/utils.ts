import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function fakeDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

export function isCollegeEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith('@demo.edu')
}

export function isValidRollNumber(rollNo: string): boolean {
  const clean = rollNo.trim().toUpperCase()
  return /^[A-Z0-9]{6,12}$/.test(clean)
}

export function isValidFullName(name: string): boolean {
  const clean = name.trim()
  return clean.length >= 2 && /^[a-zA-Z\s]+$/.test(clean)
}

export interface PasswordRuleStatus {
  minLength: boolean
  hasUppercase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
}

export function evaluatePasswordRules(password: string): PasswordRuleStatus {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password),
  }
}

export type PasswordStrength = 'Weak' | 'Medium' | 'Strong'

export function getPasswordStrength(password: string): {
  strength: PasswordStrength
  score: number // 0 to 3
} {
  if (!password) {
    return { strength: 'Weak', score: 0 }
  }

  const rules = evaluatePasswordRules(password)
  const passedCount = Object.values(rules).filter(Boolean).length

  if (passedCount <= 2 || password.length < 8) {
    return { strength: 'Weak', score: 1 }
  }
  if (passedCount === 3) {
    return { strength: 'Medium', score: 2 }
  }
  return { strength: 'Strong', score: 3 }
}
