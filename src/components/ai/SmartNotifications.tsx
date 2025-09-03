"use client"

import React, { useState } from 'react'
import { Bell, X, Bot, AlertTriangle, CheckCircle, TrendingUp, Clock, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'ai_alert' | 'deal_update' | 'risk_warning' | 'achievement' | 'system'
  title: string
  message: string
  timestamp: Date
  priority: 'low' | 'medium' | 'high'
  actionRequired: boolean
  read: boolean
  data?: {
    dealId?: string
    merchantName?: string
    amount?: string
    risk_score?: number
  }
}

interface SmartNotificationsProps {
  notifications?: Notification[]
}

const defaultNotifications: Notification[] = [
  {
    id: '1',
    type: 'ai_alert',
    title: 'High Risk Deal Detected',
    message: 'AI flagged Deal #A4521 for elevated default risk (Score: 8.2/10)',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    priority: 'high',
    actionRequired: true,
    read: false,
    data: {
      dealId: 'A4521',
      merchantName: 'TechFlow Solutions',
      amount: '$125,000',
      risk_score: 8.2
    }
  },
  {
    id: '2',
    type: 'deal_update',
    title: 'Deal Approved',
    message: 'Merchant "Green Valley Restaurant" has been approved for funding',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    priority: 'medium',
    actionRequired: false,
    read: false,
    data: {
      dealId: 'B2341',
      merchantName: 'Green Valley Restaurant',
      amount: '$85,000'
    }
  },
  {
    id: '3',
    type: 'achievement',
    title: 'Portfolio Milestone',
    message: 'Congratulations! You\'ve reached $10M in funded deals this month',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    priority: 'medium',
    actionRequired: false,
    read: false,
    data: {
      amount: '$10,000,000'
    }
  },
  {
    id: '4',
    type: 'risk_warning',
    title: 'Payment Delay Alert',
    message: '3 merchants have missed scheduled payments in the last 24 hours',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    priority: 'high',
    actionRequired: true,
    read: true
  },
  {
    id: '5',
    type: 'system',
    title: 'AI Model Updated',
    message: 'Risk assessment model v2.3 deployed with improved accuracy',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    priority: 'low',
    actionRequired: false,
    read: true
  }
]

const getNotificationConfig = (type: Notification['type']) => {
  switch (type) {
    case 'ai_alert':
      return {
        icon: Bot,
        color: 'text-accent',
        bgColor: 'bg-accent/10',
        borderColor: 'border-accent/20'
      }
    case 'deal_update':
      return {
        icon: TrendingUp,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/20'
      }
    case 'risk_warning':
      return {
        icon: AlertTriangle,
        color: 'text-danger',
        bgColor: 'bg-danger/10',
        borderColor: 'border-danger/20'
      }
    case 'achievement':
      return {
        icon: Star,
        color: 'text-success',
        bgColor: 'bg-success/10',
        borderColor: 'border-success/20'
      }
    case 'system':
      return {
        icon: CheckCircle,
        color: 'text-text-muted',
        bgColor: 'bg-surface-glass',
        borderColor: 'border-border-light'
      }
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

export default function SmartNotifications({ notifications = defaultNotifications }: SmartNotificationsProps) {
  const [notifs, setNotifs] = useState(notifications)
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifs.filter(n => !n.read).length
  const highPriorityCount = notifs.filter(n => !n.read && n.priority === 'high').length

  const markAsRead = (id: string) => {
    setNotifs(notifs.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const dismissNotification = (id: string) => {
    setNotifs(notifs.filter(n => n.id !== id))
  }

  const markAllRead = () => {
    setNotifs(notifs.map(n => ({ ...n, read: true })))
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-surface-hover rounded-button transition-all group"
      >
        <Bell className="h-5 w-5 text-text-secondary group-hover:text-text-primary transition-colors" />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-accent rounded-full animate-pulse"></span>
            {highPriorityCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center">
                {highPriorityCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-card rounded-card shadow-elevated border border-border-light z-50 animate-scale-in">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border-light">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-text-primary">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs font-medium rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-accent hover:text-accent/80 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-surface-hover rounded-button transition-colors"
                  >
                    <X className="h-4 w-4 text-text-muted" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifs.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-8 w-8 text-text-muted mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-text-muted">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-border-light">
                  {notifs.map((notification) => {
                    const config = getNotificationConfig(notification.type)
                    const Icon = config.icon

                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-4 hover:bg-surface-hover transition-colors cursor-pointer relative",
                          !notification.read && "bg-surface-glass"
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        {/* Priority indicator */}
                        {notification.priority === 'high' && !notification.read && (
                          <div className="absolute top-3 right-3 w-2 h-2 bg-danger rounded-full animate-pulse" />
                        )}

                        {/* Unread indicator */}
                        {!notification.read && (
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-accent rounded-full" />
                        )}

                        <div className="flex gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                            config.bgColor,
                            "border",
                            config.borderColor
                          )}>
                            <Icon className={cn("h-4 w-4", config.color)} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className={cn(
                                "text-sm leading-tight",
                                !notification.read ? "font-semibold text-text-primary" : "font-medium text-text-secondary"
                              )}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-1.5 text-xs text-text-muted flex-shrink-0">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimeAgo(notification.timestamp)}</span>
                              </div>
                            </div>

                            <p className="text-sm text-text-secondary leading-relaxed mb-2">
                              {notification.message}
                            </p>

                            {/* Additional data display */}
                            {notification.data && (
                              <div className="flex items-center gap-4 text-xs text-text-muted">
                                {notification.data.dealId && (
                                  <span>Deal #{notification.data.dealId}</span>
                                )}
                                {notification.data.merchantName && (
                                  <span>{notification.data.merchantName}</span>
                                )}
                                {notification.data.amount && (
                                  <span className="font-medium">{notification.data.amount}</span>
                                )}
                              </div>
                            )}

                            {/* Action indicators */}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                {notification.actionRequired && (
                                  <div className="flex items-center gap-1.5 text-xs text-accent">
                                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                                    <span className="font-medium">Action required</span>
                                  </div>
                                )}
                                
                                <div className={cn(
                                  "px-2 py-0.5 rounded-full text-xs font-medium",
                                  notification.priority === 'high' && "bg-danger/20 text-danger",
                                  notification.priority === 'medium' && "bg-warning/20 text-warning",
                                  notification.priority === 'low' && "bg-surface-glass text-text-muted"
                                )}>
                                  {notification.priority} priority
                                </div>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  dismissNotification(notification.id)
                                }}
                                className="p-1 hover:bg-surface-hover rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3 text-text-muted" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifs.length > 0 && (
              <div className="px-4 py-3 border-t border-border-light">
                <button className="w-full text-sm text-accent hover:text-accent/80 transition-colors">
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}