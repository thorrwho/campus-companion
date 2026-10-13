import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { fakeDelay, isValidEmail } from '@/lib/utils'

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const emailInputRef = useRef<HTMLInputElement>(null)

  const validateEmail = (val: string): boolean => {
    if (!val.trim()) {
      setEmailError('Email is required.')
      return false
    }
    if (!isValidEmail(val)) {
      setEmailError('Please enter a valid email address.')
      return false
    }
    setEmailError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      emailInputRef.current?.focus()
      return
    }

    setIsLoading(true)
    await fakeDelay(800)
    setIsLoading(false)
    setIsSubmitted(true)
  }

  return (
    <div className="w-full max-w-[400px] mx-auto text-left">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-h2 font-bold text-text-primary">Reset password</h2>
        <p className="text-small text-text-secondary mt-1">
          Enter your college email and we will send you a reset link.
        </p>
      </div>

      {isSubmitted ? (
        <div className="p-5 rounded-card bg-surface border border-border shadow-card flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-status-success-bg text-status-success flex items-center justify-center">
            <CheckCircle className="w-7 h-7" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-h3 font-semibold text-text-primary">Reset link dispatched</h3>
            <p className="text-small text-text-secondary mt-1 leading-normal">
              If an account exists for <strong className="text-text-primary">{email}</strong>, a reset link has been sent.
            </p>
          </div>

          <div className="p-3 bg-canvas border border-border rounded-button text-caption text-text-muted w-full">
            Simulation notice: No actual emails are sent. This is an interactive academic prototype.
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-small font-semibold text-primary-600 hover:text-primary-500 rounded-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 pt-2"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to log in</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            ref={emailInputRef}
            id="forgot-email"
            label="College email"
            type="email"
            autoComplete="email"
            placeholder="you@demo.edu"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (emailError) validateEmail(e.target.value)
            }}
            onBlur={() => validateEmail(email)}
            error={emailError}
            disabled={isLoading}
            leftIcon={<Mail className="w-4 h-4" aria-hidden="true" />}
            required
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full font-semibold"
            >
              {isLoading ? 'Sending link...' : 'Send reset link'}
            </Button>
          </div>

          <div className="pt-4 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-small font-semibold text-primary-600 hover:text-primary-500 rounded-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back to log in</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
