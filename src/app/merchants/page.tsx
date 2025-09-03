"use client"

import React, { useState } from 'react'
import { Search, Plus, Filter, MoreVertical, Building2, MapPin, Phone, Mail, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Merchant {
  id: string
  businessName: string
  ownerName: string
  industry: string
  location: string
  phone: string
  email: string
  totalFunded: number
  activeFunding: number
  riskScore: number
  status: 'active' | 'inactive' | 'flagged' | 'pending'
  lastActivity: string
  monthlyRevenue: number
  revenueChange: number
  deals: number
}

const merchants: Merchant[] = [
  {
    id: 'M001',
    businessName: 'TechFlow Solutions',
    ownerName: 'Michael Chen',
    industry: 'Technology',
    location: 'San Francisco, CA',
    phone: '+1 (555) 123-4567',
    email: 'michael@techflow.com',
    totalFunded: 450000,
    activeFunding: 125000,
    riskScore: 7.2,
    status: 'flagged',
    lastActivity: '2 hours ago',
    monthlyRevenue: 85000,
    revenueChange: -12,
    deals: 3
  },
  {
    id: 'M002',
    businessName: 'Green Valley Restaurant',
    ownerName: 'Sarah Martinez',
    industry: 'Restaurant',
    location: 'Austin, TX',
    phone: '+1 (555) 234-5678',
    email: 'sarah@greenvalley.com',
    totalFunded: 180000,
    activeFunding: 85000,
    riskScore: 4.1,
    status: 'active',
    lastActivity: '1 day ago',
    monthlyRevenue: 42000,
    revenueChange: 18,
    deals: 2
  },
  {
    id: 'M003',
    businessName: 'Metro Construction LLC',
    ownerName: 'David Rodriguez',
    industry: 'Construction',
    location: 'Miami, FL',
    phone: '+1 (555) 345-6789',
    email: 'david@metroconstruct.com',
    totalFunded: 750000,
    activeFunding: 200000,
    riskScore: 2.8,
    status: 'active',
    lastActivity: '3 hours ago',
    monthlyRevenue: 125000,
    revenueChange: 34,
    deals: 4
  },
  {
    id: 'M004',
    businessName: 'Fashion Forward Boutique',
    ownerName: 'Emma Thompson',
    industry: 'Retail',
    location: 'New York, NY',
    phone: '+1 (555) 456-7890',
    email: 'emma@fashionforward.com',
    totalFunded: 95000,
    activeFunding: 35000,
    riskScore: 5.9,
    status: 'active',
    lastActivity: '5 hours ago',
    monthlyRevenue: 28000,
    revenueChange: 8,
    deals: 1
  },
  {
    id: 'M005',
    businessName: 'Digital Marketing Hub',
    ownerName: 'James Wilson',
    industry: 'Marketing',
    location: 'Chicago, IL',
    phone: '+1 (555) 567-8901',
    email: 'james@digitalmarketing.com',
    totalFunded: 320000,
    activeFunding: 0,
    riskScore: 3.4,
    status: 'inactive',
    lastActivity: '2 weeks ago',
    monthlyRevenue: 65000,
    revenueChange: -5,
    deals: 2
  },
  {
    id: 'M006',
    businessName: 'Wellness Center Plus',
    ownerName: 'Lisa Park',
    industry: 'Healthcare',
    location: 'Seattle, WA',
    phone: '+1 (555) 678-9012',
    email: 'lisa@wellnesscenter.com',
    totalFunded: 0,
    activeFunding: 0,
    riskScore: 6.1,
    status: 'pending',
    lastActivity: '1 hour ago',
    monthlyRevenue: 35000,
    revenueChange: 22,
    deals: 0
  }
]

const getStatusConfig = (status: Merchant['status']) => {
  switch (status) {
    case 'active':
      return { color: 'text-success', bgColor: 'bg-success/20', icon: CheckCircle }
    case 'inactive':
      return { color: 'text-text-muted', bgColor: 'bg-surface-glass', icon: MoreVertical }
    case 'flagged':
      return { color: 'text-danger', bgColor: 'bg-danger/20', icon: AlertTriangle }
    case 'pending':
      return { color: 'text-warning', bgColor: 'bg-warning/20', icon: TrendingUp }
  }
}

const getRiskColor = (score: number) => {
  if (score <= 3) return 'text-success'
  if (score <= 6) return 'text-warning'
  return 'text-danger'
}

export default function MerchantsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null)

  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch = merchant.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.industry.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || merchant.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const totalMerchants = merchants.length
  const activeMerchants = merchants.filter(m => m.status === 'active').length
  const flaggedMerchants = merchants.filter(m => m.status === 'flagged').length
  const totalFunded = merchants.reduce((sum, m) => sum + m.totalFunded, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 text-text-primary">Merchants</h1>
          <p className="text-text-muted mt-1">Manage your merchant portfolio and relationships</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Merchant
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-card p-6 shadow-card card-hover">
          <div className="flex items-center justify-between mb-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold text-text-primary">{totalMerchants}</span>
          </div>
          <div className="text-sm text-text-muted">Total Merchants</div>
        </div>

        <div className="bg-card rounded-card p-6 shadow-card card-hover">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <span className="text-2xl font-bold text-text-primary">{activeMerchants}</span>
          </div>
          <div className="text-sm text-text-muted">Active</div>
        </div>

        <div className="bg-card rounded-card p-6 shadow-card card-hover">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-5 w-5 text-danger" />
            <span className="text-2xl font-bold text-text-primary">{flaggedMerchants}</span>
          </div>
          <div className="text-sm text-text-muted">Flagged</div>
        </div>

        <div className="bg-card rounded-card p-6 shadow-card card-hover">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            <span className="text-2xl font-bold text-text-primary">${(totalFunded / 1000000).toFixed(1)}M</span>
          </div>
          <div className="text-sm text-text-muted">Total Funded</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-card rounded-card p-4 shadow-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search merchants by name, owner, or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-glass border border-border-light rounded-button text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-surface-glass border border-border-light rounded-button text-sm focus:outline-none focus:border-accent transition-colors"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="flagged">Flagged</option>
              <option value="pending">Pending</option>
            </select>
            
            <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-glass border border-border-light rounded-button text-sm hover:bg-surface-hover transition-colors">
              <Filter className="h-4 w-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Merchants Table */}
      <div className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-glass border-b border-border-light">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Industry & Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Funding
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Risk Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredMerchants.map((merchant) => {
                const statusConfig = getStatusConfig(merchant.status)
                const StatusIcon = statusConfig.icon

                return (
                  <tr key={merchant.id} className="hover:bg-surface-hover transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-text-primary">{merchant.businessName}</div>
                        <div className="text-sm text-text-muted">{merchant.ownerName}</div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {merchant.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {merchant.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-text-primary">{merchant.industry}</div>
                        <div className="flex items-center gap-1 text-sm text-text-muted">
                          <MapPin className="h-3 w-3" />
                          {merchant.location}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-text-primary">
                          ${merchant.totalFunded.toLocaleString()}
                        </div>
                        <div className="text-sm text-text-muted">
                          Active: ${merchant.activeFunding.toLocaleString()}
                        </div>
                        <div className="text-xs text-text-muted">
                          {merchant.deals} deal{merchant.deals !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-text-primary">
                          ${merchant.monthlyRevenue.toLocaleString()}/mo
                        </div>
                        <div className={cn(
                          "flex items-center gap-1 text-sm",
                          merchant.revenueChange >= 0 ? "text-success" : "text-danger"
                        )}>
                          {merchant.revenueChange >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {Math.abs(merchant.revenueChange)}%
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className={cn(
                        "font-medium",
                        getRiskColor(merchant.riskScore)
                      )}>
                        {merchant.riskScore}/10
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                        statusConfig.bgColor,
                        statusConfig.color
                      )}>
                        <StatusIcon className="h-3 w-3" />
                        {merchant.status}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <button className="p-1 hover:bg-surface-hover rounded-button transition-colors">
                        <MoreVertical className="h-4 w-4 text-text-muted" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredMerchants.length === 0 && (
        <div className="bg-card rounded-card p-12 text-center shadow-card">
          <Building2 className="h-12 w-12 text-text-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">No merchants found</h3>
          <p className="text-text-muted mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search criteria or filters'
              : 'Get started by adding your first merchant'
            }
          </p>
          <button className="btn-primary">
            Add Merchant
          </button>
        </div>
      )}
    </div>
  )
}