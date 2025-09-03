"use client"

import React, { useState } from 'react'
import { Search, Plus, Filter, MoreVertical, Users, Phone, Mail, MapPin, Building2, Calendar, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  company?: string
  position?: string
  location: string
  type: 'merchant' | 'broker' | 'lead' | 'partner' | 'vendor'
  status: 'active' | 'inactive' | 'potential' | 'blocked'
  lastContact: string
  source: 'referral' | 'website' | 'event' | 'cold_outreach' | 'social_media' | 'advertisement'
  tags: string[]
  notes: string
  avatar?: string
  dealsPotential?: number
  relationshipScore: number
}

const contacts: Contact[] = [
  {
    id: 'C001',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael@techflow.com',
    phone: '+1 (555) 123-4567',
    company: 'TechFlow Solutions',
    position: 'CEO',
    location: 'San Francisco, CA',
    type: 'merchant',
    status: 'active',
    lastContact: '2 days ago',
    source: 'referral',
    tags: ['High Value', 'Technology', 'Repeat Customer'],
    notes: 'Excellent payment history, looking to expand operations',
    relationshipScore: 9,
    dealsPotential: 3
  },
  {
    id: 'C002',
    firstName: 'Sarah',
    lastName: 'Martinez',
    email: 'sarah@greenvalley.com',
    phone: '+1 (555) 234-5678',
    company: 'Green Valley Restaurant',
    position: 'Owner',
    location: 'Austin, TX',
    type: 'merchant',
    status: 'active',
    lastContact: '1 week ago',
    source: 'website',
    tags: ['Restaurant', 'Seasonal Business', 'Local'],
    notes: 'Seasonal fluctuations, strong summer performance',
    relationshipScore: 8,
    dealsPotential: 1
  },
  {
    id: 'C003',
    firstName: 'Marcus',
    lastName: 'Johnson',
    email: 'marcus@johnsoncapital.com',
    phone: '+1 (555) 345-6789',
    company: 'Johnson Capital Solutions',
    position: 'Senior Broker',
    location: 'New York, NY',
    type: 'broker',
    status: 'active',
    lastContact: '3 hours ago',
    source: 'event',
    tags: ['Top Producer', 'Gold Tier', 'Construction Specialist'],
    notes: 'Consistently brings quality deals, excellent relationship',
    relationshipScore: 10,
    dealsPotential: 8
  },
  {
    id: 'C004',
    firstName: 'Emma',
    lastName: 'Thompson',
    email: 'emma@fashionforward.com',
    phone: '+1 (555) 456-7890',
    company: 'Fashion Forward Boutique',
    position: 'Founder',
    location: 'New York, NY',
    type: 'lead',
    status: 'potential',
    lastContact: '2 weeks ago',
    source: 'social_media',
    tags: ['Retail', 'Small Business', 'First Time'],
    notes: 'Interested in first-time funding, needs education on process',
    relationshipScore: 5,
    dealsPotential: 1
  },
  {
    id: 'C005',
    firstName: 'David',
    lastName: 'Rodriguez',
    email: 'david@metroconstruct.com',
    phone: '+1 (555) 567-8901',
    company: 'Metro Construction LLC',
    position: 'Operations Manager',
    location: 'Miami, FL',
    type: 'merchant',
    status: 'active',
    lastContact: '4 days ago',
    source: 'referral',
    tags: ['Construction', 'Large Scale', 'Growth Phase'],
    notes: 'Expanding rapidly, needs working capital for new projects',
    relationshipScore: 9,
    dealsPotential: 5
  },
  {
    id: 'C006',
    firstName: 'Lisa',
    lastName: 'Park',
    email: 'lisa@wellnesscenter.com',
    phone: '+1 (555) 678-9012',
    company: 'Wellness Center Plus',
    position: 'Director',
    location: 'Seattle, WA',
    type: 'lead',
    status: 'potential',
    lastContact: '1 month ago',
    source: 'advertisement',
    tags: ['Healthcare', 'Wellness', 'New Business'],
    notes: 'New business, limited credit history but strong concept',
    relationshipScore: 6,
    dealsPotential: 2
  },
  {
    id: 'C007',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james@digitalmarketing.com',
    phone: '+1 (555) 789-0123',
    company: 'Digital Marketing Hub',
    position: 'Founder',
    location: 'Chicago, IL',
    type: 'partner',
    status: 'active',
    lastContact: '5 days ago',
    source: 'event',
    tags: ['Marketing', 'Digital', 'Partnership'],
    notes: 'Potential referral partner, runs marketing for small businesses',
    relationshipScore: 7,
    dealsPotential: 0
  },
  {
    id: 'C008',
    firstName: 'Rachel',
    lastName: 'Kim',
    email: 'rachel@legalservices.com',
    phone: '+1 (555) 890-1234',
    company: 'Kim Legal Services',
    position: 'Partner',
    location: 'Boston, MA',
    type: 'vendor',
    status: 'active',
    lastContact: '1 week ago',
    source: 'referral',
    tags: ['Legal', 'Compliance', 'Vendor'],
    notes: 'Legal counsel for complex deals, excellent service',
    relationshipScore: 8,
    dealsPotential: 0
  }
]

const getTypeConfig = (type: Contact['type']) => {
  switch (type) {
    case 'merchant':
      return { color: 'text-primary', bgColor: 'bg-primary/20', icon: Building2 }
    case 'broker':
      return { color: 'text-accent', bgColor: 'bg-accent/20', icon: Users }
    case 'lead':
      return { color: 'text-warning', bgColor: 'bg-warning/20', icon: Tag }
    case 'partner':
      return { color: 'text-success', bgColor: 'bg-success/20', icon: Users }
    case 'vendor':
      return { color: 'text-text-muted', bgColor: 'bg-surface-glass', icon: Building2 }
  }
}

const getStatusConfig = (status: Contact['status']) => {
  switch (status) {
    case 'active':
      return { color: 'text-success', bgColor: 'bg-success/20' }
    case 'inactive':
      return { color: 'text-text-muted', bgColor: 'bg-surface-glass' }
    case 'potential':
      return { color: 'text-warning', bgColor: 'bg-warning/20' }
    case 'blocked':
      return { color: 'text-danger', bgColor: 'bg-danger/20' }
  }
}

const getScoreColor = (score: number) => {
  if (score >= 8) return 'text-success'
  if (score >= 6) return 'text-warning'
  return 'text-danger'
}

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = filterType === 'all' || contact.type === filterType
    const matchesStatus = filterStatus === 'all' || contact.status === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  const totalContacts = contacts.length
  const activeContacts = contacts.filter(c => c.status === 'active').length
  const potentialDeals = contacts.reduce((sum, c) => sum + (c.dealsPotential || 0), 0)
  const avgRelationshipScore = contacts.reduce((sum, c) => sum + c.relationshipScore, 0) / contacts.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 text-text-primary">Contacts</h1>
          <p className="text-text-muted mt-1">Manage your business relationships and network</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Contact
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-card p-6 shadow-card card-hover">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold text-text-primary">{totalContacts}</span>
          </div>
          <div className="text-sm text-text-muted">Total Contacts</div>
        </div>

        <div className="bg-card rounded-card p-6 shadow-card card-hover">
          <div className="flex items-center justify-between mb-2">
            <Phone className="h-5 w-5 text-success" />
            <span className="text-2xl font-bold text-text-primary">{activeContacts}</span>
          </div>
          <div className="text-sm text-text-muted">Active</div>
        </div>

        <div className="bg-card rounded-card p-6 shadow-card card-hover">
          <div className="flex items-center justify-between mb-2">
            <Tag className="h-5 w-5 text-warning" />
            <span className="text-2xl font-bold text-text-primary">{potentialDeals}</span>
          </div>
          <div className="text-sm text-text-muted">Potential Deals</div>
        </div>

        <div className="bg-card rounded-card p-6 shadow-card card-hover">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-5 w-5 text-accent" />
            <span className="text-2xl font-bold text-text-primary">{avgRelationshipScore.toFixed(1)}</span>
          </div>
          <div className="text-sm text-text-muted">Avg Relationship Score</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-card rounded-card p-4 shadow-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search contacts by name, company, email, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-glass border border-border-light rounded-button text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 bg-surface-glass border border-border-light rounded-button text-sm focus:outline-none focus:border-accent transition-colors"
            >
              <option value="all">All Types</option>
              <option value="merchant">Merchants</option>
              <option value="broker">Brokers</option>
              <option value="lead">Leads</option>
              <option value="partner">Partners</option>
              <option value="vendor">Vendors</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-surface-glass border border-border-light rounded-button text-sm focus:outline-none focus:border-accent transition-colors"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="potential">Potential</option>
              <option value="blocked">Blocked</option>
            </select>
            
            <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-glass border border-border-light rounded-button text-sm hover:bg-surface-hover transition-colors">
              <Filter className="h-4 w-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => {
          const typeConfig = getTypeConfig(contact.type)
          const statusConfig = getStatusConfig(contact.status)
          const TypeIcon = typeConfig.icon

          return (
            <div key={contact.id} className="bg-card rounded-card p-6 shadow-card card-hover border border-border-light hover:border-accent/30 transition-all">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    typeConfig.bgColor
                  )}>
                    <TypeIcon className={cn("h-5 w-5", typeConfig.color)} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      {contact.firstName} {contact.lastName}
                    </h3>
                    {contact.position && contact.company && (
                      <p className="text-xs text-text-muted">
                        {contact.position} at {contact.company}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium capitalize",
                    typeConfig.bgColor,
                    typeConfig.color
                  )}>
                    {contact.type}
                  </div>
                  <button className="p-1 hover:bg-surface-hover rounded-button transition-colors">
                    <MoreVertical className="h-4 w-4 text-text-muted" />
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{contact.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Phone className="h-3 w-3" />
                  <span>{contact.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <MapPin className="h-3 w-3" />
                  <span>{contact.location}</span>
                </div>
              </div>

              {/* Tags */}
              {contact.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-surface-glass text-xs text-text-secondary rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {contact.tags.length > 3 && (
                      <span className="px-2 py-1 bg-surface-glass text-xs text-text-secondary rounded-full">
                        +{contact.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-2 bg-surface-glass rounded-button">
                  <div className={cn(
                    "text-lg font-bold",
                    getScoreColor(contact.relationshipScore)
                  )}>
                    {contact.relationshipScore}/10
                  </div>
                  <div className="text-xs text-text-muted">Relationship</div>
                </div>
                <div className="text-center p-2 bg-surface-glass rounded-button">
                  <div className="text-lg font-bold text-text-primary">
                    {contact.dealsPotential || 0}
                  </div>
                  <div className="text-xs text-text-muted">Potential Deals</div>
                </div>
              </div>

              {/* Notes */}
              {contact.notes && (
                <div className="mb-4">
                  <p className="text-xs text-text-secondary line-clamp-2">
                    {contact.notes}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border-light">
                <div className={cn(
                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize",
                  statusConfig.bgColor,
                  statusConfig.color
                )}>
                  {contact.status}
                </div>
                <div className="text-xs text-text-muted">
                  Last contact: {contact.lastContact}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredContacts.length === 0 && (
        <div className="bg-card rounded-card p-12 text-center shadow-card">
          <Users className="h-12 w-12 text-text-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">No contacts found</h3>
          <p className="text-text-muted mb-4">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search criteria or filters'
              : 'Get started by adding your first contact'
            }
          </p>
          <button className="btn-primary">
            Add Contact
          </button>
        </div>
      )}
    </div>
  )
}