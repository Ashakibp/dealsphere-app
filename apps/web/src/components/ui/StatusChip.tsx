import React from 'react'
import { cn } from '@/lib/utils'

export type DealStage = 'new' | 'underwriting' | 'approved' | 'funded' | 'paid-off' | 'default'

interface StatusChipProps {
  stage: DealStage
  className?: string
}

const stageConfig = {
  'new': {
    label: 'New',
    className: 'bg-gray-100 text-gray-600'
  },
  'underwriting': {
    label: 'Underwriting',
    className: 'bg-orange-50 text-orange-600'
  },
  'approved': {
    label: 'Approved',
    className: 'bg-blue-50 text-blue-600'
  },
  'funded': {
    label: 'Funded',
    className: 'bg-green-50 text-green-600'
  },
  'paid-off': {
    label: 'Paid Off',
    className: 'bg-emerald-50 text-emerald-600'
  },
  'default': {
    label: 'Default',
    className: 'bg-red-50 text-red-600'
  },
}

export default function StatusChip({ stage, className }: StatusChipProps) {
  const config = stageConfig[stage]
  
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
      config.className,
      className
    )}>
      {config.label}
    </span>
  )
}