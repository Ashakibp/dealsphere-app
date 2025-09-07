import React, { useEffect, useState } from 'react'
import { Clock, User, Bot, FileText, Phone, Mail, MessageSquare, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Activity {
  id: string
  type: string
  title: string
  description: string
  metadata?: Record<string, any>
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED'
  createdAt: string
  user?: {
    id: string
    firstName: string
    lastName: string
    isAIAgent: boolean
    aiType?: string
  }
}

interface ActivityTimelineProps {
  leadId: string
}

export default function ActivityTimeline({ leadId }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true)
        const response = await fetch(`/api/leads/${leadId}/activities`)
        if (!response.ok) {
          throw new Error('Failed to fetch activities')
        }
        const data = await response.json()
        const newActivities = data.activities || []
        
        // Check if there are new activities
        if (newActivities.length > activities.length) {
          console.log(`[ACTIVITY_TIMELINE] Found ${newActivities.length - activities.length} new activities for lead ${leadId}`)
        }
        
        setActivities(newActivities)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activities')
      } finally {
        if (showLoading) setLoading(false)
      }
    }

    if (leadId) {
      // Initial fetch
      fetchActivities()
      
      // Set up polling every 5 seconds for live updates
      console.log(`[ACTIVITY_TIMELINE] Setting up activity polling for lead ${leadId}`)
      const pollingInterval = setInterval(() => {
        fetchActivities(false) // Don't show loading spinner for polling
      }, 5000)
      
      // Cleanup interval
      return () => {
        console.log(`[ACTIVITY_TIMELINE] Cleaning up activity polling for lead ${leadId}`)
        clearInterval(pollingInterval)
      }
    }
  }, [leadId, activities.length])

  const getActivityIcon = (type: string, status: string) => {
    if (status === 'IN_PROGRESS') {
      return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
    }
    
    switch (type) {
      case 'LEAD_QUALIFICATION':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'LEAD_RESEARCH':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'PHONE_CALL':
        return <Phone className="h-4 w-4 text-purple-500" />
      case 'EMAIL':
        return <Mail className="h-4 w-4 text-orange-500" />
      case 'TEXT_MESSAGE':
        return <MessageSquare className="h-4 w-4 text-green-500" />
      case 'AI_ACTION':
        return <Bot className="h-4 w-4 text-indigo-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600'
      case 'IN_PROGRESS':
        return 'text-blue-600'
      case 'FAILED':
        return 'text-red-600'
      case 'CANCELLED':
        return 'text-gray-600'
      default:
        return 'text-yellow-600'
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'Just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}m ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}h ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days}d ago`
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date(dateString))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 text-gray-400 animate-spin" />
        <span className="ml-2 text-sm text-gray-500">Loading activities...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
        <span className="text-sm text-red-600">{error}</span>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No activities yet</p>
        <p className="text-xs text-gray-400 mt-1">Activities will appear here as they happen</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={activity.id} className="relative">
          {/* Timeline line */}
          {index < activities.length - 1 && (
            <div className="absolute left-6 top-10 bottom-0 w-px bg-gray-200" />
          )}
          
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center">
              {getActivityIcon(activity.type, activity.status)}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-medium text-gray-900">
                  {activity.title}
                </h4>
                <span className={cn(
                  "text-xs font-medium",
                  getStatusColor(activity.status)
                )}>
                  {activity.status.toLowerCase()}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                {activity.description}
              </p>
              
              {/* Metadata */}
              {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                <div className="bg-gray-50 rounded p-2 mb-2">
                  <div className="text-xs text-gray-500 space-y-1">
                    {Object.entries(activity.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium">{key}:</span>
                        <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Attribution and time */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  {activity.user ? (
                    <>
                      {activity.user.isAIAgent ? (
                        <Bot className="h-3 w-3" />
                      ) : (
                        <User className="h-3 w-3" />
                      )}
                      <span>
                        {activity.user.firstName} {activity.user.lastName}
                        {activity.user.isAIAgent && activity.user.aiType && (
                          <span className="text-gray-400 ml-1">
                            ({activity.user.aiType.replace('_', ' ')})
                          </span>
                        )}
                      </span>
                    </>
                  ) : (
                    <span>System</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span>{formatRelativeTime(activity.createdAt)}</span>
                  <span className="text-gray-400">•</span>
                  <span>{formatDateTime(activity.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}