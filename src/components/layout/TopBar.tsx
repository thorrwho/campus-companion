import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Palette,
  ChevronDown,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/store/useAuthStore'
import { useUserStore } from '@/store/useUserStore'

interface TopBarProps {
  onOpenSearch?: () => void
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenSearch }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { notifications } = useUserStore()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  // Dynamic unread notifications count from persisted store
  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  const handleLogout = () => {
    setIsMenuOpen(false)
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-surface border-b border-border px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 select-none">
      {/* Left: Search Trigger (Desktop and Mobile) */}
      <div className="flex-1 max-w-md">
        <button
          type="button"
          onClick={onOpenSearch || (() => navigate('/?search=true'))}
          className="w-full h-10 px-3.5 rounded-button bg-canvas hover:bg-border/40 border border-border text-left text-small text-text-muted flex items-center justify-between transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          aria-label="Search campus (Press Ctrl+K or Cmd+K)"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-text-muted shrink-0" aria-hidden="true" />
            <span>Search rooms, events, notices...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-medium text-text-muted bg-surface rounded border border-border/80">
            <span className="text-[12px]">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right: Notifications & Avatar Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Notification Bell */}
        <Link
          to="/notifications"
          aria-label={`${unreadCount} unread notifications`}
          className="relative p-2.5 rounded-button text-text-secondary hover:text-text-primary hover:bg-canvas transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-status-error text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-surface"
              aria-hidden="true"
            >
              {unreadCount}
            </span>
          )}
        </Link>

        {/* User Menu Trigger */}
        <div className="relative" ref={menuRef}>
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            aria-label="User profile menu"
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-button hover:bg-canvas transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            <Avatar
              initials={user?.avatarInitials || 'CC'}
              name={user?.name}
              size="sm"
            />
            <span className="hidden sm:inline-block text-small font-medium text-text-primary max-w-[120px] truncate">
              {user?.name ? user.name.split(' ')[0] : 'Account'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted hidden sm:block" aria-hidden="true" />
          </button>

          {/* User Dropdown Menu */}
          {isMenuOpen && (
            <div
              role="menu"
              aria-orientation="vertical"
              className="absolute right-0 mt-2 w-56 bg-surface rounded-card border border-border shadow-overlay py-1.5 z-50 animate-in fade-in slide-in-from-top-1 text-left"
            >
              {/* Profile summary header */}
              <div className="px-4 py-2.5 border-b border-border">
                <p className="text-small font-semibold text-text-primary truncate">
                  {user?.name || 'Student Account'}
                </p>
                <p className="text-caption text-text-muted truncate mt-0.5">
                  {user?.email || 'demo@demo.edu'}
                </p>
                <p className="text-[11px] font-medium text-primary-600 mt-1 uppercase tracking-wider">
                  {user?.department || 'CSE'} : Sem {user?.semester || 5}
                </p>
              </div>

              {/* Menu links */}
              <div className="py-1">
                <Link
                  to="/profile"
                  role="menuitem"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-small text-text-primary hover:bg-canvas transition-colors focus-visible:outline-none focus-visible:bg-canvas"
                >
                  <User className="w-4 h-4 text-text-muted" aria-hidden="true" />
                  <span>Profile and Schedule</span>
                </Link>

                <Link
                  to="/settings"
                  role="menuitem"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-small text-text-primary hover:bg-canvas transition-colors focus-visible:outline-none focus-visible:bg-canvas"
                >
                  <Settings className="w-4 h-4 text-text-muted" aria-hidden="true" />
                  <span>Settings and Alerts</span>
                </Link>

                <Link
                  to="/styleguide"
                  role="menuitem"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-small text-text-primary hover:bg-canvas transition-colors focus-visible:outline-none focus-visible:bg-canvas"
                >
                  <Palette className="w-4 h-4 text-text-muted" aria-hidden="true" />
                  <span>Component Styleguide</span>
                </Link>
              </div>

              {/* Logout button */}
              <div className="pt-1 border-t border-border">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-small text-status-error hover:bg-status-error-bg/50 transition-colors focus-visible:outline-none focus-visible:bg-status-error-bg/50 text-left font-medium"
                >
                  <LogOut className="w-4 h-4 text-status-error" aria-hidden="true" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
