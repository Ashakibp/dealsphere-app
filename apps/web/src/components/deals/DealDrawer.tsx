"use client"

import React, { useEffect, useState } from 'react'
import { X, Building2, Users, Bot, Phone, FileText, Upload, Play } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import * as Avatar from '@radix-ui/react-avatar'
import StatusChip, { type DealStage } from '@/components/ui/StatusChip'
import { cn } from '@/lib/utils'

interface DealDrawerProps {
  deal: any
  open: boolean
  onClose: () => void
}

interface TimelineEntry {
  id: string
  type: 'human' | 'ai' | 'system' | 'call' | 'email'
  author: string
  avatar?: string
  isBot?: boolean
  timestamp: string
  content: string
  attachments?: string[]
  transcript?: string
  recording?: boolean
}

const mockTimeline: TimelineEntry[] = [
  {
    id: '1',
    type: 'call',
    author: 'AI Caller',
    isBot: true,
    timestamp: '2:14PM',
    content: 'Called Merchant Smith',
    transcript: 'Confirming deposit schedule for next ACH pull. Merchant confirmed continuation of daily $1,500 withdrawals.',
    recording: true
  },
  {
    id: '2',
    type: 'ai',
    author: 'AI Underwriter',
    isBot: true,
    timestamp: '2:10PM',
    content: 'Parsed ACH report - Flagged 2 NSF events (June, July). Risk Score: 72/100'
  },
  {
    id: '3',
    type: 'human',
    author: 'John Davis',
    timestamp: '1:50PM',
    content: 'Uploaded contract draft v2.pdf',
    attachments: ['contract_draft_v2.pdf']
  },
  {
    id: '4',
    type: 'email',
    author: 'Broker Rep',
    timestamp: '1:30PM',
    content: 'Emailed updated revenue figures',
    attachments: ['Revenue.xlsx']
  },
  {
    id: '5',
    type: 'system',
    author: 'System',
    timestamp: 'Yesterday at 4:45PM',
    content: 'Deal stage updated from New to Underwriting'
  }
]

const mockDocuments = [
  { name: 'Bank_Statements_Q1.pdf', category: 'Bank Statements', size: '2.4 MB', uploadedAt: '2024-03-14' },
  { name: 'MCA_Agreement.pdf', category: 'Contracts', size: '456 KB', uploadedAt: '2024-03-13' },
  { name: 'ACH_Authorization.pdf', category: 'ACH Reports', size: '234 KB', uploadedAt: '2024-03-12' },
  { name: 'Revenue_Report_2024.xlsx', category: 'Financial', size: '1.2 MB', uploadedAt: '2024-03-11' },
]

export default function DealDrawer({ deal, open, onClose }: DealDrawerProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [filterType, setFilterType] = useState('all')

  if (!deal) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const filteredTimeline = mockTimeline.filter(entry => {
    if (filterType === 'all') return true
    if (filterType === 'human' && entry.type === 'human') return true
    if (filterType === 'ai' && (entry.isBot || entry.type === 'ai' || entry.type === 'call')) return true
    return false
  })

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-[40%] bg-surface shadow-elevated data-[state=open]:animate-slideIn data-[state=closed]:animate-slideOut">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-h2 text-text-primary mb-2">{deal.id}</h2>
                <div className="flex items-center gap-3">
                  <StatusChip stage={deal.stage} />
                  <span className="text-sm text-text-muted">Updated {deal.updatedAt}</span>
                </div>
              </div>
              <Dialog.Close asChild>
                <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <X className="h-5 w-5 text-text-secondary" />
                </button>
              </Dialog.Close>
            </div>

            <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <Tabs.List className="flex border-b border-gray-200 px-6">
                <Tabs.Trigger
                  value="overview"
                  className={cn(
                    "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === 'overview'
                      ? "text-primary border-primary"
                      : "text-text-muted border-transparent hover:text-text-secondary"
                  )}
                >
                  Overview
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="timeline"
                  className={cn(
                    "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === 'timeline'
                      ? "text-primary border-primary"
                      : "text-text-muted border-transparent hover:text-text-secondary"
                  )}
                >
                  Timeline
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="documents"
                  className={cn(
                    "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                    activeTab === 'documents'
                      ? "text-primary border-primary"
                      : "text-text-muted border-transparent hover:text-text-secondary"
                  )}
                >
                  Documents
                </Tabs.Trigger>
              </Tabs.List>

              <div className="flex-1 overflow-y-auto">
                <Tabs.Content value="overview" className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="h-4 w-4 text-text-muted" />
                        <span className="text-sm font-medium text-text-secondary">Merchant</span>
                      </div>
                      <p className="font-medium text-text-primary">{deal.merchant}</p>
                      <p className="text-sm text-text-muted">EIN: 12-3456789</p>
                      <p className="text-sm text-text-muted">Industry: Construction</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="h-4 w-4 text-text-muted" />
                        <span className="text-sm font-medium text-text-secondary">Broker</span>
                      </div>
                      <p className="font-medium text-text-primary">{deal.broker}</p>
                      <p className="text-sm text-text-muted">Rep: Sarah Johnson</p>
                      <p className="text-sm text-text-muted">Commission: 8%</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-h3 text-text-primary">Deal Terms</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">Funded Amount</span>
                        <span className="font-medium text-text-primary">{formatCurrency(deal.fundedAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">Factor Rate</span>
                        <span className="font-medium text-text-primary">{deal.factorRate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">Payback Amount</span>
                        <span className="font-medium text-text-primary">
                          {formatCurrency(deal.fundedAmount * deal.factorRate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">Term</span>
                        <span className="font-medium text-text-primary">{deal.term} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-text-secondary">Daily ACH</span>
                        <span className="font-medium text-text-primary">{formatCurrency(deal.ach)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-h3 text-text-primary">Assigned Team</h3>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                        <Avatar.Root className="h-6 w-6">
                          <Avatar.Image src="https://i.pravatar.cc/150?img=1" className="rounded-full" />
                          <Avatar.Fallback className="bg-primary text-white text-xs rounded-full flex items-center justify-center">
                            JD
                          </Avatar.Fallback>
                        </Avatar.Root>
                        <span className="text-sm text-text-primary">John Davis</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 rounded-lg">
                        <Bot className="h-4 w-4 text-accent" />
                        <span className="text-sm text-text-primary">AI Underwriter</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 rounded-lg">
                        <Bot className="h-4 w-4 text-accent" />
                        <span className="text-sm text-text-primary">AI Caller</span>
                      </div>
                    </div>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="timeline" className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFilterType('all')}
                        className={cn(
                          "px-3 py-1 text-sm rounded-lg transition-colors",
                          filterType === 'all'
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                        )}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setFilterType('human')}
                        className={cn(
                          "px-3 py-1 text-sm rounded-lg transition-colors",
                          filterType === 'human'
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                        )}
                      >
                        Human
                      </button>
                      <button
                        onClick={() => setFilterType('ai')}
                        className={cn(
                          "px-3 py-1 text-sm rounded-lg transition-colors",
                          filterType === 'ai'
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                        )}
                      >
                        AI
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filteredTimeline.map((entry) => (
                      <div key={entry.id} className="flex gap-3">
                        <div className="flex-shrink-0">
                          {entry.isBot ? (
                            <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                              <Bot className="h-4 w-4 text-accent" />
                            </div>
                          ) : (
                            <Avatar.Root className="h-8 w-8">
                              <Avatar.Image src={entry.avatar} className="rounded-full" />
                              <Avatar.Fallback className="bg-primary text-white text-xs rounded-full flex items-center justify-center">
                                {entry.author.split(' ').map(n => n[0]).join('')}
                              </Avatar.Fallback>
                            </Avatar.Root>
                          )}
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-text-primary">{entry.author}</span>
                              {entry.isBot && <Bot className="h-3 w-3 text-accent" />}
                            </div>
                            <span className="text-xs text-text-muted">{entry.timestamp}</span>
                          </div>
                          <p className="text-sm text-text-secondary">{entry.content}</p>
                          
                          {entry.transcript && (
                            <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                              <p className="text-xs text-text-muted italic">&ldquo;{entry.transcript}&rdquo;</p>
                            </div>
                          )}
                          
                          {entry.recording && (
                            <button className="mt-2 flex items-center gap-1.5 px-2.5 py-1 bg-primary text-white rounded text-xs">
                              <Play className="h-3 w-3" />
                              Play Recording
                            </button>
                          )}
                          
                          {entry.attachments && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {entry.attachments.map((file) => (
                                <div key={file} className="flex items-center gap-1 px-2 py-1 bg-white rounded border border-gray-200">
                                  <FileText className="h-3 w-3 text-text-muted" />
                                  <span className="text-xs text-text-secondary">{file}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Tabs.Content>

                <Tabs.Content value="documents" className="p-6">
                  <div className="mb-6 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-accent transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 text-text-muted mx-auto mb-2" />
                    <p className="text-sm text-text-secondary mb-1">Drag files here or click to upload</p>
                    <p className="text-xs text-text-muted">PDF, DOC, XLS up to 10MB</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {mockDocuments.map((doc) => (
                      <div key={doc.name} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <FileText className="h-8 w-8 text-primary" />
                          <span className="text-xs text-text-muted">{doc.size}</span>
                        </div>
                        <p className="text-sm font-medium text-text-primary truncate">{doc.name}</p>
                        <p className="text-xs text-text-muted">{doc.category}</p>
                        <p className="text-xs text-text-muted mt-1">Uploaded {doc.uploadedAt}</p>
                      </div>
                    ))}
                  </div>
                </Tabs.Content>
              </div>
            </Tabs.Root>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}