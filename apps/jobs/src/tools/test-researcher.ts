#!/usr/bin/env tsx
import 'dotenv/config'
import { runClaudePerplexityAgentStructured } from '@dealsphere/shared'

type Args = {
  business?: string
  first?: string
  last?: string
  email?: string
  industry?: string
  revenue?: string
}

function parseArgs(argv: string[]): Args {
  const args: Args = {}
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    const n = (k: string) => a === `--${k}` || a.startsWith(`--${k}=`)
    const v = () => {
      const eq = a.indexOf('=')
      if (eq > -1) return a.slice(eq + 1)
      return argv[++i]
    }
    if (n('business')) args.business = v()
    else if (n('first')) args.first = v()
    else if (n('last')) args.last = v()
    else if (n('email')) args.email = v()
    else if (n('industry')) args.industry = v()
    else if (n('revenue')) args.revenue = v()
  }
  return args
}

async function main() {
  const required = ['PERPLEXITY_API_KEY', 'ANTHROPIC_API_KEY', 'OPENAI_API_KEY'] as const
  const missing = required.filter((k) => !process.env[k])
  if (missing.length) {
    console.error(`Missing env vars: ${missing.join(', ')}`)
    console.error('Set them in your environment or .env file before running.')
    process.exit(1)
  }

  const args = parseArgs(process.argv)
  const lead = {
    businessName: args.business || process.env.TEST_BUSINESS || 'Acme Coffee Roasters',
    firstName: args.first || process.env.TEST_FIRST || 'Jane',
    lastName: args.last || process.env.TEST_LAST || 'Doe',
    email: args.email || process.env.TEST_EMAIL || 'hello@acmecoffee.com',
    industry: args.industry || process.env.TEST_INDUSTRY || 'Food & Beverage',
    monthlyRevenue: args.revenue ? Number(args.revenue) : (process.env.TEST_REVENUE ? Number(process.env.TEST_REVENUE) : undefined),
  }

  console.log('=== Researcher Test ===')
  console.log('Lead:', lead)
  const start = Date.now()
  try {
    const result = await runClaudePerplexityAgentStructured(lead)
    const ms = Date.now() - start
    console.log('\nResult (', ms, 'ms ):')
    console.log(JSON.stringify(result, null, 2))
    // Helpful summary
    const { companyInfo = {}, businessAnalysis = {}, confidence, sources = [] } = result as any
    console.log('\nSummary:')
    console.log('- Industry:', companyInfo.industry || businessAnalysis.industryClassification || 'n/a')
    console.log('- Website:', companyInfo.website || 'n/a')
    console.log('- Est. Revenue:', companyInfo.estimatedRevenue ? `$${companyInfo.estimatedRevenue.toLocaleString()}/mo` : 'n/a')
    console.log('- Employees:', companyInfo.employeeCount || 'n/a')
    console.log('- Confidence:', confidence ?? 'n/a')
    console.log('- Sources:', sources.slice(0, 5))
  } catch (err: any) {
    const ms = Date.now() - start
    console.error('\nResearch failed (', ms, 'ms ):', err?.message || err)
    process.exit(2)
  }
}

main()

