import React from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Bell,
  Calendar,
  Users,
  Send,
  MapPin,
  Building2,
  GraduationCap,
  Layers,
  Clock,
  UserCheck,
  ClipboardList,
  History,
  Settings,
  X,
  Compass,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  isOpenMobile?: boolean
  onCloseMobile?: () => void
  isCollapsedTablet?: boolean
}

interface NavItem {
  name: string
  to: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavGroup {
  groupTitle: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupTitle: 'Overview',
    items: [
      { name: 'Dashboard', to: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    groupTitle: 'Content',
    items: [
      { name: 'Announcements', to: '/admin/announcements', icon: Bell },
      { name: 'Events', to: '/admin/events', icon: Calendar },
      { name: 'Clubs', to: '/admin/clubs', icon: Users },
      { name: 'Notifications', to: '/admin/notifications', icon: Send },
    ],
  },
  {
    groupTitle: 'Campus',
    items: [
      { name: 'Locations', to: '/admin/locations', icon: MapPin },
      { name: 'Facilities', to: '/admin/facilities', icon: Building2 },
      { name: 'Faculty', to: '/admin/faculty', icon: GraduationCap },
      { name: 'Departments', to: '/admin/departments', icon: Layers },
      { name: 'Timetable', to: '/admin/timetable', icon: Clock },
    ],
  },
  {
    groupTitle: 'People',
    items: [
      { name: 'Students', to: '/admin/students', icon: UserCheck },
      { name: 'Registrations', to: '/admin/registrations', icon: ClipboardList },
    ],
  },
  {
    groupTitle: 'System',
    items: [
      { name: 'Activity Log', to: '/admin/activity', icon: History },
      { name: 'Settings', to: '/admin/settings', icon: Settings },
    ],
  },
]

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpenMobile = false,
  onCloseMobile,
  isCollapsedTablet = false,
}) => {
  const location = useLocation()

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B1F44] text-white">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
        <Link
          to="/admin"
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-md p-1"
        >
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white shadow-sm shrink-0">
            <Compass className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          {!isCollapsedTablet && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">
                Companion
              </span>
              <Badge variant="primary" size="sm" className="bg-primary-600 text-white border-primary-500">
                Admin
              </Badge>
            </div>
          )}
        </Link>

        {/* Mobile close button */}
        {isOpenMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close navigation drawer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <nav
        aria-label="Admin Navigation"
        className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-left no-scrollbar"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.groupTitle} className="space-y-1">
            {!isCollapsedTablet && (
              <h2 className="px-3 text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                {group.groupTitle}
              </h2>
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const isExact = item.to === '/admin'
                const isActive = isExact
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.to)

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      if (isOpenMobile && onCloseMobile) {
                        onCloseMobile()
                      }
                    }}
                    title={isCollapsedTablet ? item.name : undefined}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-small font-medium transition-colors',
                      isActive
                        ? 'bg-primary-600 text-white font-semibold shadow-sm'
                        : 'text-white/75 hover:text-white hover:bg-white/10',
                      isCollapsedTablet ? 'justify-center px-2' : ''
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {!isCollapsedTablet && <span className="truncate">{item.name}</span>}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer info */}
      {!isCollapsedTablet && (
        <div className="p-3 border-t border-white/10 text-xs text-white/50 text-center">
          <p className="truncate">Campus Companion v1.0</p>
          <p className="text-[10px] text-white/40 mt-0.5">Local Simulated Store</p>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside
        className={cn(
          'hidden md:block shrink-0 transition-all duration-200 border-r border-border select-none z-30',
          isCollapsedTablet ? 'w-16' : 'w-[248px]'
        )}
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-xs flex animate-fade-in"
          onClick={onCloseMobile}
        >
          <div
            className="w-[260px] h-full shadow-2xl animate-slide-in-left"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
