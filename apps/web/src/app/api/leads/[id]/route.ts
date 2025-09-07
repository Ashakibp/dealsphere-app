import { NextRequest, NextResponse } from 'next/server'
import { db } from "@dealsphere/database"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = params.id

    // Fetch lead with all related data
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isAIAgent: true,
            aiType: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    console.log(lead)

    return NextResponse.json({
      success: true,
      lead
    })

  } catch (error) {
    console.error('Error fetching lead:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lead', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = params.id
    const body = await request.json()

    // Update lead
    const updatedLead = await db.lead.update({
      where: { id: leadId },
      data: body,
      include: {
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

    // Create activity for lead update
    await db.activity.create({
      data: {
        type: 'LEAD_UPDATE',
        title: 'Lead Updated',
        description: 'Lead information was updated',
        metadata: {
          updatedFields: Object.keys(body),
          changes: body
        },
        leadId: leadId,
        organizationId: updatedLead.organizationId,
        status: 'COMPLETED'
      }
    })

    return NextResponse.json({
      success: true,
      lead: updatedLead
    })

  } catch (error) {
    console.error('Error updating lead:', error)
    return NextResponse.json(
      { error: 'Failed to update lead', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}