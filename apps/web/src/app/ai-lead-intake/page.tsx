"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileSpreadsheet, X, Bot, CheckCircle, AlertCircle, Clock, RefreshCw, Download, Filter, Search, ChevronRight, Sparkles, Users, TrendingUp, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import toast from 'react-hot-toast'
import MappingPreview from '@/components/leads/MappingPreview'
import LeadSidebar from '@/components/leads/LeadSidebar'

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
  stage: 'NEW' | 'RESEARCHING' | 'CONTACTED' | 'QUALIFYING' | 'INTERESTED' | 'NOT_INTERESTED' | 'CONVERTED' | 'LOST'
  researchStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'INSUFFICIENT_DATA'
  assignedTo?: {
    id: string
    firstName: string
    lastName: string
    isAIAgent: boolean
    aiType?: string
  }
  createdAt: string
  extraData?: Record<string, any>
}

interface AgentActivity {
  id: string
  name: string
  type: 'LEAD_PROCESSOR' | 'RESEARCHER'
  currentTask: string
  leadName: string
  progress: number
  startedAt: Date
}

type TabType = 'all' | 'NEW' | 'RESEARCHING' | 'CONTACTED' | 'QUALIFYING' | 'INTERESTED'

export default function AILeadIntakePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [showMappingPreview, setShowMappingPreview] = useState(false)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [mappingData, setMappingData] = useState<any>(null)
  const [activeAgents, setActiveAgents] = useState<AgentActivity[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  
  // Mock organization ID - in real app, get from auth context
  const organizationId = "org_123"

  // Statistics
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.stage === 'NEW').length,
    researching: leads.filter(l => l.stage === 'RESEARCHING').length,
    contacted: leads.filter(l => l.stage === 'CONTACTED').length,
    qualifying: leads.filter(l => l.stage === 'QUALIFYING').length,
    interested: leads.filter(l => l.stage === 'INTERESTED').length,
    converted: leads.filter(l => l.stage === 'CONVERTED').length,
  }

  const completionRate = stats.total > 0 ? Math.round(((stats.contacted + stats.qualifying + stats.interested + stats.converted) / stats.total) * 100) : 0

  // File upload handler  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) {
      console.log('[FILE_UPLOAD] No file selected')
      return
    }

    console.log(`[FILE_UPLOAD] Starting upload of file: ${file.name} (${file.size} bytes, type: ${file.type})`)
    const reader = new FileReader()
    
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100
        console.log(`[FILE_UPLOAD] Reading file progress: ${Math.round(progress)}%`)
        setUploadProgress(progress)
      }
    }

    reader.onload = async (e) => {
      console.log(`[FILE_UPLOAD] File read complete for ${file.name}`)
      const data = e.target?.result
      let parsedData: any[] = []

      if (file.name.endsWith('.csv')) {
        console.log('[FILE_UPLOAD] Parsing CSV file with Papa Parse')
        // Parse CSV
        Papa.parse(data as string, {
          header: true,
          complete: async (results) => {
            console.log(`[FILE_UPLOAD] Papa Parse complete. Raw rows: ${results.data.length}, errors: ${results.errors.length}`)
            if (results.errors.length > 0) {
              console.warn('[FILE_UPLOAD] Papa Parse errors:', results.errors)
            }
            
            parsedData = results.data.filter((row: any) => 
              Object.values(row).some(value => value && String(value).trim())
            )
            
            console.log(`[FILE_UPLOAD] Filtered to ${parsedData.length} valid rows`)
            
            if (parsedData.length === 0) {
              console.error('[FILE_UPLOAD] No valid data found in CSV after filtering')
              toast.error('No valid data found in CSV file')
              setUploadProgress(0)
              return
            }

            console.log('[FILE_UPLOAD] Sample parsed data:', parsedData.slice(0, 3))
            await handleParsedData(parsedData)
          },
          error: (error) => {
            console.error('[FILE_UPLOAD] Papa Parse error:', error)
            toast.error('Error parsing CSV file')
            setUploadProgress(0)
          }
        })
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        console.log('[FILE_UPLOAD] Parsing Excel file with XLSX')
        try {
          // Parse Excel
          const workbook = XLSX.read(data, { type: 'binary' })
          console.log(`[FILE_UPLOAD] Excel workbook loaded. Sheets: ${workbook.SheetNames.join(', ')}`)
          
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)
          
          console.log(`[FILE_UPLOAD] Excel sheet "${sheetName}" parsed to ${jsonData.length} rows`)
          
          parsedData = jsonData.filter((row: any) => 
            Object.values(row).some(value => value && String(value).trim())
          )
          
          console.log(`[FILE_UPLOAD] Filtered to ${parsedData.length} valid Excel rows`)
          
          if (parsedData.length === 0) {
            console.error('[FILE_UPLOAD] No valid data found in Excel after filtering')
            toast.error('No valid data found in Excel file')
            setUploadProgress(0)
            return
          }

          console.log('[FILE_UPLOAD] Sample Excel data:', parsedData.slice(0, 3))
          await handleParsedData(parsedData)
        } catch (excelError) {
          console.error('[FILE_UPLOAD] Error parsing Excel file:', excelError)
          toast.error('Error parsing Excel file')
          setUploadProgress(0)
        }
      }
    }

    if (file.name.endsWith('.csv')) {
      console.log('[FILE_UPLOAD] Reading CSV file as text')
      reader.readAsText(file)
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      console.log('[FILE_UPLOAD] Reading Excel file as binary string')
      reader.readAsBinaryString(file)
    } else {
      console.error(`[FILE_UPLOAD] Unsupported file type: ${file.name}`)
      toast.error('Please upload a CSV or Excel file')
    }
  }, [])

  // Handle parsed spreadsheet data - get mapping from API
  const handleParsedData = async (data: any[]) => {
    const requestId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log(`[FILE_UPLOAD] ${requestId} - Starting field mapping analysis for ${data.length} rows`)
    
    try {
      setUploadProgress(100)
      setParsedData(data)

      const headers = Object.keys(data[0] || {})
      console.log(`[FILE_UPLOAD] ${requestId} - Detected headers:`, headers)

      // Get field mapping from API
      console.log(`[FILE_UPLOAD] ${requestId} - Sending mapping request to API`)
      const mappingStartTime = Date.now()
      
      const response = await fetch('/api/leads/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          organizationId,
          confirmMapping: true
        })
      })

      const mappingTime = Date.now() - mappingStartTime
      console.log(`[FILE_UPLOAD] ${requestId} - API mapping request completed in ${mappingTime}ms`)
      
      if (!response.ok) {
        console.error(`[FILE_UPLOAD] ${requestId} - API mapping request failed:`, response.status, response.statusText)
        throw new Error('Failed to analyze headers')
      }

      const mappingResult = await response.json()
      console.log(`[FILE_UPLOAD] ${requestId} - Received mapping result:`, {
        mappingsCount: mappingResult.mappings?.length,
        unmappedCount: mappingResult.unmappedFields?.length,
        sampleDataCount: mappingResult.sampleData?.length
      })
      
      setMappingData(mappingResult)
      setShowMappingPreview(true)
      setUploadProgress(0)
      
      console.log(`[FILE_UPLOAD] ${requestId} - Mapping preview modal displayed`)
      
    } catch (error) {
      console.error(`[FILE_UPLOAD] ${requestId} - Error during field mapping analysis:`, error)
      toast.error('Failed to analyze spreadsheet data')
      setUploadProgress(0)
    }
  }

  // Confirm mapping and import leads
  const handleConfirmMapping = async (mappingOverrides?: Record<string, string>) => {
    const importId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log(`[FILE_UPLOAD] ${importId} - Starting confirmed import with ${parsedData.length} rows`)
    
    if (mappingOverrides && Object.keys(mappingOverrides).length > 0) {
      console.log(`[FILE_UPLOAD] ${importId} - Using ${Object.keys(mappingOverrides).length} mapping overrides:`, mappingOverrides)
    }
    
    try {
      setIsProcessing(true)
      setShowMappingPreview(false)
      
      console.log(`[FILE_UPLOAD] ${importId} - Sending import request to API`)
      const importStartTime = Date.now()
      
      const response = await fetch('/api/leads/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: parsedData,
          organizationId,
          mappingOverrides,
          autoAssign: true
        })
      })

      const importTime = Date.now() - importStartTime
      console.log(`[FILE_UPLOAD] ${importId} - Import request completed in ${importTime}ms`)
      
      if (!response.ok) {
        console.error(`[FILE_UPLOAD] ${importId} - Import request failed:`, response.status, response.statusText)
        throw new Error('Import failed')
      }

      const result = await response.json()
      console.log(`[FILE_UPLOAD] ${importId} - Import result:`, {
        success: result.success,
        imported: result.imported,
        failed: result.failed,
        batchId: result.batchId
      })
      
      if (result.success) {
        console.log(`[FILE_UPLOAD] ${importId} - Import successful: ${result.imported} leads imported, ${result.failed} failed`)
        toast.success(`Successfully imported ${result.imported} leads!`)
        if (result.failed > 0) {
          toast.error(`${result.failed} leads failed to import`)
        }
        
        // Refresh leads list
        console.log(`[FILE_UPLOAD] ${importId} - Refreshing leads list`)
        fetchLeads()
        
        // Start mock agent activity
        console.log(`[FILE_UPLOAD] ${importId} - Starting mock agent activity`)
        startMockAgentActivity()
      } else {
        console.error(`[FILE_UPLOAD] ${importId} - Import marked as failed in response`)
        toast.error('Import failed')
      }

    } catch (error) {
      console.error(`[FILE_UPLOAD] ${importId} - Error during import:`, error)
      toast.error('Failed to import leads')
    } finally {
      console.log(`[FILE_UPLOAD] ${importId} - Import process completed, cleaning up`)
      setIsProcessing(false)
      setParsedData([])
      setMappingData(null)
    }
  }

  // Fetch leads from API
  const fetchLeads = async () => {
    try {
      const response = await fetch(`/api/leads?organizationId=${organizationId}&limit=100`)
      if (response.ok) {
        const data = await response.json()
        const newLeads = data.leads || []
        
        // Check if any leads have changed status (particularly research status)
        const hasChanges = leads.length !== newLeads.length || 
          leads.some((oldLead, index) => {
            const newLead = newLeads[index]
            return !newLead || oldLead.researchStatus !== newLead.researchStatus || 
              oldLead.stage !== newLead.stage
          })
        
        if (hasChanges) {
          console.log('[LEAD_LIST] Leads updated - refreshing list')
        }
        
        setLeads(newLeads)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    }
  }

  // Trigger research for a specific lead
  const triggerResearch = async (leadId: string) => {
    try {
      console.log(`[RESEARCH_TRIGGER] Triggering research for lead: ${leadId}`)
      const response = await fetch(`/api/leads/${leadId}/research`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log(`[RESEARCH_TRIGGER] Research triggered successfully:`, result)
        toast.success('Research queued successfully!')
        
        // Refresh leads to show updated status
        setTimeout(() => fetchLeads(), 1000)
      } else {
        const error = await response.json()
        console.error(`[RESEARCH_TRIGGER] Failed to trigger research:`, error)
        toast.error('Failed to trigger research')
      }
    } catch (error) {
      console.error(`[RESEARCH_TRIGGER] Error triggering research:`, error)
      toast.error('Failed to trigger research')
    }
  }

  // Mock agent activity for demo
  const startMockAgentActivity = () => {
    const mockAgents: AgentActivity[] = [
      {
        id: 'agent-1',
        name: 'Research Agent Alpha',
        type: 'RESEARCHER',
        currentTask: 'Researching company info',
        leadName: 'TechFlow Solutions',
        progress: 65,
        startedAt: new Date()
      },
      {
        id: 'agent-2', 
        name: 'Processor Agent Beta',
        type: 'LEAD_PROCESSOR',
        currentTask: 'Initial qualification',
        leadName: 'Green Valley Restaurant',
        progress: 30,
        startedAt: new Date()
      }
    ]
    
    setActiveAgents(mockAgents)
    
    // Simulate progress updates
    const interval = setInterval(() => {
      setActiveAgents(prev => prev.map(agent => ({
        ...agent,
        progress: Math.min(100, agent.progress + Math.random() * 10)
      })).filter(agent => agent.progress < 100))
    }, 2000)
    
    // Clean up after 30 seconds
    setTimeout(() => {
      clearInterval(interval)
      setActiveAgents([])
    }, 30000)
  }

  // Load leads on component mount
  useEffect(() => {
    // Initial fetch
    fetchLeads()
    
    // Set up auto-refresh every 20 seconds
    console.log('[LEAD_LIST] Setting up auto-refresh every 20 seconds')
    const refreshInterval = setInterval(() => {
      fetchLeads()
    }, 20000)
    
    // Cleanup interval on unmount
    return () => {
      console.log('[LEAD_LIST] Cleaning up auto-refresh interval')
      clearInterval(refreshInterval)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    disabled: isProcessing || showMappingPreview
  })

  // Filter leads based on tab and search
  const filteredLeads = leads.filter(lead => {
    const matchesTab = activeTab === 'all' || lead.stage === activeTab
    const matchesSearch = !searchTerm || 
      `${lead.firstName || ''} ${lead.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesTab && matchesSearch
  })

  // Export leads
  const exportLeads = (leadsToExport: Lead[]) => {
    const csvContent = Papa.unparse(leadsToExport.map(lead => ({
      'First Name': lead.firstName,
      'Last Name': lead.lastName,
      'Business Name': lead.businessName,
      Email: lead.email || '',
      Phone: lead.phone,
      'Requested Amount': lead.requestedAmount,
      'Monthly Revenue': lead.monthlyRevenue,
      Industry: lead.industry,
      Stage: lead.stage,
      'Research Status': lead.researchStatus,
      'Assigned To': lead.assignedTo ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}` : 'Unassigned'
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

  const getStageIcon = (stage: Lead['stage']) => {
    switch (stage) {
      case 'NEW':
        return <Clock className="h-4 w-4" />
      case 'RESEARCHING':
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'CONTACTED':
        return <CheckCircle className="h-4 w-4" />
      case 'QUALIFYING':
        return <Users className="h-4 w-4" />
      case 'INTERESTED':
        return <TrendingUp className="h-4 w-4" />
      case 'NOT_INTERESTED':
        return <X className="h-4 w-4" />
      case 'CONVERTED':
        return <CheckCircle className="h-4 w-4" />
      case 'LOST':
        return <X className="h-4 w-4" />
    }
  }

  const getStageColor = (stage: Lead['stage']) => {
    switch (stage) {
      case 'NEW':
        return 'bg-surface-glass text-text-muted border-border-light'
      case 'RESEARCHING':
        return 'bg-accent/10 text-accent border-accent/20'
      case 'CONTACTED':
        return 'bg-primary/10 text-primary border-primary/20'
      case 'QUALIFYING':
        return 'bg-warning/10 text-warning border-warning/20'
      case 'INTERESTED':
        return 'bg-success/10 text-success border-success/20'
      case 'NOT_INTERESTED':
        return 'bg-danger/10 text-danger border-danger/20'
      case 'CONVERTED':
        return 'bg-success/10 text-success border-success/20'
      case 'LOST':
        return 'bg-danger/10 text-danger border-danger/20'
    }
  }

  return (
    <div className="space-y-6 relative">
      {/* Mapping Preview Modal */}
      {showMappingPreview && mappingData && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Review Field Mapping</h2>
              <p className="text-text-muted mt-1">AI has analyzed your spreadsheet headers. Review and adjust the mapping below.</p>
            </div>
            <div className="overflow-y-auto max-h-[70vh]">
              <MappingPreview
                mappings={mappingData.mappings}
                unmappedFields={mappingData.unmappedFields}
                sampleData={mappingData.sampleData}
                totalRows={parsedData.length}
                onConfirm={handleConfirmMapping}
                onCancel={() => {
                  setShowMappingPreview(false)
                  setMappingData(null)
                  setParsedData([])
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 text-text-primary flex items-center gap-3">
            AI Lead Intake
            <div className="px-2 py-1 bg-accent/20 rounded-full">
              <Sparkles className="h-5 w-5 text-accent animate-pulse" />
            </div>
          </h1>
          <p className="text-text-muted mt-1">Upload spreadsheets for intelligent field mapping and AI agent processing</p>
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
            <span className="text-2xl font-bold text-text-primary">{stats.new}</span>
          </div>
          <div className="text-sm text-text-muted mt-1">New</div>
        </div>

        <div className="bg-card rounded-card p-4 shadow-card card-hover">
          <div className="flex items-center justify-between">
            <RefreshCw className="h-5 w-5 text-accent" />
            <span className="text-2xl font-bold text-text-primary">{stats.researching}</span>
          </div>
          <div className="text-sm text-text-muted mt-1">Researching</div>
        </div>

        <div className="bg-card rounded-card p-4 shadow-card card-hover">
          <div className="flex items-center justify-between">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold text-text-primary">{stats.contacted}</span>
          </div>
          <div className="text-sm text-text-muted mt-1">Contacted</div>
        </div>

        <div className="bg-card rounded-card p-4 shadow-card card-hover">
          <div className="flex items-center justify-between">
            <Users className="h-5 w-5 text-warning" />
            <span className="text-2xl font-bold text-text-primary">{stats.qualifying}</span>
          </div>
          <div className="text-sm text-text-muted mt-1">Qualifying</div>
        </div>

        <div className="bg-card rounded-card p-4 shadow-card card-hover">
          <div className="flex items-center justify-between">
            <TrendingUp className="h-5 w-5 text-success" />
            <span className="text-2xl font-bold text-text-primary">{stats.interested}</span>
          </div>
          <div className="text-sm text-text-muted mt-1">Interested</div>
        </div>
      </div>

      {/* Upload Zone and Agent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Zone */}
        <div className="lg:col-span-2">
          <div
            {...getRootProps()}
            className={cn(
              "bg-card rounded-card p-12 shadow-card border-2 border-dashed transition-all cursor-pointer",
              isDragActive ? "border-accent bg-accent/5" : "border-border-light hover:border-accent/50",
              (isProcessing || showMappingPreview) && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                  {isProcessing ? (
                    <Loader2 className="h-8 w-8 text-accent animate-spin" />
                  ) : (
                    <Upload className="h-8 w-8 text-accent" />
                  )}
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
                  {isProcessing ? 'Processing leads...' :
                   isDragActive ? 'Drop your file here' : 'Drag & drop your spreadsheet'}
                </h3>
                <p className="text-sm text-text-muted">
                  {isProcessing ? 'AI agents are processing your leads' :
                   'or click to browse • CSV or Excel files supported'}
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
                  <span>AI Mapping</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Activity Panel */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-card p-6 shadow-card">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
              <Bot className="h-5 w-5 text-accent" />
              AI Agents
            </h3>
            
            {activeAgents.length > 0 ? (
              <div className="space-y-4">
                {activeAgents.map(agent => (
                  <div key={agent.id} className="border border-border-light rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-accent animate-pulse" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-text-primary text-sm">
                          {agent.name}
                        </div>
                        <div className="text-xs text-text-muted mt-1">
                          {agent.currentTask}
                        </div>
                        <div className="text-xs text-text-secondary">
                          Working on: {agent.leadName}
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-text-muted mb-1">
                            <span>Progress</span>
                            <span>{Math.round(agent.progress)}%</span>
                          </div>
                          <div className="w-full bg-surface-glass rounded-full h-1.5">
                            <div 
                              className="bg-accent h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${agent.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 text-text-muted mx-auto mb-3 opacity-50" />
                <p className="text-sm text-text-muted">
                  {isProcessing ? 'Starting agents...' : 'No active agents'}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Upload a spreadsheet to see agents in action
                </p>
              </div>
            )}
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
                  {(['all', 'NEW', 'RESEARCHING', 'CONTACTED', 'QUALIFYING', 'INTERESTED'] as TabType[]).map((tab) => (
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
                      {tab === 'all' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                      {tab !== 'all' && (
                        <span className="ml-2 text-xs opacity-80">
                          ({stats[tab.toLowerCase() as keyof typeof stats]})
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Lead Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Business Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-surface-hover transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-text-primary">
                            {lead.firstName || lead.lastName ? 
                              `${lead.firstName || ''} ${lead.lastName || ''}`.trim() : 
                              'Unknown Name'}
                          </div>
                          {lead.businessName && (
                            <div className="text-sm text-text-muted">{lead.businessName}</div>
                          )}
                          {lead.industry && (
                            <div className="text-xs text-text-muted mt-1 inline-block bg-surface-glass px-2 py-1 rounded">
                              {lead.industry}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-text-primary">{lead.email || 'No email provided'}</div>
                          {lead.phone && (
                            <div className="text-text-muted">{lead.phone}</div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div>
                          {lead.requestedAmount && (
                            <div className="font-medium text-text-primary">
                              ${lead.requestedAmount.toLocaleString()} requested
                            </div>
                          )}
                          {lead.monthlyRevenue && (
                            <div className="text-sm text-text-muted">
                              ${lead.monthlyRevenue.toLocaleString()}/mo revenue
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        {lead.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                              lead.assignedTo.isAIAgent 
                                ? "bg-accent/20 text-accent" 
                                : "bg-primary/20 text-primary"
                            )}>
                              {lead.assignedTo.isAIAgent ? <Bot className="h-3 w-3" /> : 
                               lead.assignedTo.firstName?.[0] || '?'}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-text-primary">
                                {lead.assignedTo.firstName} {lead.assignedTo.lastName}
                              </div>
                              {lead.assignedTo.isAIAgent && (
                                <div className="text-xs text-text-muted">
                                  AI {lead.assignedTo.aiType?.replace('_', ' ')}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-text-muted">Unassigned</span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                            getStageColor(lead.stage)
                          )}>
                            {getStageIcon(lead.stage)}
                            <span>{lead.stage.replace('_', ' ')}</span>
                          </div>
                          
                          <div className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border mt-1",
                            lead.researchStatus === 'PENDING' && "bg-yellow-50 text-yellow-700 border-yellow-200",
                            lead.researchStatus === 'IN_PROGRESS' && "bg-blue-50 text-blue-700 border-blue-200",
                            lead.researchStatus === 'COMPLETED' && "bg-green-50 text-green-700 border-green-200",
                            lead.researchStatus === 'FAILED' && "bg-red-50 text-red-700 border-red-200"
                          )}>
                            {lead.researchStatus === 'IN_PROGRESS' && <RefreshCw className="h-3 w-3 animate-spin" />}
                            {lead.researchStatus === 'COMPLETED' && <CheckCircle className="h-3 w-3" />}
                            {lead.researchStatus === 'FAILED' && <AlertCircle className="h-3 w-3" />}
                            {lead.researchStatus === 'PENDING' && <Clock className="h-3 w-3" />}
                            <span>Research: {lead.researchStatus.toLowerCase()}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* Research Trigger Button */}
                          {(lead.researchStatus === 'PENDING' || lead.researchStatus === 'FAILED') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                triggerResearch(lead.id)
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 rounded border border-accent/20 transition-colors"
                              title="Trigger Research"
                            >
                              <Bot className="h-3 w-3" />
                              Research
                            </button>
                          )}
                          
                          {lead.researchStatus === 'IN_PROGRESS' && (
                            <div className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              Researching...
                            </div>
                          )}
                          
                          <button 
                            onClick={() => setSelectedLead(lead)}
                            className="text-accent hover:text-accent/80 transition-colors"
                            title="View Details"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
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

      {/* Lead Sidebar */}
      <LeadSidebar 
        lead={selectedLead} 
        onClose={() => setSelectedLead(null)} 
      />
    </div>
  )
}