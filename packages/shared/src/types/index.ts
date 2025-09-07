// Shared type definitions
export interface ResearchResult {
  companyInfo?: {
    industry?: string
    estimatedRevenue?: number
    employeeCount?: string
    founded?: string
    description?: string
    website?: string
  }
  contactValidation?: {
    emailValid?: boolean
    phoneValid?: boolean
    socialProfiles?: string[]
  }
  businessAnalysis?: {
    industryClassification?: string
    revenueRange?: string
    businessType?: string
    riskScore?: number
  }
  confidence?: number
  sources?: string[]
}

export interface FieldMapping {
  sourceHeader: string
  targetField: string | null
  confidence: number
}

export type FieldMappingResult = {
  mappings: FieldMapping[]
  unmappedFields: string[]
}