import { NextRequest, NextResponse } from 'next/server'
import { db } from "@dealsphere/database"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = params.id

    // Verify lead exists
    const lead = await db.lead.findUnique({
      where: { id: leadId }
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Fetch activities for this lead
    const activities = await db.activity.findMany({
      where: {
        leadId: leadId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isAIAgent: true,
            aiType: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      activities
    })

  } catch (error) {
    console.error('Error fetching lead activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}