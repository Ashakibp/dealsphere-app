// Research-related types
export interface ResearchResult {
  companyInfo?: {
    industry?: string
    estimatedRevenue?: number
    employeeCount?: string
    description?: string
  }
  contactValidation?: {
    emailValid?: boolean
    businessLegitimacy?: string
  }
  businessAnalysis?: {
    industryClassification?: string
    revenueRange?: string
    riskAssessment?: string
  }
  confidence: number
  sources: string[]
}