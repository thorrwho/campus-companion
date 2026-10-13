import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Chip } from '@/components/ui/Chip'
import { useAuthStore } from '@/store/useAuthStore'
import { useToastStore } from '@/store/useToastStore'
import { DepartmentCode, EventCategory } from '@/types'

const DEPARTMENTS: { value: DepartmentCode; label: string }[] = [
  { value: 'CSE', label: 'Computer Science and Engineering (CSE)' },
  { value: 'CSE-AIML', label: 'CSE (AI and Machine Learning)' },
  { value: 'ECE', label: 'Electronics and Communication (ECE)' },
  { value: 'EEE', label: 'Electrical and Electronics (EEE)' },
  { value: 'MECH', label: 'Mechanical Engineering (MECH)' },
  { value: 'CIVIL', label: 'Civil Engineering (CIVIL)' },
]

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({
  value: s.toString(),
  label: `Semester ${s}`,
}))

const INTERESTS: { id: EventCategory; label: string }[] = [
  { id: 'workshop', label: 'Workshops and Masterclasses' },
  { id: 'hackathon', label: 'Hackathons and Coding' },
  { id: 'seminar', label: 'Guest Lectures and Seminars' },
  { id: 'cultural', label: 'Cultural Fests and Arts' },
  { id: 'competition', label: 'Competitions and Quizzes' },
  { id: 'sports', label: 'Sports and Tournaments' },
]

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, completeOnboarding } = useAuthStore()
  const { push: pushToast } = useToastStore()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [department, setDepartment] = useState<DepartmentCode>(user?.department || 'CSE-AIML')
  const [semester, setSemester] = useState<number>(user?.semester || 5)
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests || ['workshop', 'hackathon'])

  const [step2Error, setStep2Error] = useState('')

  const handleNextStep1 = () => {
    setStep(2)
  }

  const handleNextStep2 = () => {
    if (!department || !semester) {
      setStep2Error('Please select both your department and semester to continue.')
      return
    }
    setStep2Error('')
    setStep(3)
  }

  const handleFinish = () => {
    completeOnboarding(department, semester, selectedInterests)
    const firstName = user?.name ? user.name.split(' ')[0] : 'Student'
    pushToast({
      type: 'success',
      message: `You're all set, ${firstName}`,
    })
    navigate('/')
  }

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-2xl mx-auto w-full pt-4 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-card bg-primary-600 text-white flex items-center justify-center shadow-card">
            <GraduationCap className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-h3 font-bold text-text-primary">Campus Companion</h1>
            <p className="text-caption text-text-muted">Setup your student profile</p>
          </div>
        </div>

        {/* Step Progress Pill */}
        <div className="flex items-center gap-2 bg-surface border border-border px-3 py-1.5 rounded-full text-caption font-semibold text-text-secondary">
          <span className="text-primary-600">Step {step}</span>
          <span className="text-text-muted">/ 3</span>
        </div>
      </header>

      {/* Main Step Container */}
      <main className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center py-6">
        <div className="bg-surface rounded-card border border-border shadow-card p-6 sm:p-10 text-left transition-all">
          {/* Visual Step Progress Bar */}
          <div className="w-full bg-canvas h-2 rounded-full overflow-hidden mb-8 border border-border/40">
            <div
              className="bg-primary-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
              role="progressbar"
              aria-valuenow={(step / 3) * 100}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Step ${step} of 3`}
            />
          </div>

          {/* Step 1: Welcome & Highlights */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-display text-text-primary">Welcome to Campus Companion</h2>
                <p className="text-body text-text-secondary mt-2">
                  We are excited to help you navigate campus life. Here are three key features to get you started:
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-card bg-canvas border border-border flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent-100 text-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-h3 font-semibold text-text-primary">Interactive Campus Directions</h3>
                    <p className="text-small text-text-secondary mt-0.5">
                      Never get lost again. Get turn by turn walking directions from the Main Gate to any lab, lecture hall, or canteen.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-card bg-canvas border border-border flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent-100 text-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-h3 font-semibold text-text-primary">Live Daily Timetable</h3>
                    <p className="text-small text-text-secondary mt-0.5">
                      Personalized class schedules with current and upcoming lectures, room numbers, and faculty details.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-card bg-canvas border border-border flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent-100 text-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-h3 font-semibold text-text-primary">Events, Clubs and Circulars</h3>
                    <p className="text-small text-text-secondary mt-0.5">
                      Join campus student clubs, register for hackathons and workshops, and stay updated with official notices.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleNextStep1}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Academic Info
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Department & Semester */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-display text-text-primary">Your Academic Details</h2>
                <p className="text-body text-text-secondary mt-2">
                  Tell us what you study. This choice drives which daily timetable and academic circulars appear on your home dashboard.
                </p>
              </div>

              {step2Error && (
                <div role="alert" className="p-3.5 rounded-button bg-status-error-bg text-status-error text-small border border-status-error/30">
                  {step2Error}
                </div>
              )}

              <div className="space-y-5 pt-2">
                <Select
                  id="onboarding-department"
                  label="Department"
                  value={department}
                  options={DEPARTMENTS}
                  onChange={(e) => setDepartment(e.target.value as DepartmentCode)}
                  required
                />

                <Select
                  id="onboarding-semester"
                  label="Current Semester"
                  value={semester.toString()}
                  options={SEMESTERS}
                  onChange={(e) => setSemester(parseInt(e.target.value, 10))}
                  required
                />
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setStep(1)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleNextStep2}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Interests
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Interests & Finish */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-display text-text-primary">What interests you?</h2>
                <p className="text-body text-text-secondary mt-2">
                  Select activities and event topics you would like to follow on campus. You can change these anytime in settings.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-2">
                {INTERESTS.map((item) => {
                  const isSelected = selectedInterests.includes(item.id)
                  return (
                    <Chip
                      key={item.id}
                      label={item.label}
                      selected={isSelected}
                      onClick={() => toggleInterest(item.id)}
                    />
                  )
                })}
              </div>

              <div className="p-4 rounded-card bg-accent-100/60 border border-primary-600/20 text-small text-primary-900 flex items-start gap-3 mt-4">
                <CheckCircle className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden="true" />
                <p>
                  You are all set. Clicking Finish will personalize your dashboard with your department schedule and interests.
                </p>
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setStep(2)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleFinish}
                  rightIcon={<CheckCircle className="w-4 h-4" />}
                >
                  Finish Setup
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-caption text-text-muted py-3">
        Campus Companion Demo College (UI/UX Interactive Prototype)
      </footer>
    </div>
  )
}
