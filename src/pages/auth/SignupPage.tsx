import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Hash, AlertCircle, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PasswordStrengthMeter } from '@/components/domain/PasswordStrengthMeter'
import { useAuthStore } from '@/store/useAuthStore'
import {
  fakeDelay,
  isCollegeEmail,
  isValidEmail,
  isValidFullName,
  isValidRollNumber,
  evaluatePasswordRules,
} from '@/lib/utils'

export const SignupPage: React.FC = () => {
  const navigate = useNavigate()
  const { signup } = useAuthStore()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [rollNo, setRollNo] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)

  // Field errors
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [rollNoError, setRollNoError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [termsError, setTermsError] = useState('')

  // Form banner / states
  const [formError, setFormError] = useState<React.ReactNode | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Terms Modal
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'terms' | 'privacy'>('terms')

  // Refs for focus management
  const nameInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const rollNoInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null)
  const termsCheckboxRef = useRef<HTMLInputElement>(null)

  const validateName = (val: string): boolean => {
    if (!val.trim()) {
      setNameError('Full name is required.')
      return false
    }
    if (!isValidFullName(val)) {
      setNameError('Full name must contain at least 2 characters, letters and spaces only.')
      return false
    }
    setNameError('')
    return true
  }

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

  const validateRollNo = (val: string): boolean => {
    if (!val.trim()) {
      setRollNoError('Roll number is required.')
      return false
    }
    if (!isValidRollNumber(val)) {
      setRollNoError('Roll number must be 6 to 12 alphanumeric characters.')
      return false
    }
    setRollNoError('')
    return true
  }

  const validatePassword = (val: string): boolean => {
    if (!val) {
      setPasswordError('Password is required.')
      return false
    }
    const rules = evaluatePasswordRules(val)
    if (!rules.minLength || !rules.hasUppercase || !rules.hasNumber || !rules.hasSpecialChar) {
      setPasswordError('Password must satisfy all 4 criteria below.')
      return false
    }
    setPasswordError('')
    return true
  }

  const validateConfirmPassword = (val: string, pwdVal = password): boolean => {
    if (!val) {
      setConfirmPasswordError('Please confirm your password.')
      return false
    }
    if (val !== pwdVal) {
      setConfirmPasswordError('Passwords do not match.')
      return false
    }
    setConfirmPasswordError('')
    return true
  }

  const validateTerms = (val: boolean): boolean => {
    if (!val) {
      setTermsError('Please accept the terms to continue.')
      return false
    }
    setTermsError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const isNameValid = validateName(name)
    const isEmailValid = validateEmail(email)
    const isRollNoValid = validateRollNo(rollNo)
    const isPasswordValid = validatePassword(password)
    const isConfirmValid = validateConfirmPassword(confirmPassword)
    const isTermsValid = validateTerms(agreeTerms)

    if (!isNameValid) {
      setFormError('Please resolve the errors below before continuing.')
      nameInputRef.current?.focus()
      return
    }
    if (!isEmailValid) {
      setFormError('Please resolve the errors below before continuing.')
      emailInputRef.current?.focus()
      return
    }
    if (!isRollNoValid) {
      setFormError('Please resolve the errors below before continuing.')
      rollNoInputRef.current?.focus()
      return
    }
    if (!isPasswordValid) {
      setFormError('Please resolve the errors below before continuing.')
      passwordInputRef.current?.focus()
      return
    }
    if (!isConfirmValid) {
      setFormError('Please resolve the errors below before continuing.')
      confirmPasswordInputRef.current?.focus()
      return
    }
    if (!isTermsValid) {
      setFormError('Please accept the terms to continue.')
      termsCheckboxRef.current?.focus()
      return
    }

    setIsLoading(true)
    await fakeDelay(1000)

    const result = await signup({ name, email, rollNo })
    setIsLoading(false)

    if (!result.success) {
      if (email.trim().toLowerCase() === 'taken@demo.edu') {
        setFormError(
          <span>
            An account with this email already exists.{' '}
            <Link
              to="/login"
              className="underline font-semibold hover:text-red-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600"
            >
              Log in instead?
            </Link>
          </span>
        )
      } else {
        setFormError(result.error || 'Failed to create account. Please try again.')
      }
      emailInputRef.current?.focus()
      return
    }

    // Success state inside form panel for 1.2s, then navigate to /onboarding
    setIsSuccess(true)
    setTimeout(() => {
      navigate('/onboarding')
    }, 1200)
  }

  const emailHint =
    email && !isCollegeEmail(email) && isValidEmail(email)
      ? 'Use your college email if you have one.'
      : undefined

  if (isSuccess) {
    return (
      <div className="w-full max-w-[440px] mx-auto text-center py-12 px-4 flex flex-col items-center justify-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-status-success-bg text-status-success flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10" aria-hidden="true" />
        </div>
        <h2 className="text-h2 font-bold text-text-primary">Account created</h2>
        <p className="text-body text-text-secondary mt-2">
          Let's set up your profile...
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[440px] mx-auto">
      {/* Header */}
      <div className="mb-6 text-left">
        <h2 className="text-h2 font-bold text-text-primary">Create your account</h2>
        <p className="text-small text-text-secondary mt-1">
          Join Campus Companion to stay on top of campus life.
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

      {/* Sign-up Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
        {/* Full Name */}
        <Input
          ref={nameInputRef}
          id="signup-name"
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="e.g. Aarav Sharma"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (nameError) validateName(e.target.value)
          }}
          onBlur={() => validateName(name)}
          error={nameError}
          disabled={isLoading}
          leftIcon={<User className="w-4 h-4" aria-hidden="true" />}
          required
        />

        {/* College Email */}
        <Input
          ref={emailInputRef}
          id="signup-email"
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
          hint={emailHint}
          disabled={isLoading}
          leftIcon={<Mail className="w-4 h-4" aria-hidden="true" />}
          required
        />

        {/* Roll Number (auto-uppercase) */}
        <Input
          ref={rollNoInputRef}
          id="signup-rollno"
          label="Roll number"
          type="text"
          autoComplete="off"
          placeholder="e.g. 23CS1A0501"
          value={rollNo}
          onChange={(e) => {
            const upper = e.target.value.toUpperCase()
            setRollNo(upper)
            if (rollNoError) validateRollNo(upper)
          }}
          onBlur={() => validateRollNo(rollNo)}
          error={rollNoError}
          disabled={isLoading}
          leftIcon={<Hash className="w-4 h-4" aria-hidden="true" />}
          required
        />

        {/* Password */}
        <div>
          <PasswordInput
            ref={passwordInputRef}
            id="signup-password"
            label="Password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (passwordError) validatePassword(e.target.value)
              if (confirmPassword) validateConfirmPassword(confirmPassword, e.target.value)
            }}
            onBlur={() => validatePassword(password)}
            error={passwordError}
            disabled={isLoading}
            required
          />
          {/* Live strength meter & rules */}
          <PasswordStrengthMeter password={password} />
        </div>

        {/* Confirm Password */}
        <PasswordInput
          ref={confirmPasswordInputRef}
          id="signup-confirm-password"
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            if (confirmPasswordError) validateConfirmPassword(e.target.value)
          }}
          onBlur={() => validateConfirmPassword(confirmPassword)}
          error={confirmPasswordError}
          disabled={isLoading}
          required
        />

        {/* Terms and Privacy Checkbox */}
        <div className="pt-1">
          <Checkbox
            ref={termsCheckboxRef}
            id="terms-checkbox"
            checked={agreeTerms}
            onChange={(e) => {
              setAgreeTerms(e.target.checked)
              if (termsError) validateTerms(e.target.checked)
            }}
            disabled={isLoading}
            error={termsError}
            label={
              <span>
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => {
                    setModalType('terms')
                    setIsTermsModalOpen(true)
                  }}
                  className="font-semibold text-primary-600 hover:text-primary-500 underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600 rounded-sm"
                >
                  Terms
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => {
                    setModalType('privacy')
                    setIsTermsModalOpen(true)
                  }}
                  className="font-semibold text-primary-600 hover:text-primary-500 underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600 rounded-sm"
                >
                  Privacy Policy
                </button>
              </span>
            }
          />
        </div>

        {/* Primary Create account button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            disabled={isLoading}
            className="w-full font-semibold"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </div>
      </form>

      {/* Footer link to login */}
      <div className="mt-8 text-center text-small text-text-secondary">
        <span>Already have an account? </span>
        <Link
          to="/login"
          className="font-semibold text-primary-600 hover:text-primary-500 rounded-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          Log in
        </Link>
      </div>

      {/* Terms / Privacy Modal */}
      <Modal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        title={modalType === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
        footer={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsTermsModalOpen(false)}
          >
            Understood
          </Button>
        }
      >
        <div className="space-y-3 text-small text-text-secondary">
          <p>
            Welcome to Campus Companion. This is an academic UI/UX interactive prototype built solely for educational and demonstration purposes at Campus Companion Demo College.
          </p>
          <p>
            No real personal data or passwords are transmitted to any remote servers. All entered information is stored locally inside your browser localStorage key (campus-companion-v1).
          </p>
          <p>
            By using this prototype, you acknowledge that all campus events, faculty directory details, notices, and facilities reflect simulated mock records.
          </p>
        </div>
      </Modal>
    </div>
  )
}
