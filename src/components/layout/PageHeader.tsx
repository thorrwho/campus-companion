import React from 'react'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="text-left">
        <h1 className="text-display text-text-primary tracking-tight font-semibold">
          {title}
        </h1>
        {subtitle && (
          <p className="text-body text-text-secondary mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 flex items-center gap-3">{action}</div>}
    </div>
  )
}
