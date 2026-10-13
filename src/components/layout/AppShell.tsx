import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { SearchModal } from '@/components/domain/SearchModal'

export const AppShell: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

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
