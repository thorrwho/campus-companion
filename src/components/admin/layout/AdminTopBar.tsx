import React, { useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Search,
  Plus,
  Eye,
  LogOut,
  Menu,
  ChevronDown,
  ChevronRight,
  Bell,
  Calendar,
  Users,
  Send,
  MapPin,
  Building2,
  GraduationCap,
  UserPlus,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { useToastStore } from '@/store/useToastStore'
import { Popover } from '@/components/ui/Popover'
import { cn } from '@/lib/utils'

interface AdminTopBarProps {
  onToggleMobileSidebar: () => void
  onToggleTabletCollapse: () => void
  isTabletCollapsed: boolean
  onOpenSearch: () => void
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({
  onToggleMobileSidebar,
  onToggleTabletCollapse,
  isTabletCollapsed,
  onOpenSearch,
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { adminUser, logoutAdmin, setViewAsStudent } = useAdminAuthStore()
  const { push: pushToast } = useToastStore()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const createButtonRef = useRef<HTMLButtonElement>(null)
  const userButtonRef = useRef<HTMLButtonElement>(null)

  // Build breadcrumbs from path
  const pathSegments = location.pathname.split('/').filter(Boolean)
  const breadcrumbs = pathSegments.map((segment, index) => {
    const url = '/' + pathSegments.slice(0, index + 1).join('/')
    const formatted = segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())

    return {
      label: formatted === 'Admin' ? 'Admin Portal' : formatted,
      url,
      isLast: index === pathSegments.length - 1,
    }
  })

  const handleLogout = () => {
    logoutAdmin()
    pushToast({
      type: 'info',
      message: 'Signed out of Administrator Portal.',
    })
    navigate('/admin/login')
  }

  const handleViewAsStudent = () => {
    setViewAsStudent(true)
    pushToast({
      type: 'info',
      message: 'Switched to student view. Use top banner to return.',
    })
    navigate('/')
  }

  const quickCreateItems = [
    { label: 'New Announcement', to: '/admin/announcements/new', icon: Bell },
    { label: 'New Event', to: '/admin/events/new', icon: Calendar },
    { label: 'New Club', to: '/admin/clubs/new', icon: Users },
    { label: 'Broadcast Notification', to: '/admin/notifications/new', icon: Send },
    { label: 'New Location Pin', to: '/admin/locations/new', icon: MapPin },
    { label: 'New Facility', to: '/admin/facilities/new', icon: Building2 },
    { label: 'New Faculty Member', to: '/admin/faculty/new', icon: GraduationCap },
    { label: 'Add Student', to: '/admin/students', icon: UserPlus },
  ]

  return (
    <header className="h-16 bg-surface border-b border-border px-4 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left: Mobile hamburger / Tablet collapse + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile drawer toggle */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 text-text-secondary hover:text-text-primary rounded-button hover:bg-canvas focus:outline-none focus:ring-2 focus:ring-primary-600"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Tablet collapse toggle */}
        <button
          type="button"
          onClick={onToggleTabletCollapse}
          className="hidden md:flex lg:hidden p-2 text-text-secondary hover:text-text-primary rounded-button hover:bg-canvas focus:outline-none focus:ring-2 focus:ring-primary-600"
          title={isTabletCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isTabletCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isTabletCollapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>

        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumbs" className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted truncate">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.url}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-text-muted shrink-0" aria-hidden="true" />}
              {crumb.isLast ? (
                <span className="font-semibold text-text-primary truncate">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.url}
                  className="hover:text-primary-600 transition-colors truncate"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right Controls: Global Search trigger, Create Dropdown, View as Student, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick Search Trigger Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-canvas hover:bg-border/60 border border-border text-text-secondary hover:text-text-primary text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 shadow-xs"
          title="Search all admin records (Cmd+K / Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
          <span className="hidden md:inline">Quick Search</span>
          <kbd className="hidden lg:inline px-1.5 py-0.5 text-[10px] font-mono bg-surface border border-border rounded text-text-muted">
            Cmd+K
          </kbd>
        </button>

        {/* Create Dropdown */}
        <div className="relative">
          <button
            ref={createButtonRef}
            type="button"
            onClick={() => setIsCreateOpen((prev) => !prev)}
            aria-expanded={isCreateOpen}
            aria-haspopup="true"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Create</span>
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', isCreateOpen && 'rotate-180')} aria-hidden="true" />
          </button>

          <Popover
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            triggerRef={createButtonRef}
            width="auto"
            align="end"
            className="w-56 py-1.5"
          >
            <div className="px-3 py-1 text-[11px] font-semibold text-text-muted uppercase tracking-wider border-b border-border mb-1">
              Quick Create
            </div>
            {quickCreateItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  role="menuitem"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-small text-text-secondary hover:text-text-primary hover:bg-canvas transition-colors"
                >
                  <Icon className="w-4 h-4 text-primary-600 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </Popover>
        </div>

        {/* View as Student Button */}
        <button
          type="button"
          onClick={handleViewAsStudent}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border hover:bg-canvas text-text-secondary hover:text-text-primary text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 cursor-pointer"
          title="Preview how pages appear to students"
        >
          <Eye className="w-3.5 h-3.5 text-primary-600" aria-hidden="true" />
          <span>View as student</span>
        </button>

        {/* Admin Avatar Menu */}
        <div className="relative">
          <button
            ref={userButtonRef}
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
            className="flex items-center gap-2 p-1 rounded-full hover:bg-canvas transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 cursor-pointer"
            aria-label="Admin user account menu"
          >
            <div className="w-8 h-8 rounded-full bg-[#0B1F44] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {adminUser?.avatarInitials || 'CA'}
            </div>
          </button>

          <Popover
            isOpen={isUserMenuOpen}
            onClose={() => setIsUserMenuOpen(false)}
            triggerRef={userButtonRef}
            width="auto"
            align="end"
            className="w-64 py-2"
          >
            <div className="px-4 py-2 border-b border-border">
              <p className="font-semibold text-small text-text-primary truncate">
                {adminUser?.name || 'Campus Administrator'}
              </p>
              <p className="text-caption text-text-muted truncate">
                {adminUser?.email || 'admin@demo.edu'}
              </p>
              <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-bold rounded bg-primary-100 text-primary-700">
                SYSTEM ADMIN
              </span>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={handleViewAsStudent}
                className="sm:hidden w-full flex items-center gap-2 px-4 py-2 text-small text-text-secondary hover:text-text-primary hover:bg-canvas cursor-pointer"
              >
                <Eye className="w-4 h-4 text-primary-600" />
                <span>View as student</span>
              </button>

              <Link
                to="/admin/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-small text-text-secondary hover:text-text-primary hover:bg-canvas"
              >
                <span>Portal Settings</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-small text-status-error hover:bg-status-error/10 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </Popover>
        </div>
      </div>
    </header>
  )
}
