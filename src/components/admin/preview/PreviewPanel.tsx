import React, { useState } from 'react'
import { Smartphone, Monitor, Eye, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ViewportMode = 'mobile' | 'desktop'

export interface PreviewPanelProps {
  title?: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
  defaultViewport?: ViewportMode
  className?: string
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  title = 'Student App Live Preview',
  isOpen,
  onToggle,
  children,
  defaultViewport = 'mobile',
  className,
}) => {
  const [viewport, setViewport] = useState<ViewportMode>(defaultViewport)

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary-600 hover:bg-primary-500 text-white shadow-card-hover font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <Eye className="w-4 h-4" />
        <span>Live Preview</span>
      </button>
    )
  }

  return (
    <div
      className={cn(
        'rounded-card border border-border bg-surface shadow-card overflow-hidden flex flex-col',
        className
      )}
    >
      {/* Header bar */}
      <div className="px-4 py-3 border-b border-border bg-canvas/60 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary-600" />
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Viewport switchers */}
          <div className="inline-flex rounded-button border border-border p-0.5 bg-surface text-xs">
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors',
                viewport === 'mobile'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile (375px)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors',
                viewport === 'desktop'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop (Full)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onToggle}
            aria-label="Close preview"
            className="p-1 rounded text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview content stage */}
      <div className="p-4 sm:p-6 bg-slate-100 dark:bg-slate-900/60 flex justify-center items-start overflow-y-auto min-h-[360px] max-h-[720px]">
        {viewport === 'mobile' ? (
          <div className="w-[375px] max-w-full bg-surface rounded-2xl border-4 border-slate-700/80 shadow-2xl overflow-hidden shrink-0">
            {/* Simulated mobile status bar */}
            <div className="h-6 bg-slate-800 text-slate-300 text-[10px] px-4 flex items-center justify-between font-mono select-none">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-1.5 rounded-xs bg-slate-400" />
                <span className="w-2.5 h-2 rounded-xs bg-slate-400" />
              </div>
            </div>

            {/* Mobile screen content */}
            <div className="p-4 bg-canvas/40 min-h-[420px]">{children}</div>

            {/* Simulated home indicator */}
            <div className="h-4 bg-surface flex items-center justify-center">
              <div className="w-24 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>
          </div>
        ) : (
          <div className="w-full bg-surface rounded-card border border-border shadow-card p-6">
            {children}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t border-border bg-canvas/40 text-[11px] text-text-muted text-center select-none">
        This is a live reflection of how students will see this component in the app.
      </div>
    </div>
  )
}
