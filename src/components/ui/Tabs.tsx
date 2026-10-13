import React, { useRef } from 'react'
import { cn } from '@/lib/utils'

export interface TabItem {
  id: string
  label: string
  count?: number
  icon?: React.ReactNode
}

export interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (tabId: string) => void
  variant?: 'underline' | 'pill'
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className,
}) => {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex: number | null = null

    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabs.length) % tabs.length
    } else if (e.key === 'Home') {
      nextIndex = 0
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1
    }

    if (nextIndex !== null) {
      e.preventDefault()
      const nextTab = tabs[nextIndex]
      onChange(nextTab.id)
      tabRefs.current[nextTab.id]?.focus()
    }
  }

  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-1 overflow-x-auto no-scrollbar select-none',
        variant === 'underline' && 'border-b border-border',
        variant === 'pill' && 'p-1 bg-canvas rounded-card border border-border w-fit',
        className
      )}
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id

        if (variant === 'pill') {
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el
              }}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-button text-small font-medium transition-colors duration-180 min-h-[36px] whitespace-nowrap',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
                isActive
                  ? 'bg-surface text-primary-600 shadow-card font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-full text-[11px] font-semibold',
                    isActive ? 'bg-accent-100 text-primary-700' : 'bg-border/60 text-text-muted'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        }

        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[tab.id] = el
            }}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-3 text-small font-medium transition-colors duration-180 border-b-2 whitespace-nowrap min-h-[44px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:rounded-t-button',
              isActive
                ? 'border-primary-600 text-primary-600 font-semibold'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
            )}
          >
            {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-full text-[11px] font-semibold',
                  isActive ? 'bg-accent-100 text-primary-700' : 'bg-canvas text-text-muted border border-border'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
