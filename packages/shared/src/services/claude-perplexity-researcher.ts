import type {ResearchResult} from "../types"
import type {Lead} from "@dealsphere/database"
import {z} from "zod"
import {openai} from "@ai-sdk/openai"
import {generateObject} from "ai"

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

// Final structured schema for OpenAI
const ResearchResultSchema = z.object({
    companyInfo: z.object({
        industry: z.string().optional(),
        estimatedRevenue: z.number().optional(),
        employeeCount: z.string().optional(),
        founded: z.string().optional(),
        description: z.string().optional(),
        website: z.string().optional(),
    }).partial().default({}),
    contactValidation: z.object({
        emailValid: z.boolean().optional(),
        phoneValid: z.boolean().optional(),
        socialProfiles: z.array(z.string()).optional(),
    }).partial().default({}),
    businessAnalysis: z.object({
        industryClassification: z.string().optional(),
        revenueRange: z.string().optional(),
        businessType: z.string().optional(),
        riskScore: z.number().optional(),
    }).partial().default({}),
    confidence: z.number().min(0).max(1).optional(),
    sources: z.array(z.string()).optional(),
})

type OpenAIResult = z.infer<typeof ResearchResultSchema>

// Perplexity tool types
interface PerplexityToolInput {
    query: string
    focus?: string
}

interface PerplexitySource {
    url: string
    title?: string
    snippet?: string
}

interface PerplexitySearchResult {
    sources: PerplexitySource[]
    findings: string
}

// Anthropic message content types (minimal)
type AnthropicTextBlock = { type: "text"; text: string }
type AnthropicToolUseBlock = { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
type AnthropicContentBlock = AnthropicTextBlock | AnthropicToolUseBlock

// Tool result block appended back to Claude
type AnthropicToolResultBlock = { type: "tool_result"; tool_use_id: string; content: string }

// Tool: Perplexity search executor
async function toolPerplexitySearch(input: PerplexityToolInput): Promise<PerplexitySearchResult> {
    if (!PERPLEXITY_API_KEY) throw new Error("PERPLEXITY_API_KEY not set")
    const q = input?.query || ""
    const focus = input?.focus ? `\nFocus: ${input.focus}` : ""
    const prompt = `Search the web for: ${q}${focus}\nReturn JSON with fields: { sources: [{url,title,snippet}], findings: string }. Keep findings concise; no markdown.`

    const resp = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        },
        body: JSON.stringify({
            model: "sonar",
            messages: [
                {role: "system", content: "You are a precise research assistant. Return only JSON."},
                {role: "user", content: prompt},
            ],
        }),
    })
    if (!resp.ok) {
        const text = await resp.text().catch(() => "")
        throw new Error(`Perplexity error: ${resp.status} ${resp.statusText} ${text}`)
    }
    const data = await resp.json()
    const content: string = data?.choices?.[0]?.message?.content || "{}"
    try {
        const parsed = JSON.parse(content)
        return {
            sources: Array.isArray(parsed?.sources) ? parsed.sources.filter((s: any) => typeof s?.url === "string") : [],
            findings: typeof parsed?.findings === "string" ? parsed.findings : "",
        }
    } catch {
        return {sources: [], findings: content}
    }
}

// Claude agent loop with tool use (perplexity_search)
export async function runClaudePerplexityAgentStructured(
    lead: Pick<Lead, "firstName" | "lastName" | "businessName" | "email" | "industry" | "monthlyRevenue">
): Promise<ResearchResult> {
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set")

    // Conversation state
    const messages: Array<{
        role: "user" | "assistant"
        content: Array<AnthropicContentBlock | AnthropicToolResultBlock>
    }> = [
        {
            role: "user",
            content: [
                {
                    type: "text",
                    text:
                        `Research this lead thoroughly using the available web search tool. ` +
                        `When finished, output ONLY JSON with keys: { report: string, extracted: {industry?, estimatedRevenue?, employeeCount?, businessType?, website?, founded?, riskSignals?: string[]}, sources: string[] }.` +
                        `\nLead context: ${JSON.stringify({
                            businessName: lead.businessName,
                            personName: [lead.firstName, lead.lastName].filter(Boolean).join(" "),
                            email: lead.email,
                            industry: lead.industry,
                            monthlyRevenue: lead.monthlyRevenue,
                        })}`,
                },
            ],
        },
    ]

    const tools = [
        {
            name: "perplexity_search",
            description: "Search the web via Perplexity and return JSON string with findings and sources.",
            input_schema: {
                type: "object",
                properties: {
                    query: {type: "string", description: "Search query string"},
                    focus: {type: "string", description: "Optional focus refinement"},
                },
                required: ["query"],
            },
        },
    ]

    const model = "claude-opus-4-1-20250805"
    const maxIterations = 20
    let iterations = 0

    while (true) {
        iterations++
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model,
                max_tokens: 1400,
                tools,
                messages,
                temperature: 0.2,
                system: "You are an autonomous research agent. Use tools when needed; finish with a single JSON object only.",
            }),
        })
        if (!resp.ok) {
            const text = await resp.text().catch(() => "")
            throw new Error(`Anthropic error: ${resp.status} ${resp.statusText} ${text}`)
        }
        const data = await resp.json()
        const content: AnthropicContentBlock[] = data?.content || []

        // Check for tool use blocks
        let usedTool = false
        for (const block of content) {
            console.log(block)
            if ((block as AnthropicToolUseBlock).type === "tool_use" && (block as AnthropicToolUseBlock).name === "perplexity_search") {
                usedTool = true
                const toolBlock = block as AnthropicToolUseBlock
                // @ts-ignore
                const input = toolBlock.input as PerplexityToolInput
                const toolUseId = toolBlock.id
                const result = await toolPerplexitySearch(input)
                console.log(result)
                // Append tool result as next message
                messages.push(
                    {
                        role: "assistant",
                        content: [block],
                    }
                )
                messages.push({
                    role: "user",
                    content: [
                        {
                            type: "tool_result",
                            tool_use_id: toolUseId,

                            content: JSON.stringify(result),
                        },
                    ],
                })
            }
        }

        // If no tool used, assume final text provided
        if (!usedTool) {
            // Get the assistant text (should be JSON)
            const textBlock = content.find((b: AnthropicContentBlock) => b.type === "text") as AnthropicTextBlock | undefined
            const jsonText: string = textBlock?.text || "{}"

            console.log("Outputted JSON:", jsonText)

            // 3) Normalize via OpenAI to strict schema
            const {object} = await generateObject({
                model: openai("gpt-4o"),
                schema: ResearchResultSchema,
                prompt: `Normalize this JSON to the target schema: ${jsonText}`,
                temperature: 0.0,
            })

            const structured: OpenAIResult = object
            const result: ResearchResult = structured as unknown as ResearchResult
            if (result.confidence === undefined) result.confidence = 0.75
            if (!result.sources) result.sources = []
            return result
        }

        // Continue loop; Claude will receive tool_result we just appended
    }

    // Fallback if exceeded iterations
    return {companyInfo: {}, contactValidation: {}, businessAnalysis: {}, confidence: 0.5, sources: []}
}
