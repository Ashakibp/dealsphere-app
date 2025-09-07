"use client"

import React, { useState } from 'react'
import { Bot, Users, Zap, Brain, Target, Shield, TrendingUp, Settings, Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIAgent {
  id: string
  name: string
  type: 'risk_assessment' | 'deal_sourcing' | 'underwriting' | 'monitoring' | 'optimization'
  status: 'active' | 'inactive' | 'training'
  description: string
  capabilities: string[]
  performance: {
    accuracy: number
    speed: string
    tasksCompleted: number
    efficiency: number
  }
  lastActivity: string
  version: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  avatar: string
  status: 'online' | 'offline' | 'away'
  aiAgentsManaged: string[]
  performance: {
    dealsProcessed: number
    avgResponseTime: string
    accuracy: number
  }
}

const aiAgents: AIAgent[] = [
  {
    id: '1',
    name: 'RiskGuard Pro',
    type: 'risk_assessment',
    status: 'active',
    description: 'Advanced risk assessment and fraud detection AI specialized in MCA deals',
    capabilities: ['Real-time risk scoring', 'Fraud detection', 'Payment prediction', 'Industry analysis'],
    performance: {
      accuracy: 94.2,
      speed: '0.3s avg',
      tasksCompleted: 1247,
      efficiency: 97
    },
    lastActivity: '2 minutes ago',
    version: 'v2.4.1'
  },
  {
    id: '2',
    name: 'DealFlow AI',
    type: 'deal_sourcing',
    status: 'active',
    description: 'Intelligent lead generation and qualification system for high-quality prospects',
    capabilities: ['Lead scoring', 'Market analysis', 'Competitor insights', 'Qualification automation'],
    performance: {
      accuracy: 87.8,
      speed: '1.2s avg',
      tasksCompleted: 892,
      efficiency: 89
    },
    lastActivity: '5 minutes ago',
    version: 'v1.8.3'
  },
  {
    id: '3',
    name: 'UnderwriteBot',
    type: 'underwriting',
    status: 'training',
    description: 'Automated underwriting assistant with document analysis capabilities',
    capabilities: ['Document parsing', 'Financial analysis', 'Compliance checking', 'Decision automation'],
    performance: {
      accuracy: 91.5,
      speed: '4.2s avg',
      tasksCompleted: 634,
      efficiency: 85
    },
    lastActivity: '1 hour ago',
    version: 'v3.0.0-beta'
  },
  {
    id: '4',
    name: 'MonitorMax',
    type: 'monitoring',
    status: 'active',
    description: 'Continuous portfolio monitoring and early warning system',
    capabilities: ['Payment tracking', 'Risk monitoring', 'Alert generation', 'Trend analysis'],
    performance: {
      accuracy: 96.1,
      speed: '0.1s avg',
      tasksCompleted: 2156,
      efficiency: 98
    },
    lastActivity: 'Just now',
    version: 'v2.1.4'
  }
]

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Senior Underwriter',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop',
    status: 'online',
    aiAgentsManaged: ['1', '3'],
    performance: {
      dealsProcessed: 147,
      avgResponseTime: '2.4 hrs',
      accuracy: 96
    }
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    role: 'Deal Sourcer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop',
    status: 'online',
    aiAgentsManaged: ['2'],
    performance: {
      dealsProcessed: 203,
      avgResponseTime: '1.8 hrs',
      accuracy: 92
    }
  },
  {
    id: '3',
    name: 'Emily Davis',
    role: 'Risk Analyst',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop',
    status: 'away',
    aiAgentsManaged: ['1', '4'],
    performance: {
      dealsProcessed: 89,
      avgResponseTime: '3.1 hrs',
      accuracy: 98
    }
  }
]

const getAgentTypeConfig = (type: AIAgent['type']) => {
  switch (type) {
    case 'risk_assessment':
      return {
        icon: Shield,
        color: 'text-danger',
        bgColor: 'bg-danger/10',
        borderColor: 'border-danger/20'
      }
    case 'deal_sourcing':
      return {
        icon: Target,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/20'
      }
    case 'underwriting':
      return {
        icon: Brain,
        color: 'text-accent',
        bgColor: 'bg-accent/10',
        borderColor: 'border-accent/20'
      }
    case 'monitoring':
      return {
        icon: TrendingUp,
        color: 'text-success',
        bgColor: 'bg-success/10',
        borderColor: 'border-success/20'
      }
    case 'optimization':
      return {
        icon: Zap,
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        borderColor: 'border-warning/20'
      }
  }
}

export default function TeamsPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  const activeAgents = aiAgents.filter(agent => agent.status === 'active').length
  const totalTasks = aiAgents.reduce((sum, agent) => sum + agent.performance.tasksCompleted, 0)
  const avgAccuracy = aiAgents.reduce((sum, agent) => sum + agent.performance.accuracy, 0) / aiAgents.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 text-text-primary">Teams & AI Agents</h1>
          <p className="text-text-muted mt-1">Manage your team and AI-powered automation</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Bot className="h-4 w-4" />
          Deploy New Agent
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-card p-6 shadow-card card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-text-primary">{activeAgents}</div>
              <div className="text-xs text-text-muted">Active Agents</div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-card p-6 shadow-card card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-success" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-text-primary">{totalTasks.toLocaleString()}</div>
              <div className="text-xs text-text-muted">Tasks Completed</div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-card p-6 shadow-card card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-accent" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-text-primary">{avgAccuracy.toFixed(1)}%</div>
              <div className="text-xs text-text-muted">Avg Accuracy</div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-card p-6 shadow-card card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-warning" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-text-primary">{teamMembers.length}</div>
              <div className="text-xs text-text-muted">Team Members</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Agents Grid */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">AI Agents</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {aiAgents.map((agent) => {
            const config = getAgentTypeConfig(agent.type)
            const Icon = config.icon

            return (
              <div
                key={agent.id}
                className="bg-card rounded-card p-6 shadow-card card-hover border border-border-light hover:border-accent/30 transition-all cursor-pointer"
                onClick={() => setSelectedAgent(agent.id)}
              >
                {/* Agent Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      config.bgColor,
                      "border",
                      config.borderColor
                    )}>
                      <Icon className={cn("h-5 w-5", config.color)} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">{agent.name}</h3>
                      <p className="text-xs text-text-muted capitalize">
                        {agent.type.replace('_', ' ')} • {agent.version}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                      agent.status === 'active' && "bg-success/20 text-success",
                      agent.status === 'inactive' && "bg-surface-glass text-text-muted",
                      agent.status === 'training' && "bg-warning/20 text-warning"
                    )}>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        agent.status === 'active' && "bg-success animate-pulse",
                        agent.status === 'inactive' && "bg-text-muted",
                        agent.status === 'training' && "bg-warning animate-pulse"
                      )} />
                      {agent.status}
                    </div>
                    
                    <button className="p-1 hover:bg-surface-hover rounded-button transition-colors">
                      <Settings className="h-4 w-4 text-text-muted" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                  {agent.description}
                </p>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-surface-glass rounded-button">
                    <div className="text-lg font-bold text-text-primary">{agent.performance.accuracy}%</div>
                    <div className="text-xs text-text-muted">Accuracy</div>
                  </div>
                  <div className="text-center p-3 bg-surface-glass rounded-button">
                    <div className="text-lg font-bold text-text-primary">{agent.performance.speed}</div>
                    <div className="text-xs text-text-muted">Avg Speed</div>
                  </div>
                  <div className="text-center p-3 bg-surface-glass rounded-button">
                    <div className="text-lg font-bold text-text-primary">{agent.performance.tasksCompleted}</div>
                    <div className="text-xs text-text-muted">Tasks</div>
                  </div>
                  <div className="text-center p-3 bg-surface-glass rounded-button">
                    <div className="text-lg font-bold text-text-primary">{agent.performance.efficiency}%</div>
                    <div className="text-xs text-text-muted">Efficiency</div>
                  </div>
                </div>

                {/* Capabilities */}
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
                    Capabilities
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.map((capability, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-surface-glass text-xs text-text-secondary rounded-full"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border-light">
                  <span className="text-xs text-text-muted">
                    Last activity: {agent.lastActivity}
                  </span>
                  <div className="flex items-center gap-2">
                    {agent.status === 'active' ? (
                      <button className="p-1 hover:bg-surface-hover rounded-button transition-colors">
                        <Pause className="h-3 w-3 text-text-muted" />
                      </button>
                    ) : (
                      <button className="p-1 hover:bg-surface-hover rounded-button transition-colors">
                        <Play className="h-3 w-3 text-text-muted" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Team Members */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Team Members</h2>
        <div className="bg-card rounded-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-glass border-b border-border-light">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    AI Agents Managed
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium text-text-primary">{member.name}</div>
                          <div className="text-sm text-text-muted">{member.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {member.aiAgentsManaged.map((agentId) => {
                          const agent = aiAgents.find(a => a.id === agentId)
                          if (!agent) return null
                          const config = getAgentTypeConfig(agent.type)
                          return (
                            <span
                              key={agentId}
                              className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                                config.bgColor,
                                config.color
                              )}
                            >
                              <Bot className="h-3 w-3" />
                              {agent.name}
                            </span>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-text-primary">
                          {member.performance.dealsProcessed} deals
                        </div>
                        <div className="text-xs text-text-muted">
                          {member.performance.avgResponseTime} avg • {member.performance.accuracy}% accuracy
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                        member.status === 'online' && "bg-success/20 text-success",
                        member.status === 'offline' && "bg-surface-glass text-text-muted",
                        member.status === 'away' && "bg-warning/20 text-warning"
                      )}>
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          member.status === 'online' && "bg-success",
                          member.status === 'offline' && "bg-text-muted",
                          member.status === 'away' && "bg-warning"
                        )} />
                        {member.status}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}