"use client"

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const data = [
  { name: 'New', value: 12, count: 12, color: '#6B7280' },
  { name: 'Underwriting', value: 18, count: 18, color: '#F59E0B' },
  { name: 'Approved', value: 8, count: 8, color: '#3B82F6' },
  { name: 'Funded', value: 45, count: 45, color: '#10B981' },
  { name: 'Paid Off', value: 28, count: 28, color: '#6366F1' },
]

const COLORS = {
  'New': '#6B7280',
  'Underwriting': '#F59E0B',
  'Approved': '#3B82F6',
  'Funded': '#10B981',
  'Paid Off': '#6366F1',
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload[0]) {
    const data = payload[0].payload
    const percentage = ((data.value / data.totalValue) * 100).toFixed(1)
    return (
      <div className="bg-card-glass backdrop-blur-sm p-4 rounded-button shadow-elevated border border-default animate-scale-in">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }}></div>
          <p className="text-sm font-semibold text-text-primary">{data.name}</p>
        </div>
        <p className="text-xl font-bold text-text-primary mb-1">
          {data.value} deals
        </p>
        <p className="text-xs text-text-muted">
          {percentage}% of total pipeline
        </p>
      </div>
    )
  }
  return null
}

const CustomLegend = ({ payload }: any) => {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center gap-1.5">
          <span 
            className="w-2.5 h-2.5 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-small text-text-secondary">{entry.value}</span>
        </li>
      ))}
    </ul>
  )
}

export default function PipelineChart() {
  // Calculate total for percentage
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const enrichedData = data.map(item => ({ ...item, totalValue: total }))

  return (
    <div className="bg-card rounded-card p-6 shadow-card card-hover">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Deal Pipeline</h3>
        <p className="text-sm text-text-muted">Current distribution overview</p>
      </div>
      
      <div className="relative">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <defs>
              {data.map((entry, index) => (
                <linearGradient key={`gradient-${index}`} id={`gradient-${entry.name}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={entry.color} stopOpacity={1}/>
                  <stop offset="100%" stopColor={entry.color} stopOpacity={0.8}/>
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={enrichedData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#gradient-${entry.name})`}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary">{total}</div>
            <div className="text-xs text-text-muted uppercase tracking-wide">Total Deals</div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-2 gap-3">
        {data.map((item) => {
          const percentage = ((item.value / total) * 100).toFixed(0)
          return (
            <div key={item.name} className="flex items-center justify-between p-3 bg-surface-glass rounded-button border border-border-light">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm font-medium text-text-secondary">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-text-primary">{item.value}</div>
                <div className="text-xs text-text-muted">{percentage}%</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}