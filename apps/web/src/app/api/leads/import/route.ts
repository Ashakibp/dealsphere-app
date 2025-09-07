import { NextRequest, NextResponse } from 'next/server'
import { db } from "@dealsphere/database"
import { analyzeHeaders, processRow } from "@dealsphere/shared"
import { LeadStage, LeadSource, ResearchStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  console.log(`[LEAD_IMPORT] ${requestId} - Import request received`)
  
  try {
    const body = await request.json()
    const { 
      data, 
      organizationId, 
      source = LeadSource.SPREADSHEET_UPLOAD,
      autoAssign = true,
      confirmMapping = false,
      mappingOverrides = {}
    } = body

    console.log(`[LEAD_IMPORT] ${requestId} - Request params:`, {
      dataRows: data?.length,
      organizationId,
      source,
      autoAssign,
      confirmMapping,
      mappingOverridesCount: Object.keys(mappingOverrides).length
    })

    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error(`[LEAD_IMPORT] ${requestId} - No data provided`)
      return NextResponse.json(
        { error: 'No data provided' },
        { status: 400 }
      )
    }

    if (!organizationId) {
      console.error(`[LEAD_IMPORT] ${requestId} - Organization ID missing`)
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    // Extract headers from the first row
    const headers = Object.keys(data[0])
    console.log(`[LEAD_IMPORT] ${requestId} - Extracted ${headers.length} headers:`, headers)
    
    // Get field mappings from LLM
    console.log(`[LEAD_IMPORT] ${requestId} - Starting header analysis`)
    const mappingResult = await analyzeHeaders(headers)
    console.log(`[LEAD_IMPORT] ${requestId} - Header analysis complete:`, {
      totalMappings: mappingResult.mappings.length,
      mappedFields: mappingResult.mappings.filter(m => m.targetField).length,
      unmappedFields: mappingResult.unmappedFields.length
    })
    
    // Apply any manual overrides
    if (mappingOverrides && Object.keys(mappingOverrides).length > 0) {
      console.log(`[LEAD_IMPORT] ${requestId} - Applying ${Object.keys(mappingOverrides).length} mapping overrides`)
      
      mappingResult.mappings = mappingResult.mappings.map(mapping => {
        if (mappingOverrides[mapping.sourceHeader]) {
          console.log(`[LEAD_IMPORT] ${requestId} - Override: "${mapping.sourceHeader}" → ${mappingOverrides[mapping.sourceHeader]}`)
          return {
            ...mapping,
            targetField: mappingOverrides[mapping.sourceHeader],
            confidence: 1 // Manual override has full confidence
          }
        }
        return mapping
      })
    }

    // If confirmMapping is true, return the mapping for user confirmation
    if (confirmMapping) {
      console.log(`[LEAD_IMPORT] ${requestId} - Returning mapping for user confirmation`)
      return NextResponse.json({
        mappings: mappingResult.mappings,
        unmappedFields: mappingResult.unmappedFields,
        sampleData: data.slice(0, 3) // Return first 3 rows as sample
      })
    }

    // Process all rows and prepare bulk data
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log(`[LEAD_IMPORT] ${requestId} - Starting bulk lead preparation with batchId: ${batchId}`)
    
    const validLeads = []
    const errors = []
    const startProcessingTime = Date.now()

    // Pre-process all rows and collect valid leads
    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i]
        const { mappedData, extraData } = processRow(row, mappingResult.mappings)
        
        // Skip rows without any meaningful data
        if (!mappedData.email && !mappedData.businessName && !mappedData.firstName && !mappedData.lastName && !mappedData.phone) {
          errors.push({
            row: i + 1,
            error: 'Missing required data: need at least one of email, business name, first name, last name, or phone',
            data: row
          })
          continue
        }

        // Create lead data for bulk insert
        const leadData = {
          ...mappedData,
          source,
          stage: LeadStage.NEW,
          researchStatus: ResearchStatus.PENDING,
          extraData: Object.keys(extraData).length > 0 ? extraData : null,
          originalRow: row,
          importBatchId: batchId,
          organizationId
        }

        validLeads.push(leadData)
      } catch (error) {
        errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: data[i]
        })
      }
    }

    const preprocessingTime = Date.now() - startProcessingTime
    console.log(`[LEAD_IMPORT] ${requestId} - Data preprocessing complete in ${preprocessingTime}ms:`, {
      validLeads: validLeads.length,
      failed: errors.length,
      total: data.length
    })

    if (validLeads.length === 0) {
      console.error(`[LEAD_IMPORT] ${requestId} - No valid leads to import`)
      return NextResponse.json({
        success: false,
        error: 'No valid leads found',
        errors
      }, { status: 400 })
    }

    // Get AI agents for assignment if enabled
    let aiAgents = []
    if (autoAssign) {
      aiAgents = await db.user.findMany({
        where: {
          organizationId,
          isAIAgent: true,
          aiType: { in: ['LEAD_PROCESSOR', 'RESEARCHER'] }
        }
      })
      console.log(`[LEAD_IMPORT] ${requestId} - Found ${aiAgents.length} AI agents for assignment`)
    }

    // Pre-calculate assignments for all leads
    if (autoAssign && aiAgents.length > 0) {
      const assignmentTime = new Date()
      validLeads.forEach((leadData, index) => {
        const agent = aiAgents[index % aiAgents.length]
        leadData.assignedToId = agent.id
        leadData.assignedAt = assignmentTime
      })
      console.log(`[LEAD_IMPORT] ${requestId} - Pre-calculated round-robin assignments`)
    }

    // Chunk leads for bulk processing
    const CHUNK_SIZE = 1000
    const leadChunks = []
    for (let i = 0; i < validLeads.length; i += CHUNK_SIZE) {
      leadChunks.push(validLeads.slice(i, i + CHUNK_SIZE))
    }
    console.log(`[LEAD_IMPORT] ${requestId} - Split ${validLeads.length} leads into ${leadChunks.length} chunks of ${CHUNK_SIZE}`)

    // Execute bulk import with all-or-nothing transaction
    console.log(`[LEAD_IMPORT] ${requestId} - Starting bulk database operations`)
    const bulkStartTime = Date.now()
    
    let createdLeads = []
    
    try {
      await db.$transaction(async (tx) => {
        // Process each chunk within the transaction
        for (let chunkIndex = 0; chunkIndex < leadChunks.length; chunkIndex++) {
          const chunk = leadChunks[chunkIndex]
          
          console.log(`[LEAD_IMPORT] ${requestId} - Processing chunk ${chunkIndex + 1}/${leadChunks.length} (${chunk.length} leads)`)
          
          // Bulk insert leads
          await tx.lead.createMany({
            data: chunk,
            skipDuplicates: false
          })
        }
        
        // Create single activity record for the entire import
        await tx.activity.create({
          data: {
            type: 'LEAD_QUALIFICATION',
            title: 'Bulk Lead Import',
            description: `Imported ${validLeads.length} leads from spreadsheet`,
            metadata: {
              batchId,
              totalRows: data.length,
              successCount: validLeads.length,
              errorCount: errors.length,
              chunksProcessed: leadChunks.length
            },
            organizationId,
            status: 'COMPLETED'
          }
        })
      }, {
        maxWait: 30000, // 30 seconds max wait
        timeout: 60000  // 60 seconds timeout
      })
      
      // Handle assignments after transaction completes
      if (autoAssign && aiAgents.length > 0) {
        console.log(`[LEAD_IMPORT] ${requestId} - Creating assignment records`)
        const assignmentStartTime = Date.now()
        
        // Get all created leads with their IDs
        const insertedLeads = await db.lead.findMany({
          where: {
            importBatchId: batchId,
            organizationId,
            assignedToId: { not: null }
          },
          select: { id: true, assignedToId: true }
        })
        
        // Create assignment records in chunks
        if (insertedLeads.length > 0) {
          const assignmentRecords = insertedLeads.map(lead => ({
            leadId: lead.id,
            assignedToId: lead.assignedToId!,
            reason: 'Bulk import auto-assignment',
            status: 'ACTIVE' as const
          }))
          
          // Process assignment records in chunks
          const assignmentChunks = []
          for (let i = 0; i < assignmentRecords.length; i += CHUNK_SIZE) {
            assignmentChunks.push(assignmentRecords.slice(i, i + CHUNK_SIZE))
          }
          
          for (const assignmentChunk of assignmentChunks) {
            await db.leadAssignment.createMany({
              data: assignmentChunk
            })
          }
        }
        
        const assignmentTime = Date.now() - assignmentStartTime
        console.log(`[LEAD_IMPORT] ${requestId} - Assignment records created in ${assignmentTime}ms`)
      }
      
      // Get final results
      createdLeads = await db.lead.findMany({
        where: {
          importBatchId: batchId,
          organizationId
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          businessName: true
        }
      })
      
      const bulkTime = Date.now() - bulkStartTime
      const totalTime = Date.now() - startProcessingTime
      
      console.log(`[LEAD_IMPORT] ${requestId} - Bulk import completed successfully in ${bulkTime}ms (total: ${totalTime}ms)`)
      console.log(`[LEAD_IMPORT] ${requestId} - Final results: ${createdLeads.length} leads created, ${errors.length} errors`)
      
      return NextResponse.json({
        success: true,
        batchId,
        imported: createdLeads.length,
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined,
        leads: createdLeads,
        performance: {
          preprocessingTime: `${preprocessingTime}ms`,
          bulkImportTime: `${bulkTime}ms`,
          totalTime: `${totalTime}ms`
        }
      }, { status: 201 })
      
    } catch (error) {
      const bulkTime = Date.now() - bulkStartTime
      console.error(`[LEAD_IMPORT] ${requestId} - Bulk import failed after ${bulkTime}ms:`, error)
      
      return NextResponse.json({
        success: false,
        error: 'Bulk import failed - all changes rolled back',
        details: error instanceof Error ? error.message : 'Unknown error',
        imported: 0,
        failed: data.length
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error importing leads:', error)
    return NextResponse.json(
      { error: 'Failed to import leads', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}