"use client"

import React, { useState } from 'react'
import { Search, Plus, Filter, MoreVertical, Handshake, TrendingUp, TrendingDown, DollarSign, Star, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Broker {
  id: string
  name: string
  company: string
  email: string
  phone: string
  location: string
  dealsSent: number
  dealsApproved: number
  totalVolume: number
  commissionPaid: number
  rating: number
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  lastActivity: string
  avgDealSize: number
  conversionRate: number
  tier: 'gold' | 'silver' | 'bronze' | 'new'
  specialties: string[]
}

const brokers: Broker[] = [
  {
    id: 'B001',
    name: 'Marcus Johnson',
    company: 'Johnson Capital Solutions',
    email: 'marcus@johnsoncapital.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    dealsSent: 127,
    dealsApproved: 89,
    totalVolume: 2450000,
    commissionPaid: 73500,
    rating: 4.8,
    status: 'active',
    lastActivity: '2 hours ago',
    avgDealSize: 85000,
    conversionRate: 70,
    tier: 'gold',
    specialties: ['Restaurant', 'Retail', 'Construction']
  },
  {
    id: 'B002',
    name: 'Sarah Chen',
    company: 'Prime Funding Group',
    email: 'sarah@primefunding.com',
    phone: '+1 (555) 234-5678',
    location: 'Los Angeles, CA',
    dealsSent: 98,
    dealsApproved: 71,
    totalVolume: 1875000,
    commissionPaid: 56250,
    rating: 4.6,
    status: 'active',
    lastActivity: '1 day ago',
    avgDealSize: 72000,
    conversionRate: 72,
    tier: 'gold',
    specialties: ['Technology', 'Healthcare', 'Professional Services']
  },
  {
    id: 'B003',
    name: 'David Rodriguez',
    company: 'Elite Business Finance',
    email: 'david@elitebusiness.com',
    phone: '+1 (555) 345-6789',
    location: 'Miami, FL',
    dealsSent: 156,
    dealsApproved: 94,
    totalVolume: 3200000,
    commissionPaid: 96000,
    rating: 4.9,
    status: 'active',
    lastActivity: '30 minutes ago',
    avgDealSize: 125000,
    conversionRate: 60,
    tier: 'gold',
    specialties: ['Construction', 'Manufacturing', 'Transportation']
  },
  {
    id: 'B004',
    name: 'Emma Thompson',
    company: 'Thompson Associates',
    email: 'emma@thompsonassoc.com',
    phone: '+1 (555) 456-7890',
    location: 'Chicago, IL',
    dealsSent: 64,
    dealsApproved: 38,
    totalVolume: 950000,
    commissionPaid: 28500,
    rating: 4.2,
    status: 'active',
    lastActivity: '3 hours ago',
    avgDealSize: 45000,
    conversionRate: 59,
    tier: 'silver',
    specialties: ['Retail', 'Food Service', 'Beauty & Wellness']
  },
  {
    id: 'B005',
    name: 'James Wilson',
    company: 'Wilson Finance Partners',
    email: 'james@wilsonfinance.com',
    phone: '+1 (555) 567-8901',
    location: 'Dallas, TX',
    dealsSent: 89,
    dealsApproved: 45,
    totalVolume: 1350000,
    commissionPaid: 40500,
    rating: 3.8,
    status: 'active',
    lastActivity: '5 hours ago',
    avgDealSize: 55000,
    conversionRate: 51,
    tier: 'silver',
    specialties: ['Oil & Gas', 'Agriculture', 'Real Estate']
  },
  {
    id: 'B006',
    name: 'Lisa Park',
    company: 'Park Capital Advisors',
    email: 'lisa@parkcapital.com',
    phone: '+1 (555) 678-9012',
    location: 'Seattle, WA',
    dealsSent: 23,
    dealsApproved: 12,
    totalVolume: 420000,
    commissionPaid: 12600,
    rating: 4.1,
    status: 'pending',
    lastActivity: '1 week ago',
    avgDealSize: 38000,
    conversionRate: 52,
    tier: 'new',
    specialties: ['Technology', 'E-commerce']
  }
]

const getTierConfig = (tier: Broker['tier']) => {
  switch (tier) {
    case 'gold':
      return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Award }
    case 'silver':
      return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Star }
    case 'bronze':
      return { color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Star }
    case 'new':
      return { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Star }
  }
}

const getStatusConfig = (status: Broker['status']) => {
  switch (status) {
    case 'active':
      return { color: 'text-success', bgColor: 'bg-success/20' }
    case 'inactive':
      return { color: 'text-text-muted', bgColor: 'bg-surface-glass' }
    case 'pending':
      return { color: 'text-warning', bgColor: 'bg-warning/20' }
    case 'suspended':
      return { color: 'text-danger', bgColor: 'bg-danger/20' }
  }
}

export default function BrokersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterTier, setFilterTier] = useState('all')

  const filteredBrokers = brokers.filter(broker => {
    const matchesSearch = broker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         broker.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         broker.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || broker.status === filterStatus
    const matchesTier = filterTier === 'all' || broker.tier === filterTier
    return matchesSearch && matchesStatus && matchesTier
  })

  const totalBrokers = brokers.length
  const activeBrokers = brokers.filter(b => b.status === 'active').length
  const totalVolume = brokers.reduce((sum, b) => sum + b.totalVolume, 0)
  const totalCommissions = brokers.reduce((sum, b) => sum + b.commissionPaid, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 text-text-primary">Brokers & ISOs</h1>
          <p className="text-text-muted mt-1">Manage broker relationships and track performance</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Broker
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-card p-6 shadow-card card-hover">
          <div className="flex items-center justify-between mb-2">
            <Handshake className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold text-text-primary">{totalBrokers}</span>
          </div>
          <div className="text-sm text-text-muted">Total Brokers</div>
        </div>

        <div className="bg-card rounded-card p-6 shadow-card card-hover">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-success" />
            <span className="text-2xl font-bold text-text-primary">{activeBrokers}</span>
          </div>
          <div className="text-sm text-text-muted">Active</div>
        </div>

        <div className="bg-card rounded-card p-6 shadow-card card-hover">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 text-accent" />
            <span className="text-2xl font-bold text-text-primary">${(totalVolume / 1000000).toFixed(1)}M</span>
          </div>
          <div className="text-sm text-text-muted">Total Volume</div>
        </div>

        <div className="bg-card rounded-card p-6 shadow-card card-hover">
          <div className="flex items-center justify-between mb-2">
            <Award className="h-5 w-5 text-warning" />
            <span className="text-2xl font-bold text-text-primary">${(totalCommissions / 1000).toFixed(0)}K</span>
          </div>
          <div className="text-sm text-text-muted">Commissions Paid</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-card rounded-card p-4 shadow-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search brokers by name, company, or email..."
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
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-4 py-2.5 bg-surface-glass border border-border-light rounded-button text-sm focus:outline-none focus:border-accent transition-colors"
            >
              <option value="all">All Tiers</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="bronze">Bronze</option>
              <option value="new">New</option>
            </select>
            
            <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-glass border border-border-light rounded-button text-sm hover:bg-surface-hover transition-colors">
              <Filter className="h-4 w-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Brokers Table */}
      <div className="bg-card rounded-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-glass border-b border-border-light">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Broker
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Volume & Commission
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Rating & Tier
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Specialties
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
              {filteredBrokers.map((broker) => {
                const statusConfig = getStatusConfig(broker.status)
                const tierConfig = getTierConfig(broker.tier)
                const TierIcon = tierConfig.icon

                return (
                  <tr key={broker.id} className="hover:bg-surface-hover transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-text-primary">{broker.name}</div>
                        <div className="text-sm text-text-muted">{broker.company}</div>
                        <div className="text-xs text-text-muted mt-1">
                          {broker.location} • {broker.lastActivity}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-text-primary">
                          {broker.dealsApproved}/{broker.dealsSent} deals
                        </div>
                        <div className="text-sm text-text-muted">
                          {broker.conversionRate}% conversion
                        </div>
                        <div className="text-xs text-text-muted">
                          Avg: ${broker.avgDealSize.toLocaleString()}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-text-primary">
                          ${broker.totalVolume.toLocaleString()}
                        </div>
                        <div className="text-sm text-success">
                          ${broker.commissionPaid.toLocaleString()} paid
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-3 w-3",
                                i < Math.floor(broker.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-text-primary">
                          {broker.rating}
                        </span>
                      </div>
                      <div className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium capitalize",
                        tierConfig.bgColor,
                        tierConfig.color
                      )}>
                        <TierIcon className="h-3 w-3" />
                        {broker.tier}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {broker.specialties.slice(0, 2).map((specialty, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-surface-glass text-xs text-text-secondary rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                        {broker.specialties.length > 2 && (
                          <span className="px-2 py-1 bg-surface-glass text-xs text-text-secondary rounded-full">
                            +{broker.specialties.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize",
                        statusConfig.bgColor,
                        statusConfig.color
                      )}>
                        {broker.status}
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

      {filteredBrokers.length === 0 && (
        <div className="bg-card rounded-card p-12 text-center shadow-card">
          <Handshake className="h-12 w-12 text-text-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">No brokers found</h3>
          <p className="text-text-muted mb-4">
            {searchTerm || filterStatus !== 'all' || filterTier !== 'all'
              ? 'Try adjusting your search criteria or filters'
              : 'Get started by adding your first broker'
            }
          </p>
          <button className="btn-primary">
            Add Broker
          </button>
        </div>
      )}
    </div>
  )
}