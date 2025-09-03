"use client"

import React from 'react'
import { Clock, DollarSign, FileText, TrendingUp, AlertCircle, CheckCircle, User, Bot, Phone, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Activity {
  id: string
  type: 'deal_update' | 'payment' | 'document' | 'communication' | 'ai_action' | 'risk_alert' | 'approval'
  title: string
  description: string
  timestamp: Date
  user?: {
    name: string
    avatar?: string
    type: 'user' | 'ai'
  }
  metadata?: {
    dealId?: string
    amount?: number
    merchantName?: string
    documentType?: string
    riskScore?: number
  }
  priority: 'low' | 'medium' | 'high'
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'ai_action',
    title: 'AI Risk Alert Generated',
    description: 'RiskGuard Pro flagged Deal #A4521 for elevated default risk',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
    user: { name: 'RiskGuard Pro', type: 'ai' },
    metadata: { dealId: 'A4521', merchantName: 'TechFlow Solutions', riskScore: 8.2 },
    priority: 'high'
  },
  {
    id: '2',
    type: 'deal_update',
    title: 'Deal Approved',
    description: 'Green Valley Restaurant funding approved for $85,000',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
    user: { name: 'Sarah Chen', type: 'user' },
    metadata: { dealId: 'B2341', amount: 85000, merchantName: 'Green Valley Restaurant' },
    priority: 'medium'
  },
  {
    id: '3',
    type: 'payment',
    title: 'Payment Received',
    description: 'Metro Construction LLC made scheduled payment of $12,500',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    user: { name: 'System', type: 'ai' },
    metadata: { amount: 12500, merchantName: 'Metro Construction LLC' },
    priority: 'low'
  },
  {
    id: '4',
    type: 'document',
    title: 'Documents Uploaded',
    description: 'Bank statements and tax returns uploaded for Fashion Forward Boutique',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    user: { name: 'Emma Thompson', type: 'user' },
    metadata: { merchantName: 'Fashion Forward Boutique', documentType: 'Financial Documents' },
    priority: 'medium'
  },
  {
    id: '5',
    type: 'communication',
    title: 'Broker Call Completed',
    description: 'Follow-up call with Marcus Johnson regarding pending deals',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    user: { name: 'David Rodriguez', type: 'user' },
    metadata: {},
    priority: 'low'
  },
  {
    id: '6',
    type: 'ai_action',
    title: 'Deal Scoring Complete',
    description: 'AI analyzed and scored 12 new deal applications',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    user: { name: 'UnderwriteBot', type: 'ai' },
    metadata: {},
    priority: 'medium'
  },
  {
    id: '7',
    type: 'approval',
    title: 'Underwriting Completed',
    description: 'Wellness Center Plus underwriting completed - ready for final approval',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    user: { name: 'Lisa Park', type: 'user' },
    metadata: { merchantName: 'Wellness Center Plus' },
    priority: 'high'
  },
  {
    id: '8',
    type: 'risk_alert',
    title: 'Payment Delay Warning',
    description: 'Digital Marketing Hub payment is 2 days overdue',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    user: { name: 'MonitorMax', type: 'ai' },
    metadata: { merchantName: 'Digital Marketing Hub' },
    priority: 'high'
  }
]

const getActivityConfig = (type: Activity['type']) => {
  switch (type) {
    case 'deal_update':
      return { icon: TrendingUp, color: 'text-primary', bgColor: 'bg-primary/10' }
    case 'payment':
      return { icon: DollarSign, color: 'text-success', bgColor: 'bg-success/10' }
    case 'document':
      return { icon: FileText, color: 'text-accent', bgColor: 'bg-accent/10' }
    case 'communication':
      return { icon: Phone, color: 'text-warning', bgColor: 'bg-warning/10' }
    case 'ai_action':
      return { icon: Bot, color: 'text-accent', bgColor: 'bg-accent/10' }
    case 'risk_alert':
      return { icon: AlertCircle, color: 'text-danger', bgColor: 'bg-danger/10' }
    case 'approval':
      return { icon: CheckCircle, color: 'text-success', bgColor: 'bg-success/10' }
  }
}

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export default function ActivityFeed() {
  return (
    <div className="bg-card rounded-card p-6 shadow-card card-hover">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Recent Activity</h3>
          <p className="text-sm text-text-muted">Latest updates and system events</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-xs text-text-muted">Live feed</span>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => {
          const config = getActivityConfig(activity.type)
          const Icon = config.icon
          const isLast = index === activities.length - 1

          return (
            <div key={activity.id} className="relative">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-5 top-12 w-0.5 h-full bg-border-light" />
              )}
              
              <div className="flex gap-4 group hover:bg-surface-glass -mx-2 px-2 py-2 rounded-lg transition-colors">
                {/* Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  config.bgColor,
                  "border border-border-light"
                )}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-medium text-text-primary text-sm leading-tight">
                      {activity.title}
                    </h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {activity.priority === 'high' && (
                        <div className="w-2 h-2 bg-danger rounded-full animate-pulse" />
                      )}
                      <span className="text-xs text-text-muted">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-text-secondary mb-2 leading-relaxed">
                    {activity.description}
                  </p>

                  {/* Metadata */}
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {activity.metadata.dealId && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                          Deal #{activity.metadata.dealId}
                        </span>
                      )}
                      {activity.metadata.amount && (
                        <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">
                          ${activity.metadata.amount.toLocaleString()}
                        </span>
                      )}
                      {activity.metadata.merchantName && (
                        <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full">
                          {activity.metadata.merchantName}
                        </span>
                      )}
                      {activity.metadata.riskScore && (
                        <span className="px-2 py-0.5 bg-danger/10 text-danger text-xs rounded-full">
                          Risk: {activity.metadata.riskScore}/10
                        </span>
                      )}
                    </div>
                  )}

                  {/* User */}
                  {activity.user && (
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center",
                        activity.user.type === 'ai' ? 'bg-accent/20' : 'bg-primary/20'
                      )}>
                        {activity.user.type === 'ai' ? (
                          <Bot className="h-2.5 w-2.5 text-accent" />
                        ) : (
                          <User className="h-2.5 w-2.5 text-primary" />
                        )}
                      </div>
                      <span className="text-xs text-text-muted">
                        {activity.user.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border-light">
        <button className="w-full text-sm text-accent hover:text-accent/80 transition-colors">
          View All Activity
        </button>
      </div>
    </div>
  )
}