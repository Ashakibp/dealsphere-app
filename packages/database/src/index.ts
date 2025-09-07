import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { join } from 'path'
import { existsSync } from 'fs'

// Load environment variables from monorepo root
// Try multiple possible paths to find the .env file
const possibleEnvPaths = [
  join(process.cwd(), '.env'),                    // From current working directory (most likely)
  join(__dirname, '../../../.env'),               // From built dist/
  join(process.cwd(), 'apps/web/.env'),          // Web app specific
  join(process.cwd(), '../../.env'),             // From package directory up two levels
  '/Users/aaronshakib/Documents/dev/dealsphere-app/.env', // Absolute fallback path
  join(__dirname, '../../.env'),                  // Alternative path
  join(__dirname, '../.env'),                     // Another alternative
]

let envLoaded = false
for (const envPath of possibleEnvPaths) {
  if (existsSync(envPath)) {
    config({ path: envPath })
    console.log(`[DATABASE] Loaded environment variables from: ${envPath}`)
    envLoaded = true
    break
  }
}

if (!envLoaded) {
  console.warn(`[DATABASE] Warning: Could not find .env file in any expected location`)
  console.warn(`[DATABASE] Searched paths:`, possibleEnvPaths)
  console.warn(`[DATABASE] Current working directory:`, process.cwd())
  console.warn(`[DATABASE] __dirname:`, __dirname)
}

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const db = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = db
}

export * from '@prisma/client'