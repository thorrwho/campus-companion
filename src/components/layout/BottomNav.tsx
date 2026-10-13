import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, MapPin, Calendar, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavItem {
  name: string
  to: string
  icon: React.ComponentType<{ className?: string }>
}

const ITEMS: BottomNavItem[] = [
  { name: 'Home', to: '/', icon: Home },
  { name: 'Map', to: '/map', icon: MapPin },
  { name: 'Events', to: '/events', icon: Calendar },
  { name: 'Notices', to: '/announcements', icon: Bell },
  { name: 'Profile', to: '/profile', icon: User },
]

export const BottomNav: React.FC = () => {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border shadow-overlay px-2 py-1 flex items-center justify-around"
      aria-label="Mobile Bottom Navigation"
    >
      {ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center flex-1 py-1.5 min-h-[48px] rounded-button transition-colors duration-180',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
                isActive
                  ? 'text-primary-600 font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} aria-hidden="true" />
                </div>
                <span className="text-[11px] leading-tight mt-1">{item.name}</span>
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
