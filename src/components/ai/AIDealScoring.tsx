"use client"

import React from 'react'
import { Brain, TrendingUp, TrendingDown, AlertCircle, CheckCircle, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DealScore {
  dealId: string
  merchantName: string
  requestedAmount: number
  aiScore: number
  riskLevel: 'low' | 'medium' | 'high'
  recommendation: 'approve' | 'review' | 'decline'
  confidence: number
  factors: {
    cashFlow: { score: number; trend: 'up' | 'down' | 'stable' }
    creditHistory: { score: number; trend: 'up' | 'down' | 'stable' }
    industry: { score: number; trend: 'up' | 'down' | 'stable' }
    bankStatements: { score: number; trend: 'up' | 'down' | 'stable' }
  }
  insights: string[]
}

interface AIDealScoringProps {
  deals?: DealScore[]
}

const defaultDeals: DealScore[] = [
  {
    dealId: 'D2024-001',
    merchantName: 'TechFlow Solutions',
    requestedAmount: 125000,
    aiScore: 8.2,
    riskLevel: 'high',
    recommendation: 'review',
    confidence: 89,
    factors: {
      cashFlow: { score: 6.5, trend: 'down' },
      creditHistory: { score: 7.8, trend: 'stable' },
      industry: { score: 8.9, trend: 'up' },
      bankStatements: { score: 7.2, trend: 'down' }
    },
    insights: [
      'Daily deposits decreased 23% in last 30 days',
      'Industry showing strong growth (+15% YoY)',
      'Credit utilization within acceptable range'
    ]
  },
  {
    dealId: 'D2024-002',
    merchantName: 'Green Valley Restaurant',
    requestedAmount: 85000,
    aiScore: 7.1,
    riskLevel: 'medium',
    recommendation: 'approve',
    confidence: 94,
    factors: {
      cashFlow: { score: 8.2, trend: 'up' },
      creditHistory: { score: 6.8, trend: 'stable' },
      industry: { score: 6.5, trend: 'stable' },
      bankStatements: { score: 8.1, trend: 'up' }
    },
    insights: [
      'Consistent daily deposits averaging $4,200',
      'Seasonal business with predictable patterns',
      'Strong weekend performance indicators'
    ]
  },
  {
    dealId: 'D2024-003',
    merchantName: 'Metro Construction LLC',
    requestedAmount: 200000,
    aiScore: 9.1,
    riskLevel: 'low',
    recommendation: 'approve',
    confidence: 97,
    factors: {
      cashFlow: { score: 9.2, trend: 'up' },
      creditHistory: { score: 8.8, trend: 'up' },
      industry: { score: 8.9, trend: 'up' },
      bankStatements: { score: 9.4, trend: 'up' }
    },
    insights: [
      'Excellent payment history with multiple lenders',
      'Strong project pipeline through 2025',
      'Above-industry-average profit margins'
    ]
  }
]

const getScoreColor = (score: number) => {
  if (score >= 8.5) return 'text-success'
  if (score >= 7.0) return 'text-warning'
  return 'text-danger'
}

const getRecommendationConfig = (recommendation: DealScore['recommendation']) => {
  switch (recommendation) {
    case 'approve':
      return {
        icon: CheckCircle,
        color: 'text-success',
        bgColor: 'bg-success/10',
        borderColor: 'border-success/20'
      }
    case 'review':
      return {
        icon: AlertCircle,
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        borderColor: 'border-warning/20'
      }
    case 'decline':
      return {
        icon: TrendingDown,
        color: 'text-danger',
        bgColor: 'bg-danger/10',
        borderColor: 'border-danger/20'
      }
  }
}

const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-3 w-3 text-success" />
    case 'down':
      return <TrendingDown className="h-3 w-3 text-danger" />
    case 'stable':
      return <div className="h-3 w-3 bg-text-muted rounded-full" />
  }
}

export default function AIDealScoring({ deals = defaultDeals }: AIDealScoringProps) {
  return (
    <div className="bg-card rounded-card p-6 shadow-card card-hover">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">AI Deal Scoring</h3>
            <p className="text-xs text-text-muted">Real-time risk assessment and recommendations</p>
          </div>
        </div>
        <div className="text-xs text-text-muted">
          {deals.length} deals analyzed
        </div>
      </div>

      {/* Deals List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {deals.map((deal) => {
          const recommendationConfig = getRecommendationConfig(deal.recommendation)
          const RecommendationIcon = recommendationConfig.icon

          return (
            <div
              key={deal.dealId}
              className="p-4 border border-border-light rounded-lg hover:shadow-md transition-all group"
            >
              {/* Deal Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-text-primary">{deal.merchantName}</h4>
                    <span className="text-xs text-text-muted">#{deal.dealId}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>${deal.requestedAmount.toLocaleString()}</span>
                    </div>
                    <div className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      deal.riskLevel === 'low' && "bg-success/20 text-success",
                      deal.riskLevel === 'medium' && "bg-warning/20 text-warning",
                      deal.riskLevel === 'high' && "bg-danger/20 text-danger"
                    )}>
                      {deal.riskLevel} risk
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-text-muted">AI Score</span>
                    <div className={cn(
                      "text-lg font-bold",
                      getScoreColor(deal.aiScore)
                    )}>
                      {deal.aiScore}/10
                    </div>
                  </div>
                  <div className="text-xs text-text-muted">
                    {deal.confidence}% confidence
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className={cn(
                "flex items-center justify-between p-3 rounded-lg mb-4",
                recommendationConfig.bgColor,
                "border",
                recommendationConfig.borderColor
              )}>
                <div className="flex items-center gap-2">
                  <RecommendationIcon className={cn("h-4 w-4", recommendationConfig.color)} />
                  <span className={cn("font-medium text-sm", recommendationConfig.color)}>
                    {deal.recommendation.toUpperCase()}
                  </span>
                </div>
                <Brain className="h-4 w-4 text-text-muted opacity-60" />
              </div>

              {/* Factors */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {Object.entries(deal.factors).map(([key, factor]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-surface-glass rounded-button">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      {getTrendIcon(factor.trend)}
                    </div>
                    <span className={cn(
                      "text-sm font-medium",
                      getScoreColor(factor.score)
                    )}>
                      {factor.score}/10
                    </span>
                  </div>
                ))}
              </div>

              {/* AI Insights */}
              <div className="space-y-1">
                <h5 className="text-xs font-medium text-text-muted uppercase tracking-wide">
                  AI Insights
                </h5>
                {deal.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs text-text-secondary">
                    <div className="w-1 h-1 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{insight}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border-light">
                <button className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-button transition-colors",
                  deal.recommendation === 'approve'
                    ? "bg-success text-white hover:bg-success/90"
                    : deal.recommendation === 'review'
                    ? "bg-warning text-white hover:bg-warning/90"
                    : "bg-surface-glass text-text-secondary hover:bg-surface-hover"
                )}>
                  {deal.recommendation === 'approve' ? 'Quick Approve' : 'Review Details'}
                </button>
                <button className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-button transition-colors">
                  View Full Report
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-border-light">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            <span>Real-time scoring active</span>
          </div>
          <button className="text-accent hover:text-accent/80 transition-colors">
            Configure AI Model
          </button>
        </div>
      </div>
    </div>
  )
}