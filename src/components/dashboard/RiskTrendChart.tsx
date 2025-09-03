"use client"

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts'
import { Bot } from 'lucide-react'

const data = [
  { month: 'Jan', risk: 2.3, aiFlag: false },
  { month: 'Feb', risk: 2.1, aiFlag: false },
  { month: 'Mar', risk: 2.8, aiFlag: true },
  { month: 'Apr', risk: 2.5, aiFlag: false },
  { month: 'May', risk: 3.2, aiFlag: true },
  { month: 'Jun', risk: 2.9, aiFlag: false },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload[0]) {
    return (
      <div className="bg-card-glass backdrop-blur-sm p-4 rounded-button shadow-elevated border border-default animate-scale-in">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">{label}</p>
        <p className="text-lg font-bold text-text-primary mb-2">
          {payload[0].value}% Default Rate
        </p>
        {payload[0].payload.aiFlag && (
          <div className="flex items-center gap-2 px-2 py-1 bg-danger/20 rounded text-danger border border-danger/30">
            <Bot className="h-3 w-3" />
            <span className="text-xs font-medium">AI Risk Alert</span>
          </div>
        )}
        <div className="mt-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent"></div>
          <span className="text-xs text-text-secondary">Risk Trend</span>
        </div>
      </div>
    )
  }
  return null
}

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props
  
  if (payload.aiFlag) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={4} fill="#EF4444" />
        <circle cx={cx} cy={cy} r={8} fill="#EF4444" fillOpacity={0.3} />
        <circle cx={cx} cy={cy} r={12} fill="#EF4444" fillOpacity={0.1} />
      </g>
    )
  }
  
  return <circle cx={cx} cy={cy} r={3} fill="#3B82F6" />
}

export default function RiskTrendChart() {
  return (
    <div className="bg-card rounded-card p-6 shadow-card card-hover">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Default Risk Trend</h3>
          <p className="text-sm text-text-muted">AI-powered risk monitoring and alerts</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-text-muted">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-danger" />
            <span className="text-text-muted">AI Flagged</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={1}/>
              <stop offset="100%" stopColor="#1E40AF" stopOpacity={0.8}/>
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
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '2 2', stroke: 'rgba(59, 130, 246, 0.3)' }} />
          <Line
            type="monotone"
            dataKey="risk"
            stroke="url(#lineGradient)"
            strokeWidth={3}
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: '#3B82F6', stroke: '#ffffff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}