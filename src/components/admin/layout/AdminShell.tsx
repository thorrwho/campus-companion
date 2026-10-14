import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopBar } from './AdminTopBar'
import { AdminSearchModal } from './AdminSearchModal'

export const AdminShell: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isTabletCollapsed, setIsTabletCollapsed] = useState(false)
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
      {/* Skip to Content Link (Accessibility) */}
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-primary-600 focus:text-white focus:rounded-button focus:shadow-overlay font-medium text-small"
      >
        Skip to main admin content
      </a>

      <div className="flex-1 flex w-full">
        {/* Left Sidebar */}
        <AdminSidebar
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          isCollapsedTablet={isTabletCollapsed}
        />

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminTopBar
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onToggleTabletCollapse={() => setIsTabletCollapsed((prev) => !prev)}
            isTabletCollapsed={isTabletCollapsed}
            onOpenSearch={() => setIsSearchOpen(true)}
          />

          {/* Semantic Main Content */}
          <main
            id="admin-main-content"
            tabIndex={-1}
            className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto outline-none"
          >
            <Outlet />
          </main>
        </div>
      </div>

      {/* Global Admin Search Palette */}
      <AdminSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  )
}
