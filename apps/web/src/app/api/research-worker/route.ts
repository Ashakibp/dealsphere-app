import { NextRequest, NextResponse } from 'next/server'
import { researchWorker } from "@dealsphere/shared"

// This endpoint starts the research worker
export async function POST(request: NextRequest) {
  try {
    researchWorker.start()
    return NextResponse.json({ 
      success: true, 
      message: 'Research worker started' 
    })
  } catch (error) {
    console.error('Error starting research worker:', error)
    return NextResponse.json(
      { error: 'Failed to start research worker' },
      { status: 500 }
    )
  }
}

// This endpoint stops the research worker
export async function DELETE(request: NextRequest) {
  try {
    researchWorker.stop()
    return NextResponse.json({ 
      success: true, 
      message: 'Research worker stopped' 
    })
  } catch (error) {
    console.error('Error stopping research worker:', error)
    return NextResponse.json(
      { error: 'Failed to stop research worker' },
      { status: 500 }
    )
  }
}

// This endpoint checks the worker status
export async function GET(request: NextRequest) {
  const status = researchWorker.getStatus()
  return NextResponse.json({
    status: status.running ? 'running' : 'stopped',
    intervalMs: status.intervalMs,
    batchSize: status.batchSize,
    message: 'Research worker status'
  })
}
