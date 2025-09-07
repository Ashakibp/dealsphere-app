"use client"

import React, { useState } from 'react'
import { Plus, Upload, Filter, ChevronDown, Search } from 'lucide-react'
import StatusChip, { type DealStage } from '@/components/ui/StatusChip'
import DealDrawer from '@/components/deals/DealDrawer'
import { cn } from '@/lib/utils'

interface Deal {
  id: string
  merchant: string
  broker: string
  stage: DealStage
  fundedAmount: number
  factorRate: number
  ach: number
  term: number
  status: 'active' | 'completed'
  updatedAt: string
}

const mockDeals: Deal[] = [
  {
    id: 'D-2024-001',
    merchant: 'ABC Construction Co.',
    broker: 'Capital Connect Partners',
    stage: 'funded',
    fundedAmount: 150000,
    factorRate: 1.28,
    ach: 1500,
    term: 12,
    status: 'active',
    updatedAt: '2024-03-15'
  },
  {
    id: 'D-2024-002',
    merchant: 'XYZ Retail Store',
    broker: 'Velocity Funding Solutions',
    stage: 'underwriting',
    fundedAmount: 75000,
    factorRate: 1.32,
    ach: 850,
    term: 10,
    status: 'active',
    updatedAt: '2024-03-14'
  },
  {
    id: 'D-2024-003',
    merchant: 'Elite Restaurant Group',
    broker: 'Prime Business Capital',
    stage: 'approved',
    fundedAmount: 200000,
    factorRate: 1.25,
    ach: 2000,
    term: 14,
    status: 'active',
    updatedAt: '2024-03-14'
  },
  {
    id: 'D-2024-004',
    merchant: 'Tech Solutions Inc.',
    broker: 'Merchant Growth Partners',
    stage: 'paid-off',
    fundedAmount: 100000,
    factorRate: 1.30,
    ach: 1200,
    term: 10,
    status: 'completed',
    updatedAt: '2024-03-13'
  },
  {
    id: 'D-2024-005',
    merchant: 'Downtown Coffee Shop',
    broker: 'Advance Funding Network',
    stage: 'new',
    fundedAmount: 50000,
    factorRate: 1.35,
    ach: 600,
    term: 8,
    status: 'active',
    updatedAt: '2024-03-13'
  },
  {
    id: 'D-2024-006',
    merchant: 'Auto Parts Warehouse',
    broker: 'Capital Connect Partners',
    stage: 'funded',
    fundedAmount: 125000,
    factorRate: 1.29,
    ach: 1400,
    term: 11,
    status: 'active',
    updatedAt: '2024-03-12'
  },
]

export default function DealsPage() {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <>
      <div className="space-y-6">
      <div className="flex items-center justify-between animate-slide-up">
        <h1 className="text-h1 text-text-primary">Deals & Advances</h1>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span>Bulk Upload</span>
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>New Deal</span>
          </button>
        </div>
      </div>

      <div className="bg-card rounded-card shadow-card animate-slide-up">
        <div className="p-6 border-b border-default">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search deals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-background border border-default rounded-button text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all-smooth"
                />
              </div>
              <button className="btn-ghost flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Deal ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Merchant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Broker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Funded Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Factor Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  ACH
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Term
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockDeals.map((deal) => (
                <tr 
                  key={deal.id}
                  className="hover:bg-background cursor-pointer transition-all-smooth border-b border-border-light last:border-b-0"
                  onClick={() => setSelectedDeal(deal)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    {deal.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                    {deal.merchant}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    {deal.broker}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusChip stage={deal.stage} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary font-medium">
                    {formatCurrency(deal.fundedAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                    {deal.factorRate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                    {formatCurrency(deal.ach)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    {deal.term} mo
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                    {formatDate(deal.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">
              Showing 1 to {mockDeals.length} of {mockDeals.length} results
            </span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm text-text-secondary hover:bg-gray-50 rounded transition-colors">
                Previous
              </button>
              <button className="px-3 py-1 text-sm bg-primary text-white rounded">
                1
              </button>
              <button className="px-3 py-1 text-sm text-text-secondary hover:bg-gray-50 rounded transition-colors">
                2
              </button>
              <button className="px-3 py-1 text-sm text-text-secondary hover:bg-gray-50 rounded transition-colors">
                3
              </button>
              <button className="px-3 py-1 text-sm text-text-secondary hover:bg-gray-50 rounded transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <DealDrawer 
      deal={selectedDeal}
      open={!!selectedDeal}
      onClose={() => setSelectedDeal(null)}
    />
    </>
  )
}