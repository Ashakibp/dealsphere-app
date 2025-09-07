"use client"

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const data = [
  { month: 'Jan', funded: 1200000 },
  { month: 'Feb', funded: 1400000 },
  { month: 'Mar', funded: 1100000 },
  { month: 'Apr', funded: 1600000 },
  { month: 'May', funded: 1800000 },
  { month: 'Jun', funded: 2100000 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload[0]) {
    return (
      <div className="bg-card-glass backdrop-blur-sm p-4 rounded-button shadow-elevated border border-default animate-scale-in">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">{label}</p>
        <p className="text-lg font-bold text-text-primary">
          ${(payload[0].value / 1000000).toFixed(1)}M
        </p>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color }}></div>
          <span className="text-xs text-text-secondary">Funding Volume</span>
        </div>
      </div>
    )
  }
  return null
}

export default function FundingChart() {
  return (
    <div className="bg-card rounded-card p-6 shadow-card card-hover">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Funding Volume</h3>
          <p className="text-sm text-text-muted">Monthly performance overview</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent"></div>
          <span className="text-xs font-medium text-text-secondary">Current</span>
          <div className="w-2 h-2 rounded-full bg-text-muted ml-3"></div>
          <span className="text-xs font-medium text-text-secondary">Previous</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={1}/>
              <stop offset="100%" stopColor="#1E40AF" stopOpacity={0.8}/>
            </linearGradient>
            <linearGradient id="barGradientMuted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6B7280" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#374151" stopOpacity={0.6}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 2" stroke="rgba(255, 255, 255, 0.1)" vertical={false} />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(248, 250, 252, 0.7)', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(248, 250, 252, 0.7)', fontSize: 12 }}
            tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
          <Bar dataKey="funded" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === data.length - 1 ? 'url(#barGradient)' : 'url(#barGradientMuted)'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}