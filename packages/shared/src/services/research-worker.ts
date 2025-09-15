import { db, ResearchStatus, LeadStage } from '@dealsphere/database'
import type { ResearchResult } from '../types'
import { runClaudePerplexityAgentStructured } from './claude-perplexity-researcher'

class ResearchWorker {
  private isRunning = false
  private batchSize = 5
  private intervalMs = 45000 // 45 seconds
  private intervalId: NodeJS.Timeout | null = null

  constructor() {
    console.log('[RESEARCH_WORKER] Research Worker initialized')
  }

  start() {
    if (this.isRunning) {
      console.log('[RESEARCH_WORKER] Worker already running')
      return
    }

    this.isRunning = true
    console.log('[RESEARCH_WORKER] Starting research worker with interval:', this.intervalMs)
    
    // Run immediately, then on interval
    this.processQueue()
    this.intervalId = setInterval(() => this.processQueue(), this.intervalMs)
  }

  stop() {
    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    console.log('[RESEARCH_WORKER] Research worker stopped')
  }

  getStatus() {
    return {
      running: this.isRunning,
      intervalMs: this.intervalMs,
      batchSize: this.batchSize,
    }
  }

  private async processQueue() {
    if (!this.isRunning) return

    const cycleId = `cycle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log(`[RESEARCH_WORKER] ${cycleId} - Starting research cycle`)

    try {
      // Find leads that need research
      const pendingLeads = await db.lead.findMany({
        where: {
          researchStatus: ResearchStatus.PENDING
        },
        include: {
          organization: {
            select: { id: true, name: true }
          }
        },
        orderBy: {
          createdAt: 'asc'
        },
        take: this.batchSize
      })

      if (pendingLeads.length === 0) {
        console.log(`[RESEARCH_WORKER] ${cycleId} - No leads found for research`)
        return
      }

      console.log(`[RESEARCH_WORKER] ${cycleId} - Found ${pendingLeads.length} leads for research`)

      // Get available AI agents for assignment
      const aiAgents = await db.user.findMany({
        where: {
          isAIAgent: true,
          aiType: { in: ['RESEARCHER', 'LEAD_PROCESSOR'] }
        }
      })

      if (aiAgents.length === 0) {
        console.error(`[RESEARCH_WORKER] ${cycleId} - No AI agents found for research`)
        return
      }

      // Process leads in parallel
      const researchPromises = pendingLeads.map((lead, index) => {
        const agent = aiAgents[index % aiAgents.length]
        return this.researchLead(lead, agent, cycleId)
      })

      const results = await Promise.allSettled(researchPromises)
      
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      console.log(`[RESEARCH_WORKER] ${cycleId} - Research cycle completed: ${successful} successful, ${failed} failed`)

    } catch (error) {
      console.error(`[RESEARCH_WORKER] ${cycleId} - Error in research cycle:`, error)
    }
  }

  private async researchLead(lead: any, agent: any, cycleId: string) {
    const leadId = lead.id
    const requestId = `research_${leadId}_${Date.now()}`
    
    try {
      console.log(`[RESEARCH_WORKER] ${requestId} - Starting research for lead: ${lead.businessName || lead.firstName + ' ' + lead.lastName}`)

      // 1. Mark lead as in progress and assign agent
      await db.lead.update({
        where: { id: leadId },
        data: {
          researchStatus: ResearchStatus.IN_PROGRESS,
          assignedToId: agent.id,
          assignedAt: new Date()
        }
      })

      // 2. Create "Research Assigned" activity
      await db.activity.create({
        data: {
          type: 'AI_ACTION',
          title: 'Research Assigned',
          description: `Research assigned to AI Agent ${agent.firstName} ${agent.lastName}`,
          leadId,
          userId: agent.id,
          organizationId: lead.organizationId,
          metadata: {
            requestId,
            cycleId,
            agentType: agent.aiType
          },
          status: 'COMPLETED'
        }
      })

      // 3. Create "Research Started" activity
      await db.activity.create({
        data: {
          type: 'LEAD_RESEARCH',
          title: 'Research Started',
          description: `Started comprehensive research for ${lead.businessName || 'lead'}`,
          leadId,
          userId: agent.id,
          organizationId: lead.organizationId,
          metadata: {
            requestId,
            researchType: 'comprehensive',
            leadData: {
              businessName: lead.businessName,
              email: lead.email,
              industry: lead.industry
            }
          },
          status: 'IN_PROGRESS'
        }
      })

      // 4. Perform research using AI
      const researchResult = await this.performResearch(lead, requestId)

      // 5. Store research results
      await db.lead.update({
        where: { id: leadId },
        data: {
          researchData: researchResult as any, // Cast to any for JSON compatibility
          researchStatus: ResearchStatus.COMPLETED,
          researchedAt: new Date(),
          // Update lead fields with discovered data
          industry: researchResult.companyInfo?.industry || lead.industry,
          monthlyRevenue: researchResult.companyInfo?.estimatedRevenue || lead.monthlyRevenue
        }
      })

      // 6. Create field update activities
      if (researchResult.companyInfo?.industry && !lead.industry) {
        await db.activity.create({
          data: {
            type: 'LEAD_RESEARCH',
            title: 'Industry Identified',
            description: `Updated industry classification: ${researchResult.companyInfo.industry}`,
            leadId,
            userId: agent.id,
            organizationId: lead.organizationId,
            metadata: {
              requestId,
              fieldUpdated: 'industry',
              oldValue: null,
              newValue: researchResult.companyInfo.industry,
              confidence: researchResult.confidence
            },
            status: 'COMPLETED'
          }
        })
      }

      if (researchResult.companyInfo?.estimatedRevenue && !lead.monthlyRevenue) {
        await db.activity.create({
          data: {
            type: 'LEAD_RESEARCH',
            title: 'Revenue Estimated',
            description: `Updated monthly revenue estimate: $${researchResult.companyInfo.estimatedRevenue.toLocaleString()}`,
            leadId,
            userId: agent.id,
            organizationId: lead.organizationId,
            metadata: {
              requestId,
              fieldUpdated: 'monthlyRevenue',
              oldValue: null,
              newValue: researchResult.companyInfo.estimatedRevenue,
              confidence: researchResult.confidence
            },
            status: 'COMPLETED'
          }
        })
      }

      // 7. Create "Research Completed" activity
      const foundDataPoints = this.countDataPoints(researchResult)
      await db.activity.create({
        data: {
          type: 'LEAD_RESEARCH',
          title: 'Research Completed',
          description: `Research completed successfully - discovered ${foundDataPoints} data points`,
          leadId,
          userId: agent.id,
          organizationId: lead.organizationId,
          metadata: {
            requestId,
            dataPointsFound: foundDataPoints,
            confidence: researchResult.confidence,
            researchSummary: this.generateResearchSummary(researchResult)
          },
          status: 'COMPLETED'
        }
      })

      console.log(`[RESEARCH_WORKER] ${requestId} - Research completed successfully for ${lead.businessName || 'lead'}`)

    } catch (error) {
      console.error(`[RESEARCH_WORKER] ${requestId} - Research failed:`, error)

      // Mark lead as failed
      await db.lead.update({
        where: { id: leadId },
        data: {
          researchStatus: ResearchStatus.FAILED
        }
      })

      // Create failure activity
      await db.activity.create({
        data: {
          type: 'LEAD_RESEARCH',
          title: 'Research Failed',
          description: `Research failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          leadId,
          userId: agent.id,
          organizationId: lead.organizationId,
          metadata: {
            requestId,
            error: error instanceof Error ? error.message : 'Unknown error'
          },
          status: 'FAILED'
        }
      })

      throw error
    }
  }

  private async performResearch(lead: any, requestId: string): Promise<ResearchResult> {
    console.log(`[RESEARCH_WORKER] ${requestId} - Performing research via Perplexity (web) + Claude (synthesis) + OpenAI (structured)`)
    try {
      const res = await runClaudePerplexityAgentStructured(lead)
      console.log(`[RESEARCH_WORKER] ${requestId} - Research finished (confidence=${res.confidence ?? 'n/a'})`)
      return res
    } catch (error) {
      console.error(`[RESEARCH_WORKER] ${requestId} - Research failed:`, error)
      throw new Error(`Research failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private countDataPoints(result: ResearchResult): number {
    let count = 0
    
    if (result.companyInfo?.industry) count++
    if (result.companyInfo?.estimatedRevenue) count++
    if (result.companyInfo?.employeeCount) count++
    if (result.companyInfo?.description) count++
    if (result.contactValidation?.emailValid !== undefined) count++
    if (result.businessAnalysis?.industryClassification) count++
    if (result.businessAnalysis?.revenueRange) count++
    
    return count
  }

  private generateResearchSummary(result: ResearchResult): string {
    const summaryParts = []
    
    if (result.companyInfo?.industry) {
      summaryParts.push(`Industry: ${result.companyInfo.industry}`)
    }
    
    if (result.companyInfo?.estimatedRevenue) {
      summaryParts.push(`Est. Revenue: $${result.companyInfo.estimatedRevenue.toLocaleString()}`)
    }
    
    if (result.companyInfo?.employeeCount) {
      summaryParts.push(`Employees: ${result.companyInfo.employeeCount}`)
    }

    return summaryParts.length > 0 ? summaryParts.join(', ') : 'Basic research completed'
  }
}

// Export singleton instance
export const researchWorker = new ResearchWorker()
