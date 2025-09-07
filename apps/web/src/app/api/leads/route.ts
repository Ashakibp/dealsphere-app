import { NextRequest, NextResponse } from 'next/server'
import { db } from "@dealsphere/database"
import { z } from 'zod'
import { LeadStage, LeadSource, ResearchStatus } from '@prisma/client'

// Validation schema for creating a lead
const createLeadSchema = z.object({
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  businessName: z.string().optional().nullable(),
  requestedAmount: z.number().optional().nullable(),
  monthlyRevenue: z.number().optional().nullable(),
  industry: z.string().optional().nullable(),
  source: z.nativeEnum(LeadSource),
  notes: z.string().optional().nullable(),
  extraData: z.record(z.any()).optional().nullable(),
  organizationId: z.string()
})

// GET /api/leads - List leads with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId')
    const stage = searchParams.get('stage') as LeadStage | null
    const assignedToId = searchParams.get('assignedToId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    const where: any = { organizationId }
    
    if (stage) {
      where.stage = stage
    }
    
    if (assignedToId) {
      where.assignedToId = assignedToId
    }

    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where,
        include: {
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              isAIAgent: true,
              aiType: true
            }
          },
          convertedToContact: true,
          assignments: {
            orderBy: { startedAt: 'desc' },
            take: 1,
            include: {
              assignedTo: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  isAIAgent: true
                }
              }
            }
          },
          _count: {
            select: {
              activities: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      db.lead.count({ where })
    ])

    return NextResponse.json({
      leads,
      total,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createLeadSchema.parse(body)

    // Create the lead
    const lead = await db.lead.create({
      data: {
        ...validatedData,
        stage: LeadStage.NEW,
        researchStatus: ResearchStatus.PENDING
      },
      include: {
        assignedTo: true
      }
    })

    // Create an activity record for lead creation
    await db.activity.create({
      data: {
        type: 'LEAD_QUALIFICATION',
        title: 'Lead Created',
        description: `New lead created: ${lead.firstName || ''} ${lead.lastName || ''} ${lead.businessName ? `(${lead.businessName})` : ''}`.trim(),
        leadId: lead.id,
        organizationId: lead.organizationId,
        status: 'COMPLETED'
      }
    })

    // Auto-assign to an AI agent if available
    const aiAgent = await db.user.findFirst({
      where: {
        organizationId: validatedData.organizationId,
        isAIAgent: true,
        aiType: 'LEAD_PROCESSOR'
      }
    })

    if (aiAgent) {
      const updatedLead = await db.lead.update({
        where: { id: lead.id },
        data: {
          assignedToId: aiAgent.id,
          assignedAt: new Date()
        },
        include: {
          assignedTo: true
        }
      })

      // Create assignment record
      await db.leadAssignment.create({
        data: {
          leadId: lead.id,
          assignedToId: aiAgent.id,
          reason: 'Auto-assigned to AI agent',
          status: 'ACTIVE'
        }
      })

      // Create activity for assignment
      await db.activity.create({
        data: {
          type: 'AI_ACTION',
          title: 'Lead Assigned',
          description: `Lead assigned to AI agent: ${aiAgent.firstName} ${aiAgent.lastName}`,
          leadId: lead.id,
          userId: aiAgent.id,
          organizationId: lead.organizationId,
          status: 'COMPLETED'
        }
      })

      return NextResponse.json(updatedLead, { status: 201 })
    }

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}

// PATCH /api/leads - Update a lead
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      )
    }

    const lead = await db.lead.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: true,
        convertedToContact: true
      }
    })

    // Track stage changes
    if (updateData.stage) {
      await db.activity.create({
        data: {
          type: 'LEAD_QUALIFICATION',
          title: 'Stage Updated',
          description: `Lead stage changed to: ${updateData.stage}`,
          leadId: lead.id,
          organizationId: lead.organizationId,
          status: 'COMPLETED'
        }
      })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Error updating lead:', error)
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    )
  }
}