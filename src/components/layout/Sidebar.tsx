import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  GraduationCap,
  Home,
  MapPin,
  Calendar,
  Users,
  Bell,
  BookOpen,
  Building2,
  Bookmark,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  name: string
  to: string
  icon: React.ComponentType<{ className?: string }>
}

const MAIN_NAV_ITEMS: NavItem[] = [
  { name: 'Home', to: '/', icon: Home },
  { name: 'Map', to: '/map', icon: MapPin },
  { name: 'Events', to: '/events', icon: Calendar },
  { name: 'Clubs', to: '/clubs', icon: Users },
  { name: 'Announcements', to: '/announcements', icon: Bell },
  { name: 'Faculty', to: '/faculty', icon: BookOpen },
  { name: 'Facilities', to: '/facilities', icon: Building2 },
]

const BOTTOM_NAV_ITEMS: NavItem[] = [
  { name: 'Saved', to: '/saved', icon: Bookmark },
  { name: 'Settings', to: '/settings', icon: Settings },
]

export const Sidebar: React.FC = () => {
  return (
    <aside
      className="hidden md:flex flex-col justify-between bg-primary-900 text-white shrink-0 md:w-[72px] lg:w-[240px] border-r border-primary-700/50 select-none transition-all duration-200"
      aria-label="Main Navigation"
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-4 lg:px-5 gap-3 border-b border-primary-700/40">
          <div className="w-10 h-10 rounded-card bg-primary-600 flex items-center justify-center text-white shadow-card shrink-0">
            <GraduationCap className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="hidden lg:block overflow-hidden">
            <div className="text-h3 font-bold text-white tracking-tight leading-none truncate">
              Campus Companion
            </div>
            <div className="text-[11px] text-accent-100/70 font-medium truncate mt-1">
              Demo College
            </div>
          </div>
        </div>

        {/* Main Nav Links */}
        <nav className="p-3 space-y-1" aria-label="Campus Sections">
          {MAIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                title={item.name}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-button text-small font-medium transition-colors duration-180 min-h-[44px]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-200',
                    isActive
                      ? 'bg-primary-600 text-white shadow-card'
                      : 'text-accent-100/80 hover:bg-primary-700/60 hover:text-white'
                  )
                }
              >
                <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span className="hidden lg:inline-block truncate">{item.name}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Bottom Nav Links */}
      <div className="p-3 border-t border-primary-700/40 space-y-1">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.name}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-button text-small font-medium transition-colors duration-180 min-h-[44px]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-200',
                  isActive
                    ? 'bg-primary-600 text-white shadow-card'
                    : 'text-accent-100/80 hover:bg-primary-700/60 hover:text-white'
                )
              }
            >
              <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span className="hidden lg:inline-block truncate">{item.name}</span>
            </NavLink>
          )
        })}
      </div>
    </aside>
  )
}
