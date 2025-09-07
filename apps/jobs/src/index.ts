#!/usr/bin/env node
import { config } from 'dotenv'
import { join } from 'path'
import { researchWorker } from '@dealsphere/shared'

// Load environment variables from root directory
config({ path: join(__dirname, '../../../.env') })

console.log('🚀 Starting Dealsphere Jobs Service')
console.log('📍 Environment:', process.env.NODE_ENV || 'development')
console.log('🔗 Database URL:', process.env.DATABASE_URL ? 'Connected' : 'Not configured')
console.log('🤖 OpenAI API Key:', process.env.OPENAI_API_KEY ? `Loaded (${process.env.OPENAI_API_KEY.slice(0, 10)}...)` : 'Not configured')

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📛 Received SIGINT, shutting down gracefully...')
  researchWorker.stop()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n📛 Received SIGTERM, shutting down gracefully...')
  researchWorker.stop()
  process.exit(0)
})

// Start the research worker
console.log('🔬 Starting Research Worker...')
researchWorker.start()

console.log('✅ Jobs service started. Press Ctrl+C to stop.')

// Keep the process alive
setInterval(() => {
  // Heartbeat to keep process alive
}, 30000)