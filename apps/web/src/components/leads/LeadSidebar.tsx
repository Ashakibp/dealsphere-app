import React, { useEffect, useState } from 'react'
import { X, User, Building, Mail, Phone, DollarSign, Calendar, Tag, Bot, ChevronDown, ChevronUp, Clock, RefreshCw, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import ActivityTimeline from './ActivityTimeline'

interface Lead {
  id: string
  firstName?: string
  lastName?: string
  businessName?: string
  email?: string
  phone?: string
  requestedAmount?: number
  monthlyRevenue?: number
  industry?: string
  stage: string
  researchStatus: string
  assignedTo?: {
    id: string
    firstName: string
    lastName: string
    isAIAgent: boolean
    aiType?: string
  }
  createdAt: string
  extraData?: Record<string, any>
  researchData?: Record<string, any>
  originalRow?: Record<string, any>
}

interface LeadSidebarProps {
  lead: Lead | null
  onClose: () => void
}

export default function LeadSidebar({ lead, onClose }: LeadSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    details: true,
    research: false,
    extraData: false,
    originalData: false
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Not provided'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'NEW': return 'bg-surface-glass text-text-muted border-border-light'
      case 'RESEARCHING': return 'bg-accent/10 text-accent border-accent/20'
      case 'CONTACTED': return 'bg-primary/10 text-primary border-primary/20'
      case 'QUALIFYING': return 'bg-warning/10 text-warning border-warning/20'
      case 'INTERESTED': return 'bg-success/10 text-success border-success/20'
      case 'NOT_INTERESTED': return 'bg-danger/10 text-danger border-danger/20'
      case 'CONVERTED': return 'bg-success/10 text-success border-success/20'
      case 'LOST': return 'bg-danger/10 text-danger border-danger/20'
      default: return 'bg-surface-glass text-text-muted border-border-light'
    }
  }

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'NEW': return <Clock className="h-4 w-4" />
      case 'RESEARCHING': return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'CONTACTED': return <CheckCircle className="h-4 w-4" />
      case 'QUALIFYING': return <User className="h-4 w-4" />
      case 'INTERESTED': return <TrendingUp className="h-4 w-4" />
      case 'NOT_INTERESTED': return <X className="h-4 w-4" />
      case 'CONVERTED': return <CheckCircle className="h-4 w-4" />
      case 'LOST': return <X className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (!lead) return null

  return (
    <>
      {/* Backdrop */}
      {lead && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 right-0 w-full md:w-[36rem] bg-card shadow-card border-l border-border-light transform transition-transform duration-300 ease-in-out z-50 flex flex-col",
        lead ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-accent/5 to-primary/5 px-6 py-5 border-b border-border-light">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-surface-glass rounded-card flex items-center justify-center">
                  <User className="h-6 w-6 text-text-muted" />
                </div>
                <div>
                  <h2 className="text-h3 text-text-primary font-semibold">
                    {lead.firstName || lead.lastName 
                      ? `${lead.firstName || ''} ${lead.lastName || ''}`.trim()
                      : 'Unknown Name'}
                  </h2>
                  {lead.businessName && (
                    <p className="text-text-secondary text-sm">{lead.businessName}</p>
                  )}
                </div>
              </div>
              
              {/* Stage and Status */}
              <div className="flex items-center gap-2 mt-3">
                <div className={cn(
                  "inline-flex items-center gap-1 px-3 py-1 rounded-button text-xs font-medium border",
                  getStageColor(lead.stage)
                )}>
                  {getStageIcon(lead.stage)}
                  <span>{lead.stage.replace('_', ' ')}</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-surface-glass text-text-muted rounded text-xs">
                  <RefreshCw className="h-3 w-3" />
                  <span>{lead.researchStatus.toLowerCase()}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="btn-ghost p-2 -mr-2 -mt-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Lead Details */}
          <div className="border-b border-border-light">
            <button
              onClick={() => toggleSection('details')}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-surface-hover transition-colors"
            >
              <h3 className="text-sm font-semibold text-text-primary">Lead Details</h3>
              {expandedSections.details ? 
                <ChevronUp className="h-4 w-4 text-text-muted" /> : 
                <ChevronDown className="h-4 w-4 text-text-muted" />}
            </button>
            
            {expandedSections.details && (
              <div className="px-6 pb-6 space-y-4">
                {/* Contact Info */}
                <div className="bg-card rounded-card p-4 shadow-card space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-surface-glass rounded-button flex items-center justify-center">
                      <Mail className="h-4 w-4 text-text-muted" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-text-muted uppercase tracking-wide">Email</p>
                      <p className="text-sm text-text-primary font-medium">{lead.email || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-surface-glass rounded-button flex items-center justify-center">
                      <Phone className="h-4 w-4 text-text-muted" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-text-muted uppercase tracking-wide">Phone</p>
                      <p className="text-sm text-text-primary font-medium">{lead.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-surface-glass rounded-button flex items-center justify-center">
                      <Building className="h-4 w-4 text-text-muted" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-text-muted uppercase tracking-wide">Business</p>
                      <p className="text-sm text-text-primary font-medium">{lead.businessName || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="bg-card rounded-card p-4 shadow-card space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-surface-glass rounded-button flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-text-muted" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-text-muted uppercase tracking-wide">Requested Amount</p>
                      <p className="text-sm text-text-primary font-medium">{formatCurrency(lead.requestedAmount)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-surface-glass rounded-button flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-text-muted" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-text-muted uppercase tracking-wide">Monthly Revenue</p>
                      <p className="text-sm text-text-primary font-medium">{formatCurrency(lead.monthlyRevenue)}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-card rounded-card p-4 shadow-card space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-surface-glass rounded-button flex items-center justify-center">
                      <Tag className="h-4 w-4 text-text-muted" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-text-muted uppercase tracking-wide">Industry</p>
                      <p className="text-sm text-text-primary font-medium">{lead.industry || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-surface-glass rounded-button flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-text-muted" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-text-muted uppercase tracking-wide">Created</p>
                      <p className="text-sm text-text-primary font-medium">{formatDate(lead.createdAt)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Assignment */}
                {lead.assignedTo && (
                  <div className="bg-card rounded-card p-4 shadow-card">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-card flex items-center justify-center",
                        lead.assignedTo.isAIAgent ? "bg-accent/10" : "bg-primary/10"
                      )}>
                        {lead.assignedTo.isAIAgent ? (
                          <Bot className="h-5 w-5 text-accent" />
                        ) : (
                          <User className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-text-muted uppercase tracking-wide">Assigned To</p>
                        <p className="text-sm text-text-primary font-medium">
                          {lead.assignedTo.firstName} {lead.assignedTo.lastName}
                        </p>
                        {lead.assignedTo.isAIAgent && lead.assignedTo.aiType && (
                          <p className="text-xs text-text-secondary">
                            AI {lead.assignedTo.aiType.replace('_', ' ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Research Data */}
          {lead.researchData && Object.keys(lead.researchData).length > 0 && (
            <div className="border-b border-border-light">
              <button
                onClick={() => toggleSection('research')}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-surface-hover transition-colors"
              >
                <h3 className="text-sm font-semibold text-text-primary">Research Data</h3>
                {expandedSections.research ? 
                  <ChevronUp className="h-4 w-4 text-text-muted" /> : 
                  <ChevronDown className="h-4 w-4 text-text-muted" />}
              </button>
              
              {expandedSections.research && (
                <div className="px-6 pb-4">
                  <div className="bg-card rounded-card p-3 shadow-card">
                    <div className="bg-surface-glass rounded-button p-3">
                      <pre className="text-sm text-text-secondary whitespace-pre-wrap font-mono">
                        {JSON.stringify(lead.researchData, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Extra Data */}
          {lead.extraData && Object.keys(lead.extraData).length > 0 && (
            <div className="border-b border-border-light">
              <button
                onClick={() => toggleSection('extraData')}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-surface-hover transition-colors"
              >
                <h3 className="text-sm font-semibold text-text-primary">Extra Data</h3>
                {expandedSections.extraData ? 
                  <ChevronUp className="h-4 w-4 text-text-muted" /> : 
                  <ChevronDown className="h-4 w-4 text-text-muted" />}
              </button>
              
              {expandedSections.extraData && (
                <div className="px-6 pb-4">
                  <div className="bg-card rounded-card p-3 shadow-card space-y-2">
                    {Object.entries(lead.extraData).map(([key, value]) => (
                      <div key={key} className="py-2 border-b border-border-light last:border-0">
                        <div className="flex flex-col space-y-1">
                          <span className="text-xs text-text-muted uppercase tracking-wide font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                          <div className="bg-surface-glass rounded-button p-2">
                            <span className="text-sm text-text-primary break-all">{String(value)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Original Row Data */}
          {lead.originalRow && (
            <div className="border-b border-border-light">
              <button
                onClick={() => toggleSection('originalData')}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-surface-hover transition-colors"
              >
                <h3 className="text-sm font-semibold text-text-primary">Original Row Data</h3>
                {expandedSections.originalData ? 
                  <ChevronUp className="h-4 w-4 text-text-muted" /> : 
                  <ChevronDown className="h-4 w-4 text-text-muted" />}
              </button>
              
              {expandedSections.originalData && (
                <div className="px-6 pb-4">
                  <div className="bg-card rounded-card p-3 shadow-card">
                    <div className="bg-surface-glass rounded-button p-3">
                      <pre className="text-sm text-text-secondary whitespace-pre-wrap font-mono">
                        {JSON.stringify(lead.originalRow, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Activity Timeline */}
          <div className="px-6 py-6 pb-8">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Activity Timeline</h3>
            <div>
              <ActivityTimeline leadId={lead.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}