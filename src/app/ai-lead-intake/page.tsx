"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileSpreadsheet, X, Bot, CheckCircle, AlertCircle, Clock, RefreshCw, Download, Filter, Search, ChevronRight, Sparkles, Users, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import toast from 'react-hot-toast'

interface Lead {
  id: string
  name: string
  businessName?: string
  email: string
  phone: string
  requestedAmount?: number
  monthlyRevenue?: number
  industry?: string
  status: 'queued' | 'processing' | 'completed' | 'needs_follow_up' | 'error'
  aiScore?: number
  prefilledData?: {
    creditScore?: number
    yearsInBusiness?: number
    riskLevel?: 'low' | 'medium' | 'high'
  }
  processingTime?: number
  error?: string
  createdAt: Date
}

type TabType = 'all' | 'queued' | 'processing' | 'completed' | 'needs_follow_up'

export default function AILeadIntakePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])

  // Statistics
  const stats = {
    total: leads.length,
    queued: leads.filter(l => l.status === 'queued').length,
    processing: leads.filter(l => l.status === 'processing').length,
    completed: leads.filter(l => l.status === 'completed').length,
    needsFollowUp: leads.filter(l => l.status === 'needs_follow_up').length,
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  // File upload handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const reader = new FileReader()
    
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress((event.loaded / event.total) * 100)
      }
    }

    reader.onload = async (e) => {
      const data = e.target?.result
      let parsedLeads: Lead[] = []

      if (file.name.endsWith('.csv')) {
        // Parse CSV
        Papa.parse(data as string, {
          header: true,
          complete: (results) => {
            parsedLeads = results.data.map((row: any, index) => ({
              id: `lead-${Date.now()}-${index}`,
              name: row.name || row.Name || `Lead ${index + 1}`,
              businessName: row.businessName || row['Business Name'] || row.company || row.Company,
              email: row.email || row.Email || '',
              phone: row.phone || row.Phone || '',
              requestedAmount: parseFloat(row.requestedAmount || row['Requested Amount'] || 0),
              monthlyRevenue: parseFloat(row.monthlyRevenue || row['Monthly Revenue'] || 0),
              industry: row.industry || row.Industry || 'Other',
              status: 'queued' as const,
              createdAt: new Date(),
            }))
            
            setLeads(prev => [...prev, ...parsedLeads])
            setUploadProgress(0)
            toast.success(`Successfully uploaded ${parsedLeads.length} leads`)
            
            // Start processing
            processLeads(parsedLeads)
          },
          error: (error) => {
            toast.error('Error parsing CSV file')
            console.error(error)
          }
        })
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Parse Excel
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        parsedLeads = jsonData.map((row: any, index) => ({
          id: `lead-${Date.now()}-${index}`,
          name: row.name || row.Name || `Lead ${index + 1}`,
          businessName: row.businessName || row['Business Name'] || row.company || row.Company,
          email: row.email || row.Email || '',
          phone: row.phone || row.Phone || '',
          requestedAmount: parseFloat(row.requestedAmount || row['Requested Amount'] || 0),
          monthlyRevenue: parseFloat(row.monthlyRevenue || row['Monthly Revenue'] || 0),
          industry: row.industry || row.Industry || 'Other',
          status: 'queued' as const,
          createdAt: new Date(),
        }))
        
        setLeads(prev => [...prev, ...parsedLeads])
        setUploadProgress(0)
        toast.success(`Successfully uploaded ${parsedLeads.length} leads`)
        
        // Start processing
        processLeads(parsedLeads)
      }
    }

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file)
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.readAsBinaryString(file)
    } else {
      toast.error('Please upload a CSV or Excel file')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  })

  // AI Processing simulation
  const processLeads = async (leadsToProcess: Lead[]) => {
    setIsProcessing(true)
    
    for (let i = 0; i < leadsToProcess.length; i++) {
      const lead = leadsToProcess[i]
      
      // Update status to processing
      setLeads(prev => prev.map(l => 
        l.id === lead.id ? { ...l, status: 'processing' as const } : l
      ))

      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

      // Simulate AI results
      const aiScore = Math.random() * 10
      const needsFollowUp = aiScore < 5 || !lead.email || !lead.phone
      
      const processedLead: Lead = {
        ...lead,
        status: needsFollowUp ? 'needs_follow_up' : 'completed',
        aiScore: parseFloat(aiScore.toFixed(1)),
        prefilledData: {
          creditScore: Math.floor(Math.random() * 300) + 500,
          yearsInBusiness: Math.floor(Math.random() * 10) + 1,
          riskLevel: aiScore > 7 ? 'low' : aiScore > 4 ? 'medium' : 'high'
        },
        processingTime: 1000 + Math.random() * 2000
      }

      setLeads(prev => prev.map(l => 
        l.id === lead.id ? processedLead : l
      ))
    }

    setIsProcessing(false)
    toast.success('AI processing complete!')
  }

  // Filter leads based on tab and search
  const filteredLeads = leads.filter(lead => {
    const matchesTab = activeTab === 'all' || lead.status === activeTab
    const matchesSearch = !searchTerm || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesTab && matchesSearch
  })

  // Export leads
  const exportLeads = (leadsToExport: Lead[]) => {
    const csvContent = Papa.unparse(leadsToExport.map(lead => ({
      Name: lead.name,
      'Business Name': lead.businessName,
      Email: lead.email,
      Phone: lead.phone,
      'Requested Amount': lead.requestedAmount,
      'Monthly Revenue': lead.monthlyRevenue,
      Industry: lead.industry,
      Status: lead.status,
      'AI Score': lead.aiScore,
      'Credit Score': lead.prefilledData?.creditScore,
      'Years in Business': lead.prefilledData?.yearsInBusiness,
      'Risk Level': lead.prefilledData?.riskLevel
    })))

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast.success(`Exported ${leadsToExport.length} leads`)
  }

  // Requeue leads
  const requeueLeads = (leadIds: string[]) => {
    setLeads(prev => prev.map(lead => 
      leadIds.includes(lead.id) ? { ...lead, status: 'queued' as const } : lead
    ))
    
    const leadsToRequeue = leads.filter(l => leadIds.includes(l.id))
    processLeads(leadsToRequeue)
    
    toast.success(`Requeued ${leadIds.length} leads for processing`)
    setSelectedLeads([])
  }

  const getStatusIcon = (status: Lead['status']) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4" />
      case 'processing':
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'needs_follow_up':
        return <AlertCircle className="h-4 w-4" />
      case 'error':
        return <X className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'queued':
        return 'bg-surface-glass text-text-muted border-border-light'
      case 'processing':
        return 'bg-accent/10 text-accent border-accent/20'
      case 'completed':
        return 'bg-success/10 text-success border-success/20'
      case 'needs_follow_up':
        return 'bg-warning/10 text-warning border-warning/20'
      case 'error':
        return 'bg-danger/10 text-danger border-danger/20'
    }
  }

  const getRiskColor = (level?: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return 'text-success'
      case 'medium':
        return 'text-warning'
      case 'high':
        return 'text-danger'
      default:
        return 'text-text-muted'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 text-text-primary flex items-center gap-3">
            AI Lead Intake
            <div className="px-2 py-1 bg-accent/20 rounded-full">
              <Sparkles className="h-5 w-5 text-accent animate-pulse" />
            </div>
          </h1>
          <p className="text-text-muted mt-1">Upload spreadsheets for automated AI pre-qualification</p>
        </div>
        
        <div className="flex items-center gap-3">
          {filteredLeads.length > 0 && (
            <button
              onClick={() => exportLeads(filteredLeads)}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          )}
          {selectedLeads.length > 0 && (
            <button
              onClick={() => requeueLeads(selectedLeads)}
              className="btn-primary flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Requeue ({selectedLeads.length})
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-card rounded-card p-4 shadow-card card-hover">
          <div className="flex items-center justify-between">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold text-text-primary">{stats.total}</span>
          </div>
          <div className="text-sm text-text-muted mt-1">Total Leads</div>
        </div>

        <div className="bg-card rounded-card p-4 shadow-card card-hover">
          <div className="flex items-center justify-between">
            <Clock className="h-5 w-5 text-text-muted" />
            <span className="text-2xl font-bold text-text-primary">{stats.queued}</span>
          </div>
          <div className="text-sm text-text-muted mt-1">Queued</div>
        </div>

        <div className="bg-card rounded-card p-4 shadow-card card-hover">
          <div className="flex items-center justify-between">
            <RefreshCw className="h-5 w-5 text-accent" />
            <span className="text-2xl font-bold text-text-primary">{stats.processing}</span>
          </div>
          <div className="text-sm text-text-muted mt-1">Processing</div>
        </div>

        <div className="bg-card rounded-card p-4 shadow-card card-hover">
          <div className="flex items-center justify-between">
            <CheckCircle className="h-5 w-5 text-success" />
            <span className="text-2xl font-bold text-text-primary">{stats.completed}</span>
          </div>
          <div className="text-sm text-text-muted mt-1">Completed</div>
        </div>

        <div className="bg-card rounded-card p-4 shadow-card card-hover">
          <div className="flex items-center justify-between">
            <AlertCircle className="h-5 w-5 text-warning" />
            <span className="text-2xl font-bold text-text-primary">{stats.needsFollowUp}</span>
          </div>
          <div className="text-sm text-text-muted mt-1">Needs Follow-Up</div>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "bg-card rounded-card p-12 shadow-card border-2 border-dashed transition-all cursor-pointer",
          isDragActive ? "border-accent bg-accent/5" : "border-border-light hover:border-accent/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-accent" />
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="absolute inset-0">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="30"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-accent"
                    strokeDasharray={`${uploadProgress * 1.88} 188`}
                  />
                </svg>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {isDragActive ? 'Drop your file here' : 'Drag & drop your spreadsheet'}
            </h3>
            <p className="text-sm text-text-muted">
              or click to browse • CSV or Excel files supported
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-text-muted">
            <div className="flex items-center gap-1">
              <FileSpreadsheet className="h-3 w-3" />
              <span>CSV</span>
            </div>
            <div className="flex items-center gap-1">
              <FileSpreadsheet className="h-3 w-3" />
              <span>XLSX</span>
            </div>
            <div className="flex items-center gap-1">
              <Bot className="h-3 w-3" />
              <span>AI Processing</span>
            </div>
          </div>
        </div>
      </div>

      {leads.length > 0 && (
        <>
          {/* Progress Bar */}
          {isProcessing && (
            <div className="bg-card rounded-card p-4 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-primary">Processing Leads</span>
                <span className="text-sm text-text-muted">{completionRate}% Complete</span>
              </div>
              <div className="w-full bg-surface-glass rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-accent to-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          )}

          {/* Tabs and Search */}
          <div className="bg-card rounded-card shadow-card">
            <div className="border-b border-border-light">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-1">
                  {(['all', 'queued', 'processing', 'completed', 'needs_follow_up'] as TabType[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-4 py-2 text-sm font-medium rounded-button transition-all",
                        activeTab === tab
                          ? "bg-accent text-white"
                          : "text-text-secondary hover:bg-surface-hover"
                      )}
                    >
                      {tab === 'needs_follow_up' ? 'Needs Follow-Up' : 
                       tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
                      {tab !== 'all' && (
                        <span className="ml-2 text-xs opacity-80">
                          ({stats[tab === 'needs_follow_up' ? 'needsFollowUp' : tab as keyof typeof stats]})
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-surface-glass border border-border-light rounded-button text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Leads Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-glass border-b border-border-light">
                  <tr>
                    <th className="w-8 px-4 py-3">
                      <input
                        type="checkbox"
                        className="rounded border-border-light"
                        checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLeads(filteredLeads.map(l => l.id))
                          } else {
                            setSelectedLeads([])
                          }
                        }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Lead Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Requested
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      AI Analysis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-surface-hover transition-colors">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-border-light"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLeads([...selectedLeads, lead.id])
                            } else {
                              setSelectedLeads(selectedLeads.filter(id => id !== lead.id))
                            }
                          }}
                        />
                      </td>
                      
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-text-primary">{lead.name}</div>
                          {lead.businessName && (
                            <div className="text-sm text-text-muted">{lead.businessName}</div>
                          )}
                          {lead.industry && (
                            <div className="text-xs text-text-muted mt-1">{lead.industry}</div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-text-primary">{lead.email}</div>
                          <div className="text-text-muted">{lead.phone}</div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-text-primary">
                            ${lead.requestedAmount?.toLocaleString() || 'N/A'}
                          </div>
                          {lead.monthlyRevenue && (
                            <div className="text-sm text-text-muted">
                              ${lead.monthlyRevenue.toLocaleString()}/mo
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        {lead.aiScore !== undefined ? (
                          <div>
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "text-lg font-bold",
                                lead.aiScore >= 7 ? "text-success" :
                                lead.aiScore >= 4 ? "text-warning" : "text-danger"
                              )}>
                                {lead.aiScore}/10
                              </div>
                              <Bot className="h-4 w-4 text-accent" />
                            </div>
                            {lead.prefilledData && (
                              <div className="mt-1 space-y-1">
                                <div className="text-xs text-text-muted">
                                  Credit: {lead.prefilledData.creditScore}
                                </div>
                                <div className={cn(
                                  "text-xs font-medium",
                                  getRiskColor(lead.prefilledData.riskLevel)
                                )}>
                                  {lead.prefilledData.riskLevel} risk
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-text-muted">Pending</span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                          getStatusColor(lead.status)
                        )}>
                          {getStatusIcon(lead.status)}
                          <span>{lead.status.replace('_', ' ')}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <button className="text-accent hover:text-accent/80 transition-colors">
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredLeads.length === 0 && (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-text-muted mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">No leads found</h3>
                <p className="text-text-muted">
                  {searchTerm ? 'Try adjusting your search' : 'Upload a spreadsheet to get started'}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}