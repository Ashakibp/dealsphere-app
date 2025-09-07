import { NextRequest, NextResponse } from 'next/server'
import { db } from "@dealsphere/database"
import { LeadStage, ContactType, ContactStatus, ContactSource } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = params.id
    const body = await request.json()
    const { 
      createMerchant = false,
      merchantData = {},
      userId
    } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required for contact creation' },
        { status: 400 }
      )
    }

    // Check if lead exists and isn't already converted
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: {
        convertedToContact: true,
        assignedTo: true
      }
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    if (lead.convertedToContact) {
      return NextResponse.json(
        { error: 'Lead already converted' },
        { status: 400 }
      )
    }

    // Start a transaction to ensure data consistency
    const result = await db.$transaction(async (tx) => {
      // Create contact from lead
      const contact = await tx.contact.create({
        data: {
          firstName: lead.firstName || 'Unknown',
          lastName: lead.lastName || 'Unknown',
          email: lead.email,
          phone: lead.phone,
          company: lead.businessName,
          type: ContactType.LEAD,
          status: ContactStatus.ACTIVE,
          source: mapLeadSourceToContactSource(lead.source),
          notes: lead.notes,
          organizationId: lead.organizationId,
          userId,
          tags: lead.industry ? [lead.industry] : []
        }
      })

      // Create merchant if requested
      let merchant = null
      if (createMerchant && lead.businessName) {
        merchant = await tx.merchant.create({
          data: {
            businessName: lead.businessName,
            ownerName: `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unknown',
            email: lead.email,
            phone: lead.phone || '',
            industry: lead.industry,
            monthlyRevenue: lead.monthlyRevenue,
            organizationId: lead.organizationId,
            ...merchantData
          }
        })

        // Update contact with merchant relationship
        await tx.contact.update({
          where: { id: contact.id },
          data: {
            type: ContactType.MERCHANT,
            company: merchant.businessName
          }
        })
      }

      // Update lead as converted
      const updatedLead = await tx.lead.update({
        where: { id: leadId },
        data: {
          stage: LeadStage.CONVERTED,
          convertedToContactId: contact.id,
          convertedAt: new Date()
        }
      })

      // Mark assignment as completed
      await tx.leadAssignment.updateMany({
        where: {
          leadId,
          status: 'ACTIVE'
        },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      })

      // Create conversion activity
      await tx.activity.create({
        data: {
          type: 'LEAD_CONVERSION',
          title: 'Lead Converted',
          description: `Lead converted to contact${merchant ? ' and merchant' : ''}`,
          leadId,
          contactId: contact.id,
          merchantId: merchant?.id,
          userId: lead.assignedToId,
          organizationId: lead.organizationId,
          metadata: {
            contactId: contact.id,
            merchantId: merchant?.id
          },
          status: 'COMPLETED'
        }
      })

      return {
        lead: updatedLead,
        contact,
        merchant
      }
    })

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('Error converting lead:', error)
    return NextResponse.json(
      { error: 'Failed to convert lead' },
      { status: 500 }
    )
  }
}

// Helper function to map LeadSource to ContactSource
function mapLeadSourceToContactSource(leadSource: string): ContactSource {
  const mapping: Record<string, ContactSource> = {
    WEBSITE: ContactSource.WEBSITE,
    PHONE: ContactSource.COLD_OUTREACH,
    EMAIL: ContactSource.COLD_OUTREACH,
    SPREADSHEET_UPLOAD: ContactSource.OTHER,
    API: ContactSource.OTHER,
    REFERRAL: ContactSource.REFERRAL,
    SOCIAL_MEDIA: ContactSource.SOCIAL_MEDIA,
    OTHER: ContactSource.OTHER
  }
  
  return mapping[leadSource] || ContactSource.OTHER
}