import React from 'react'
import { GraduationCap, MapPin, Bell, Layers } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-canvas">
      {/* Brand Panel: 45% on desktop with subtle navy gradient */}
      <div className="w-full lg:w-[45%] bg-gradient-to-b from-primary-900 via-primary-900 to-primary-700 text-white p-6 sm:p-10 lg:p-14 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo and App Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-card bg-primary-600 flex items-center justify-center text-white shadow-card">
              <GraduationCap className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-h2 font-bold tracking-tight text-white">Campus Companion</h1>
              <p className="text-caption text-accent-100 font-medium">Your Campus. One Companion.</p>
            </div>
          </div>

          {/* Desktop Benefit Highlights */}
          <div className="hidden lg:flex flex-col gap-6 mt-16">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-card bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-5 h-5 text-accent-200" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-h3 font-semibold text-white">Find any room in seconds</h2>
                <p className="text-small text-accent-100/80 mt-0.5">
                  Detailed step by step directions to classrooms, labs, offices, and facilities.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-card bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-5 h-5 text-accent-200" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-h3 font-semibold text-white">Never miss an event or notice</h2>
                <p className="text-small text-accent-100/80 mt-0.5">
                  Real-time academic circulars, club fests, hackathons, and examination updates.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-card bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <Layers className="w-5 h-5 text-accent-200" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-h3 font-semibold text-white">Everything about campus in one place</h2>
                <p className="text-small text-accent-100/80 mt-0.5">
                  Daily class timetable, faculty office hours, canteen timings, and student clubs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Brand footer note */}
        <div className="hidden lg:block pt-8 border-t border-white/10 text-caption text-accent-100/60">
          Campus Companion Demo College (Academic UI/UX Prototype)
        </div>
      </div>

      {/* Form Container: 55% on desktop */}
      <main className="w-full lg:w-[55%] flex-1 bg-surface flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-y-auto">
        <div className="w-full flex-1 flex items-center justify-center py-4">
          <div className="w-full max-w-[440px]">{children}</div>
        </div>

        {/* Global prototype disclaimer */}
        <footer className="w-full text-center pt-6 border-t border-border/60">
          <p className="text-caption text-text-muted">
            Prototype: no real accounts or passwords are stored on a server.
          </p>
        </footer>
      </main>
    </div>
  )
}
