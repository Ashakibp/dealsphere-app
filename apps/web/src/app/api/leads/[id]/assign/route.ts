import { NextRequest, NextResponse } from 'next/server'
import { db } from "@dealsphere/database"
import { AssignmentStatus } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = `assign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  console.log(`[LEAD_ASSIGN] ${requestId} - Assignment request received for lead: ${params.id}`)
  
  try {
    const leadId = params.id
    const body = await request.json()
    const { assignToId, reason = 'Manual assignment' } = body

    console.log(`[LEAD_ASSIGN] ${requestId} - Assignment params:`, {
      leadId,
      assignToId,
      reason
    })

    if (!assignToId) {
      console.error(`[LEAD_ASSIGN] ${requestId} - Missing assignToId`)
      return NextResponse.json(
        { error: 'assignToId is required' },
        { status: 400 }
      )
    }

    // Check if lead exists
    console.log(`[LEAD_ASSIGN] ${requestId} - Looking up lead and current assignments`)
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: {
        assignedTo: true,
        assignments: {
          where: { status: AssignmentStatus.ACTIVE }
        }
      }
    })

    if (!lead) {
      console.error(`[LEAD_ASSIGN] ${requestId} - Lead not found: ${leadId}`)
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    console.log(`[LEAD_ASSIGN] ${requestId} - Lead found:`, {
      currentAssignee: lead.assignedTo ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}` : 'Unassigned',
      currentAssigneeId: lead.assignedToId,
      activeAssignments: lead.assignments.length,
      stage: lead.stage
    })

    // Check if assignee exists
    console.log(`[LEAD_ASSIGN] ${requestId} - Looking up new assignee: ${assignToId}`)
    const assignee = await db.user.findUnique({
      where: { id: assignToId }
    })

    if (!assignee) {
      console.error(`[LEAD_ASSIGN] ${requestId} - Assignee not found: ${assignToId}`)
      return NextResponse.json(
        { error: 'Assignee not found' },
        { status: 404 }
      )
    }

    console.log(`[LEAD_ASSIGN] ${requestId} - New assignee found:`, {
      name: `${assignee.firstName} ${assignee.lastName}`,
      isAIAgent: assignee.isAIAgent,
      aiType: assignee.aiType
    })

    // Mark current active assignments as completed
    const assignmentStartTime = Date.now()
    if (lead.assignments.length > 0) {
      console.log(`[LEAD_ASSIGN] ${requestId} - Marking ${lead.assignments.length} active assignments as handoff`)
      await db.leadAssignment.updateMany({
        where: {
          leadId,
          status: AssignmentStatus.ACTIVE
        },
        data: {
          status: AssignmentStatus.HANDOFF,
          completedAt: new Date()
        }
      })
      console.log(`[LEAD_ASSIGN] ${requestId} - Previous assignments marked as handoff`)
    }

    // Create new assignment
    console.log(`[LEAD_ASSIGN] ${requestId} - Creating new assignment record`)
    const newAssignment = await db.leadAssignment.create({
      data: {
        leadId,
        assignedToId: assignToId,
        assignedBy: lead.assignedToId, // Previous assignee
        reason,
        status: AssignmentStatus.ACTIVE
      }
    })
    console.log(`[LEAD_ASSIGN] ${requestId} - Assignment record created: ${newAssignment.id}`)

    // Update lead with new assignee
    console.log(`[LEAD_ASSIGN] ${requestId} - Updating lead with new assignee`)
    const updatedLead = await db.lead.update({
      where: { id: leadId },
      data: {
        assignedToId: assignToId,
        assignedAt: new Date()
      },
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
        assignments: {
          orderBy: { startedAt: 'desc' },
          take: 5
        }
      }
    })
    console.log(`[LEAD_ASSIGN] ${requestId} - Lead updated successfully`)

    // Create activity for assignment
    console.log(`[LEAD_ASSIGN] ${requestId} - Creating assignment activity`)
    await db.activity.create({
      data: {
        type: assignee.isAIAgent ? 'AI_ACTION' : 'LEAD_QUALIFICATION',
        title: 'Lead Reassigned',
        description: `Lead reassigned from ${lead.assignedTo?.firstName || 'Unassigned'} to ${assignee.firstName} ${assignee.lastName}`,
        leadId,
        userId: assignToId,
        organizationId: lead.organizationId,
        metadata: {
          previousAssigneeId: lead.assignedToId,
          newAssigneeId: assignToId,
          reason,
          assignmentId: newAssignment.id
        },
        status: 'COMPLETED'
      }
    })

    const totalTime = Date.now() - assignmentStartTime
    console.log(`[LEAD_ASSIGN] ${requestId} - Assignment completed successfully in ${totalTime}ms:`, {
      fromAssignee: lead.assignedTo ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}` : 'Unassigned',
      toAssignee: `${assignee.firstName} ${assignee.lastName}`,
      assignmentId: newAssignment.id
    })

    return NextResponse.json({
      lead: updatedLead,
      assignment: newAssignment
    })

  } catch (error) {
    const requestId = `assign_${Date.now()}_error`
    console.error(`[LEAD_ASSIGN] ${requestId} - Assignment failed:`, error)
    return NextResponse.json(
      { error: 'Failed to assign lead', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}