import { openai } from '@ai-sdk/openai'
import { generateText, generateObject } from 'ai'
import { z } from 'zod'

// Initialize OpenAI client
export const aiModel = openai('gpt-4-turbo')

// Deal scoring schema
export const DealScoreSchema = z.object({
  score: z.number().min(0).max(10),
  riskLevel: z.enum(['low', 'medium', 'high']),
  recommendation: z.enum(['approve', 'review', 'decline']),
  confidence: z.number().min(0).max(100),
  factors: z.object({
    cashFlow: z.object({
      score: z.number().min(0).max(10),
      reasoning: z.string(),
    }),
    creditHistory: z.object({
      score: z.number().min(0).max(10),
      reasoning: z.string(),
    }),
    industry: z.object({
      score: z.number().min(0).max(10),
      reasoning: z.string(),
    }),
    bankStatements: z.object({
      score: z.number().min(0).max(10),
      reasoning: z.string(),
    }),
  }),
  keyInsights: z.array(z.string()),
  risks: z.array(z.string()),
  strengths: z.array(z.string()),
})

export type DealScore = z.infer<typeof DealScoreSchema>

// AI Deal Scoring
export async function scoreDeal(dealData: {
  merchantName: string
  industry: string
  requestedAmount: number
  monthlyRevenue?: number
  yearsInBusiness?: number
  creditScore?: number
  avgDailyBalance?: number
  nsfFees?: number
}): Promise<DealScore> {
  try {
    const { object } = await generateObject({
      model: aiModel,
      schema: DealScoreSchema,
      prompt: `
        Analyze this merchant cash advance deal and provide a comprehensive risk assessment:
        
        Merchant: ${dealData.merchantName}
        Industry: ${dealData.industry}
        Requested Amount: $${dealData.requestedAmount.toLocaleString()}
        Monthly Revenue: ${dealData.monthlyRevenue ? `$${dealData.monthlyRevenue.toLocaleString()}` : 'Not provided'}
        Years in Business: ${dealData.yearsInBusiness || 'Not provided'}
        Credit Score: ${dealData.creditScore || 'Not provided'}
        Average Daily Balance: ${dealData.avgDailyBalance ? `$${dealData.avgDailyBalance.toLocaleString()}` : 'Not provided'}
        NSF Fees (last 3 months): ${dealData.nsfFees || 0}
        
        Provide a detailed risk assessment with scores for each factor (0-10 scale), overall recommendation, and confidence level.
        Consider industry-specific risks, cash flow patterns, and credit worthiness.
      `,
    })

    return object
  } catch (error) {
    console.error('AI scoring error:', error)
    
    // Fallback scoring based on simple rules
    const riskScore = calculateFallbackScore(dealData)
    return {
      score: riskScore,
      riskLevel: riskScore > 7 ? 'high' : riskScore > 4 ? 'medium' : 'low',
      recommendation: riskScore > 7 ? 'decline' : riskScore > 4 ? 'review' : 'approve',
      confidence: 60,
      factors: {
        cashFlow: { score: 5, reasoning: 'Limited data available for analysis' },
        creditHistory: { score: 5, reasoning: 'Credit information not complete' },
        industry: { score: 5, reasoning: 'Industry assessment based on general trends' },
        bankStatements: { score: 5, reasoning: 'Bank statement analysis incomplete' },
      },
      keyInsights: ['Analysis based on limited data'],
      risks: ['Incomplete financial information'],
      strengths: ['Deal under review'],
    }
  }
}

function calculateFallbackScore(dealData: any): number {
  let score = 5 // Start with neutral score
  
  // Adjust based on available data
  if (dealData.creditScore) {
    if (dealData.creditScore > 700) score -= 1
    else if (dealData.creditScore < 600) score += 1
  }
  
  if (dealData.nsfFees > 5) score += 1
  if (dealData.yearsInBusiness && dealData.yearsInBusiness > 5) score -= 0.5
  
  return Math.max(0, Math.min(10, score))
}

// AI Chat Response
export async function generateChatResponse(
  message: string,
  context?: { deals?: any[]; merchants?: any[]; activities?: any[] }
): Promise<string> {
  try {
    const { text } = await generateText({
      model: aiModel,
      prompt: `
        You are DealSphere AI, an intelligent assistant for a merchant cash advance platform.
        
        User message: ${message}
        
        Context: ${context ? JSON.stringify(context, null, 2) : 'No specific context provided'}
        
        Respond as a knowledgeable financial assistant. Be helpful, professional, and provide actionable insights.
        If asked about specific deals or merchants, reference the provided context data.
        Keep responses concise but informative.
      `,
      maxTokens: 500,
    })

    return text
  } catch (error) {
    console.error('AI chat error:', error)
    return "I'm sorry, I'm having trouble processing your request right now. Please try again later."
  }
}

// AI Insights Generation
export const InsightSchema = z.object({
  type: z.enum(['opportunity', 'risk', 'achievement', 'optimization']),
  title: z.string(),
  description: z.string(),
  confidence: z.number().min(0).max(100),
  actionable: z.boolean(),
  priority: z.enum(['low', 'medium', 'high']),
  metadata: z.record(z.any()).optional(),
})

export async function generateInsights(data: {
  deals: any[]
  merchants: any[]
  portfolio: any
}): Promise<z.infer<typeof InsightSchema>[]> {
  try {
    const { object } = await generateObject({
      model: aiModel,
      schema: z.array(InsightSchema),
      prompt: `
        Analyze this portfolio data and generate 3-5 actionable insights:
        
        Portfolio Summary:
        - Total Deals: ${data.deals.length}
        - Total Merchants: ${data.merchants.length}
        - Portfolio Performance: ${JSON.stringify(data.portfolio, null, 2)}
        
        Recent Deals: ${JSON.stringify(data.deals.slice(-10), null, 2)}
        
        Generate insights about opportunities, risks, achievements, or optimizations.
        Focus on actionable recommendations that can improve business performance.
      `,
    })

    return object
  } catch (error) {
    console.error('AI insights error:', error)
    return []
  }
}