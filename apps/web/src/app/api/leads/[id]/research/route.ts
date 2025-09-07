import {NextRequest, NextResponse} from 'next/server'
import {db} from "@dealsphere/database"
import {ResearchStatus} from '@prisma/client'
import {par} from "effect/src/internal/blockedRequests";

export async function POST(
    request: NextRequest,
    {params}: { params: { id: string } }
) {
    const requestId = `research_trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log(`[RESEARCH_API] ${requestId} - Manual research trigger for lead: ${params.id}`)

    try {
        const leadId = (await params).id

        // Check if lead exists
        const lead = await db.lead.findUnique({
            where: {id: leadId},
            include: {
                organization: {
                    select: {id: true, name: true}
                }
            }
        })

        if (!lead) {
            console.error(`[RESEARCH_API] ${requestId} - Lead not found: ${leadId}`)
            return NextResponse.json(
                {error: 'Lead not found'},
                {status: 404}
            )
        }

        // Check current research status
        if (lead.researchStatus === ResearchStatus.IN_PROGRESS) {
            console.log(`[RESEARCH_API] ${requestId} - Research already in progress for lead: ${leadId}`)
            return NextResponse.json({
                success: true,
                message: 'Research already in progress',
                status: lead.researchStatus
            })
        }

        // Reset research status to trigger research worker
        await db.lead.update({
            where: {id: leadId},
            data: {
                researchStatus: ResearchStatus.PENDING,
                researchData: null, // Clear previous research data
                researchedAt: null
            }
        })

        // Create activity for manual trigger
        await db.activity.create({
            data: {
                type: 'LEAD_RESEARCH',
                title: 'Research Triggered',
                description: 'Research manually triggered - queued for processing',
                leadId,
                organizationId: lead.organizationId,
                metadata: {
                    requestId,
                    trigger: 'manual',
                    previousStatus: lead.researchStatus
                },
                status: 'COMPLETED'
            }
        })

        console.log(`[RESEARCH_API] ${requestId} - Lead queued for research: ${leadId}`)

        return NextResponse.json({
            success: true,
            message: 'Lead queued for research',
            leadId,
            status: ResearchStatus.PENDING
        })

    } catch (error) {
        console.error(`[RESEARCH_API] ${requestId} - Error triggering research:`, error)
        return NextResponse.json(
            {error: 'Failed to trigger research', details: error instanceof Error ? error.message : 'Unknown error'},
            {status: 500}
        )
    }
}

export async function GET(
    request: NextRequest,
    {params}: { params: { id: string } }
) {
    try {
        const leadId = params.id

        // Get lead with research status
        const lead = await db.lead.findUnique({
            where: {id: leadId},
            select: {
                id: true,
                researchStatus: true,
                researchData: true,
                researchedAt: true,
                assignedTo: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        isAIAgent: true,
                        aiType: true
                    }
                }
            }
        })

        if (!lead) {
            return NextResponse.json(
                {error: 'Lead not found'},
                {status: 404}
            )
        }

        return NextResponse.json({
            success: true,
            research: {
                status: lead.researchStatus,
                data: lead.researchData,
                researchedAt: lead.researchedAt,
                assignedAgent: lead.assignedTo
            }
        })

    } catch (error) {
        console.error('Error fetching research status:', error)
        return NextResponse.json(
            {error: 'Failed to fetch research status'},
            {status: 500}
        )
    }
}