import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/useAuthStore'
import { useToastStore } from '@/store/useToastStore'
import { fakeDelay, isValidEmail } from '@/lib/utils'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, hasOnboarded } = useAuthStore()
  const { push: pushToast } = useToastStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const emailInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)

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

  const validatePassword = (val: string): boolean => {
    if (!val) {
      setPasswordError('Password is required.')
      return false
    }
    if (val.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
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
    await fakeDelay(800)

    const result = await login(email, password, rememberMe)
    setIsLoading(false)

    if (!result.success) {
      setFormError(result.error || 'Incorrect email or password. Please try again.')
      passwordInputRef.current?.focus()
      return
    }

    const firstName = email === 'demo@demo.edu' ? 'Aarav' : email.split('@')[0]
    pushToast({
      type: 'success',
      message: `Welcome back, ${firstName}`,
    })

    if (!hasOnboarded && email !== 'demo@demo.edu') {
      navigate('/onboarding')
    } else {
      navigate('/')
    }
  }

  const handleFillDemoAccount = () => {
    setEmail('demo@demo.edu')
    setPassword('Demo@1234')
    setEmailError('')
    setPasswordError('')
    setFormError('')
  }

  return (
    <div className="w-full max-w-[400px] mx-auto">
      {/* Header */}
      <div className="mb-6 text-left">
        <h2 className="text-h2 font-bold text-text-primary">Welcome back</h2>
        <p className="text-small text-text-secondary mt-1">
          Log in to your Campus Companion account.
        </p>
      </div>

      {/* Form Error Banner */}
      {formError && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-button bg-status-error-bg border border-status-error/30 text-status-error text-small flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="leading-snug">{formError}</div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
        <Input
          ref={emailInputRef}
          id="login-email"
          label="College email"
          type="email"
          autoComplete="email"
          placeholder="you@demo.edu"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (emailError) validateEmail(e.target.value)
          }}
          onBlur={handleBlurEmail}
          error={emailError}
          disabled={isLoading}
          leftIcon={<Mail className="w-4 h-4" aria-hidden="true" />}
          required
        />

        <PasswordInput
          ref={passwordInputRef}
          id="login-password"
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (passwordError) validatePassword(e.target.value)
          }}
          onBlur={handleBlurPassword}
          error={passwordError}
          disabled={isLoading}
          required
        />

        {/* Remember me & Forgot password row */}
        <div className="flex items-center justify-between pt-1">
          <Checkbox
            id="remember-me"
            label="Remember me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading}
          />
          <Link
            to="/forgot-password"
            className="text-small font-medium text-primary-600 hover:text-primary-500 rounded-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            Forgot password?
          </Link>
        </div>

        {/* Primary Log in button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            disabled={isLoading}
            className="w-full font-semibold"
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </Button>
        </div>

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-caption uppercase">
            <span className="bg-surface px-3 text-text-muted">or</span>
          </div>
        </div>

        {/* Use demo account button */}
        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={isLoading}
          onClick={handleFillDemoAccount}
          className="w-full font-medium"
        >
          Use demo account
        </Button>
      </form>

      {/* Footer link to sign-up */}
      <div className="mt-8 text-center text-small text-text-secondary">
        <span>New to Campus Companion? </span>
        <Link
          to="/signup"
          className="font-semibold text-primary-600 hover:text-primary-500 rounded-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          Create an account
        </Link>
      </div>
    </div>
  )
}
