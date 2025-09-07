"use client"

import React from 'react'
import { Bot, TrendingUp, AlertTriangle, CheckCircle, Zap, Target, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Insight {
  id: string
  type: 'opportunity' | 'risk' | 'achievement' | 'optimization'
  title: string
  description: string
  value?: string
  confidence: number
  actionable: boolean
  urgency: 'low' | 'medium' | 'high'
}

interface AIInsightsCardProps {
  insights?: Insight[]
}

const defaultInsights: Insight[] = [
  {
    id: '1',
    type: 'risk',
    title: 'Elevated Default Risk Detected',
    description: 'Three merchants show declining daily deposits over 14 days',
    value: '23% above threshold',
    confidence: 94,
    actionable: true,
    urgency: 'high'
  },
  {
    id: '2', 
    type: 'opportunity',
    title: 'High-Value Prospects Identified',
    description: 'AI identified 12 qualified leads with >$500K funding potential',
    value: '$6.2M opportunity',
    confidence: 87,
    actionable: true,
    urgency: 'medium'
  },
  {
    id: '3',
    type: 'achievement',
    title: 'Portfolio Performance',
    description: 'Your risk management reduced defaults by 28% this quarter',
    value: '$1.2M saved',
    confidence: 99,
    actionable: false,
    urgency: 'low'
  },
  {
    id: '4',
    type: 'optimization',
    title: 'Process Improvement',
    description: 'Automate underwriting for deals <$50K to save 4.2 hours daily',
    value: '35% efficiency gain',
    confidence: 91,
    actionable: true,
    urgency: 'medium'
  }
]

const getInsightConfig = (type: Insight['type']) => {
  switch (type) {
    case 'risk':
      return {
        icon: AlertTriangle,
        color: 'text-danger',
        bgColor: 'bg-danger/10',
        borderColor: 'border-danger/20',
        glowColor: 'shadow-danger/20'
      }
    case 'opportunity':
      return {
        icon: Target,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/20',
        glowColor: 'shadow-primary/20'
      }
    case 'achievement':
      return {
        icon: CheckCircle,
        color: 'text-success',
        bgColor: 'bg-success/10',
        borderColor: 'border-success/20',
        glowColor: 'shadow-success/20'
      }
    case 'optimization':
      return {
        icon: Zap,
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        borderColor: 'border-warning/20',
        glowColor: 'shadow-warning/20'
      }
  }
}

export default function AIInsightsCard({ insights = defaultInsights }: AIInsightsCardProps) {
  const highPriorityInsights = insights.filter(i => i.urgency === 'high').length
  const actionableInsights = insights.filter(i => i.actionable).length

  return (
    <div className="bg-card rounded-card p-6 shadow-card card-hover">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary/80 rounded-lg flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">AI Insights</h3>
            <p className="text-xs text-text-muted">Powered by DealSphere Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {highPriorityInsights > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-danger/10 text-danger rounded-full">
              <div className="w-1.5 h-1.5 bg-danger rounded-full animate-pulse" />
              <span className="font-medium">{highPriorityInsights} urgent</span>
            </div>
          )}
          <div className="text-text-muted">
            {actionableInsights}/{insights.length} actionable
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {insights.map((insight) => {
          const config = getInsightConfig(insight.type)
          const Icon = config.icon

          return (
            <div
              key={insight.id}
              className={cn(
                "relative p-4 rounded-lg border transition-all group",
                config.bgColor,
                config.borderColor,
                insight.actionable && "hover:shadow-md cursor-pointer",
                insight.urgency === 'high' && "ring-1 ring-danger/20"
              )}
            >
              {/* Urgency indicator */}
              {insight.urgency === 'high' && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full animate-pulse" />
              )}

              <div className="flex gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  config.bgColor,
                  "border",
                  config.borderColor
                )}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-text-primary text-sm leading-tight">
                      {insight.title}
                    </h4>
                    {insight.value && (
                      <div className={cn(
                        "px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap",
                        config.bgColor,
                        config.color
                      )}>
                        {insight.value}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-text-secondary leading-relaxed mb-3">
                    {insight.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Bot className="h-3 w-3 text-text-muted" />
                        <span className="text-xs text-text-muted">
                          {insight.confidence}% confidence
                        </span>
                      </div>
                      
                      {insight.actionable && (
                        <div className="flex items-center gap-1.5 text-xs text-accent">
                          <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                          <span className="font-medium">Action required</span>
                        </div>
                      )}
                    </div>
                    
                    <div className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      insight.urgency === 'high' && "bg-danger/20 text-danger",
                      insight.urgency === 'medium' && "bg-warning/20 text-warning", 
                      insight.urgency === 'low' && "bg-surface-glass text-text-muted"
                    )}>
                      {insight.urgency} priority
                    </div>
                  </div>
                </div>
              </div>
              
              {insight.actionable && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-border-light">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
            <span>Real-time analysis active</span>
          </div>
          <span>Updated 2 min ago</span>
        </div>
      </div>
    </div>
  )
}