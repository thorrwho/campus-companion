import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { SearchModal } from '@/components/domain/SearchModal'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'

export const AppShell: React.FC = () => {
  const navigate = useNavigate()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { isViewingAsStudent, setViewAsStudent } = useAdminAuthStore()

  // Listen for Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen bg-canvas flex flex-col antialiased text-text-primary">
      {/* Back to Admin Banner when admin views as student */}
      {isViewingAsStudent && (
        <div className="bg-primary-950 text-white px-4 py-2 flex items-center justify-between text-small border-b border-primary-800 shadow-sm sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" aria-hidden="true" />
            <span className="font-medium text-xs sm:text-small">
              Viewing student application as administrator
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setViewAsStudent(false)
              navigate('/admin')
            }}
            className="px-3 py-1 bg-white text-primary-950 font-semibold rounded-button text-xs hover:bg-neutral-100 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-200"
          >
            Back to admin portal
          </button>
        </div>
      )}

      {/* Skip to Content Link (Accessibility requirement) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-primary-600 focus:text-white focus:rounded-button focus:shadow-overlay focus:outline-none focus:ring-2 focus:ring-accent-100 font-medium text-small"
      >
        Skip to main content
      </a>

      <div className="flex-1 flex w-full">
        {/* Sidebar: Desktop & Tablet */}
        <Sidebar />

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          <TopBar onOpenSearch={() => setIsSearchOpen(true)} />

          {/* Semantic Main Content */}
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto outline-none"
          >
            <Outlet context={{ isSearchOpen, setIsSearchOpen }} />
          </main>
        </div>
      </div>

      {/* Global Command Palette / Search Dialog */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Mobile Fixed Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
