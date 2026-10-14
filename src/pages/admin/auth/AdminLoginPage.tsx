import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, AlertCircle, Shield, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { useToastStore } from '@/store/useToastStore'
import { fakeDelay, isValidEmail } from '@/lib/utils'

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { loginAdmin, isAdminAuthenticated } = useAdminAuthStore()
  const { push: pushToast } = useToastStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/admin', { replace: true })
    }
  }, [isAdminAuthenticated, navigate])

  const validateEmail = (val: string): boolean => {
    if (!val.trim()) {
      setEmailError('Admin email is required.')
      return false
    }
    if (!isValidEmail(val)) {
      setEmailError('Please enter a valid email address.')
      return false
    }
    setEmailError('')
    return true
  }

  const validatePassword = (val: string): boolean => {
    if (!val) {
      setPasswordError('Password is required.')
      return false
    }
    if (val.length < 6) {
      setPasswordError('Password must be at least 6 characters.')
      return false
    }
    setPasswordError('')
    return true
  }

  const handleBlurEmail = () => {
    validateEmail(email)
  }

  const handleBlurPassword = () => {
    validatePassword(password)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)

    if (!isEmailValid) {
      setFormError('Please resolve the errors below before continuing.')
      emailInputRef.current?.focus()
      return
    }

    if (!isPasswordValid) {
      setFormError('Please resolve the errors below before continuing.')
      passwordInputRef.current?.focus()
      return
    }

    setIsLoading(true)
    await fakeDelay(600)

    const result = await loginAdmin(email, password)
    setIsLoading(false)

    if (!result.success) {
      setFormError(result.error || 'Invalid administrator credentials. Please try again.')
      passwordInputRef.current?.focus()
      return
    }

    pushToast({
      type: 'success',
      message: 'Signed in successfully to Campus Administrator Portal.',
    })

    navigate('/admin')
  }

  const handleFillDemoAccount = () => {
    setEmail('admin@demo.edu')
    setPassword('Admin@1234')
    setEmailError('')
    setPasswordError('')
    setFormError('')
  }

  return (
    <div className="w-full max-w-[400px] mx-auto text-left">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="primary" size="sm" icon={<Shield className="w-3 h-3" />}>
            Admin Portal
          </Badge>
        </div>
        <h2 className="text-h2 font-bold text-text-primary">Admin sign in</h2>
        <p className="text-small text-text-secondary mt-1">
          Manage campus timetable, announcements, clubs, and venues.
        </p>
      </div>

      {/* Form Error Banner */}
      {formError && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-5 p-3.5 rounded-card bg-status-error/10 border border-status-error/30 text-status-error flex items-start gap-2.5 text-small animate-fade-in"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 leading-snug">{formError}</div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email */}
        <Input
          ref={emailInputRef}
          label="Staff / Administrator Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="admin@demo.edu"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (emailError) setEmailError('')
          }}
          onBlur={handleBlurEmail}
          error={emailError}
          leftIcon={<Mail className="w-4 h-4 text-text-muted" />}
          required
        />

        {/* Password */}
        <PasswordInput
          ref={passwordInputRef}
          label="Admin Password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your administrator password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (passwordError) setPasswordError('')
          }}
          onBlur={handleBlurPassword}
          error={passwordError}
          required
        />

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Sign In as Admin
          </Button>
        </div>

        {/* Demo Account Helper */}
        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            className="w-full"
            onClick={handleFillDemoAccount}
            disabled={isLoading}
          >
            Use demo admin account
          </Button>
          <p className="text-center text-[11px] text-text-muted mt-1.5 font-mono">
            admin@demo.edu / Admin@1234
          </p>
        </div>
      </form>

      {/* Note & Student Link */}
      <div className="mt-8 pt-6 border-t border-border space-y-3 text-center">
        <p className="text-caption text-text-muted">
          Prototype: admin access is simulated and not secure.
        </p>

        <div>
          <Link
            to="/login"
            className="text-small font-medium text-primary-600 hover:text-primary-700 inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-button"
          >
            <span>Switch to student sign in</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
