import React from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'

interface PlaceholderPageProps {
  title: string
  subtitle: string
  phaseNumber: number
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  subtitle,
  phaseNumber,
}) => {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <Card className="text-center max-w-xl mx-auto my-8">
        <h2 className="text-h2 font-semibold text-text-primary mb-2">{title} Module</h2>
        <p className="text-body text-text-secondary">
          This feature will be fully implemented in Phase {phaseNumber} of the build specification.
        </p>
      </Card>
    </div>
  )
}
