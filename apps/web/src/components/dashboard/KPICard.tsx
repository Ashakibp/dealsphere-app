import React from 'react'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string
  change: number
  changeLabel?: string
  sparklineData?: number[]
}

export default function KPICard({ 
  title, 
  value, 
  change, 
  changeLabel = 'from last month',
  sparklineData = [40, 30, 35, 50, 49, 60, 70, 91, 85, 100]
}: KPICardProps) {
  const isPositive = change >= 0
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight
  
  const maxValue = Math.max(...sparklineData)
  const minValue = Math.min(...sparklineData)
  const range = maxValue - minValue
  
  const generatePath = () => {
    const points = sparklineData.map((value, index) => {
      const x = (index / (sparklineData.length - 1)) * 100
      const y = 100 - ((value - minValue) / range) * 100
      return `${x},${y}`
    }).join(' ')
    
    return `M ${points}`
  }

  return (
    <div className="bg-card rounded-card p-6 shadow-card card-hover animate-fade-in">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-text-secondary text-sm font-medium uppercase tracking-wide">{title}</h3>
        {sparklineData && (
          <div className="relative">
            <svg 
              width="80" 
              height="32" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
              className="opacity-80"
            >
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={isPositive ? '#10B981' : '#EF4444'} stopOpacity="1"/>
                  <stop offset="100%" stopColor={isPositive ? '#3B82F6' : '#6366F1'} stopOpacity="0.8"/>
                </linearGradient>
                <filter id={`glow-${title}`}>
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <polyline
                points={generatePath()}
                fill="none"
                stroke={`url(#gradient-${title})`}
                strokeWidth="3"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                filter={`url(#glow-${title})`}
              />
            </svg>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="text-3xl font-bold text-text-primary tracking-tight">
          {value}
        </div>
        
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium",
            isPositive 
              ? "bg-success/10 text-success" 
              : "bg-danger/10 text-danger"
          )}>
            <Icon className="h-3.5 w-3.5" />
            <span>{Math.abs(change)}%</span>
          </div>
          <span className="text-text-muted text-xs font-medium">{changeLabel}</span>
        </div>
      </div>
    </div>
  )
}