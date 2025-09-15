// Export utilities (specific exports to avoid conflicts)
export { 
  analyzeHeaders, 
  parseFieldValue, 
  processRow,
  fieldMappingResultSchema 
} from './utils/field-mapper'
export type { FieldMapping, FieldMappingResult } from './utils/field-mapper'

// Export services
export { researchWorker } from './services/research-worker'
export { runClaudePerplexityAgentStructured } from './services/claude-perplexity-researcher'

// Export types
export type { ResearchResult } from './types'
