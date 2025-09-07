import {openai} from '@ai-sdk/openai'
import {generateObject} from 'ai'
import {z} from 'zod'

// Define the structure for field mapping
export interface FieldMapping {
    sourceHeader: string
    targetField: string | null
    confidence: number
}


export type FieldMappingResult = {
    mappings: {
        sourceHeader: string;
        targetField: string | null;
        confidence: number;
    }[];
    unmappedFields: string[];
};

// 2) Declare the Zod schema and explicitly tie it to the type
export const fieldMappingResultSchema: z.ZodType<FieldMappingResult> = z.object({
    mappings: z.array(
        z.object({
            sourceHeader: z.string(),
            targetField: z.string().nullable(),
            confidence: z.number().min(0).max(1),
        })
    ),
    unmappedFields: z.array(z.string()),
});

// Define our known lead fields
const LEAD_FIELDS = {
    firstName: 'First name of the person',
    lastName: 'Last name of the person',
    email: 'Email address',
    phone: 'Phone number',
    businessName: 'Company or business name',
    requestedAmount: 'Amount of funding requested',
    monthlyRevenue: 'Monthly revenue or sales',
    industry: 'Business industry or sector'
}

export async function analyzeHeaders(headers: string[]): Promise<FieldMappingResult> {
    console.log(`[FIELD_MAPPER] Starting analysis of ${headers.length} headers:`, headers)

    const systemPrompt = `You are a data mapping expert. Your job is to map CSV/Excel column headers to database fields.

Available target fields and their descriptions:
${Object.entries(LEAD_FIELDS).map(([field, desc]) => `- ${field}: ${desc}`).join('\n')}

Rules:
1. Be flexible with variations (e.g., "Company" → businessName, "First" → firstName)
2. Handle common abbreviations and formats
3. Handle different cases and spacing (e.g., "First Name", "first_name", "FirstName")
4. Common industry terms should map correctly (e.g., "Revenue" → monthlyRevenue, "Funding Amount" → requestedAmount)
5. If a header clearly doesn't match any field, set targetField to null
6. Return confidence score between 0 and 1 for each mapping
7. Put headers with null targetField in unmappedFields array`

    const userPrompt = `Map these CSV/Excel headers to our database fields:
${JSON.stringify(headers)}

Return a JSON object with this exact structure:
{
  "mappings": [
    {
      "sourceHeader": "original column name",
      "targetField": "database field name or null",
      "confidence": 0.95
    }
  ],
  "unmappedFields": ["headers that don't match any field"]
}`

    try {
        console.log('[FIELD_MAPPER] Sending request to LLM for header analysis')
        const startTime = Date.now()

        const model = openai('gpt-4o')

        // @ts-ignore
        const {object} = await generateObject<FieldMappingResult>({
            model,
            prompt: `${systemPrompt}\n\n${userPrompt}`,
            schema: fieldMappingResultSchema,
        });

        const result = object
        const processingTime = Date.now() - startTime
        console.log('[FIELD_MAPPER] Parsed LLM result:', result)

        // Validate the response structure
        if (!result.mappings || !Array.isArray(result.mappings)) {
            console.error('[FIELD_MAPPER] Invalid response structure from LLM:', result)
            throw new Error('Invalid response structure from LLM')
        }

        // Ensure unmappedFields is populated correctly
        const unmappedFields = result.mappings
            .filter((m: FieldMapping) => m.targetField === null)
            .map((m: FieldMapping) => m.sourceHeader)

        console.log(`[FIELD_MAPPER] Successfully mapped ${result.mappings.length} headers`)
        console.log(`[FIELD_MAPPER] Mapped fields:`, result.mappings.filter((m: FieldMapping) => m.targetField).length)
        console.log(`[FIELD_MAPPER] Unmapped fields:`, unmappedFields.length, unmappedFields)

        return {
            mappings: result.mappings,
            unmappedFields
        }
    } catch (error) {
        console.error('[FIELD_MAPPER] Error analyzing headers:', error)
        console.log('[FIELD_MAPPER] Falling back to basic mapping')

        // Fallback to basic mapping if LLM fails
        return fallbackMapping(headers)
    }
}

// Fallback mapping using simple string matching
function fallbackMapping(headers: string[]): FieldMappingResult {
    console.log('[FIELD_MAPPER] Using fallback mapping for headers:', headers)

    const mappings: FieldMapping[] = []
    const unmappedFields: string[] = []

    const fieldPatterns: Record<string, RegExp[]> = {
        firstName: [/^first[\s_-]?name$/i, /^first$/i, /^fname$/i],
        lastName: [/^last[\s_-]?name$/i, /^last$/i, /^lname$/i, /^surname$/i],
        email: [/^email$/i, /^e[\s_-]?mail$/i, /^email[\s_-]?address$/i],
        phone: [/^phone$/i, /^phone[\s_-]?number$/i, /^telephone$/i, /^mobile$/i, /^cell$/i],
        businessName: [/^company$/i, /^business[\s_-]?name$/i, /^organization$/i, /^corp$/i],
        requestedAmount: [/^requested[\s_-]?amount$/i, /^funding[\s_-]?amount$/i, /^loan[\s_-]?amount$/i, /^amount$/i],
        monthlyRevenue: [/^monthly[\s_-]?revenue$/i, /^revenue$/i, /^monthly[\s_-]?sales$/i, /^sales$/i],
        industry: [/^industry$/i, /^sector$/i, /^business[\s_-]?type$/i, /^category$/i]
    }

    for (const header of headers) {
        let mapped = false

        for (const [field, patterns] of Object.entries(fieldPatterns)) {
            if (patterns.some(pattern => pattern.test(header))) {
                console.log(`[FIELD_MAPPER] Fallback mapped "${header}" → ${field}`)
                mappings.push({
                    sourceHeader: header,
                    targetField: field,
                    confidence: 0.8
                })
                mapped = true
                break
            }
        }

        if (!mapped) {
            console.log(`[FIELD_MAPPER] No fallback mapping found for "${header}"`)
            mappings.push({
                sourceHeader: header,
                targetField: null,
                confidence: 0
            })
            unmappedFields.push(header)
        }
    }

    console.log(`[FIELD_MAPPER] Fallback mapping complete: ${mappings.length} total, ${unmappedFields.length} unmapped`)
    return {mappings, unmappedFields}
}

// Parse value based on the target field type
export function parseFieldValue(value: any, targetField: string): any {
    if (value === null || value === undefined || value === '') {
        return null
    }

    console.log(`[FIELD_MAPPER] Parsing value "${value}" for field "${targetField}"`)

    switch (targetField) {
        case 'requestedAmount':
        case 'monthlyRevenue':
            // Remove currency symbols and commas, then parse as float
            const cleanValue = String(value).replace(/[$,]/g, '').trim()
            const parsed = parseFloat(cleanValue)
            return isNaN(parsed) ? null : parsed

        case 'email':
            // Basic email validation and normalization
            const email = String(value).toLowerCase().trim()
            return email.includes('@') ? email : null

        case 'phone':
            // Remove non-numeric characters except + for international
            return String(value).replace(/[^\d+]/g, '').trim() || null

        case 'firstName':
        case 'lastName':
        case 'businessName':
        case 'industry':
            // Trim whitespace for text fields
            return String(value).trim() || null

        default:
            return value
    }
}

// Process a row of data using the mapping
export function processRow(row: Record<string, any>, mappings: FieldMapping[]): {
    mappedData: Record<string, any>
    extraData: Record<string, any>
} {
    console.log(`[FIELD_MAPPER] Processing row with ${mappings.length} mappings`)

    const mappedData: Record<string, any> = {}
    const extraData: Record<string, any> = {}

    for (const mapping of mappings) {
        const value = row[mapping.sourceHeader]

        if (mapping.targetField) {
            const parsedValue = parseFieldValue(value, mapping.targetField)
            mappedData[mapping.targetField] = parsedValue
            console.log(`[FIELD_MAPPER] Mapped "${mapping.sourceHeader}": "${value}" → ${mapping.targetField}: "${parsedValue}"`)
        } else if (value !== null && value !== undefined && value !== '') {
            // Store unmapped fields in extraData
            extraData[mapping.sourceHeader] = value
            console.log(`[FIELD_MAPPER] Stored in extraData "${mapping.sourceHeader}": "${value}"`)
        }
    }

    console.log(`[FIELD_MAPPER] Row processing complete - mapped: ${Object.keys(mappedData).length}, extra: ${Object.keys(extraData).length}`)
    return {mappedData, extraData}
}