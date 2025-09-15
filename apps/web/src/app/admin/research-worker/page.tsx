"use client"

import React, { useState } from 'react'
import { Bot, Play, Square, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ResearchWorkerPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const startWorker = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/research-worker', {
        method: 'POST'
      })
      
      if (response.ok) {
        setIsRunning(true)
        toast.success('Research worker started successfully!')
      } else {
        toast.error('Failed to start research worker')
      }
    } catch (error) {
      console.error('Error starting worker:', error)
      toast.error('Failed to start research worker')
    } finally {
      setIsLoading(false)
    }
  }

  const stopWorker = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/research-worker', {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setIsRunning(false)
        toast.success('Research worker stopped')
      } else {
        toast.error('Failed to stop research worker')
      }
    } catch (error) {
      console.error('Error stopping worker:', error)
      toast.error('Failed to stop research worker')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-h1 text-text-primary font-bold mb-2 flex items-center gap-3">
            <Bot className="h-8 w-8 text-accent" />
            Research Worker Control
          </h1>
          <p className="text-text-muted">
            Manage the background research worker that processes leads automatically
          </p>
        </div>

        <div className="bg-card rounded-card shadow-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-h3 text-text-primary font-semibold mb-1">Worker Status</h2>
              <p className="text-sm text-text-muted">
                The worker processes 5 leads every 45 seconds
              </p>
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-button ${
              isRunning ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
            }`}>
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="font-medium">Running</span>
                </>
              ) : (
                <>
                  <Square className="h-4 w-4" />
                  <span className="font-medium">Stopped</span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {!isRunning ? (
              <button
                onClick={startWorker}
                disabled={isLoading}
                className="btn-primary flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Start Worker
              </button>
            ) : (
              <button
                onClick={stopWorker}
                disabled={isLoading}
                className="btn-danger flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop Worker
              </button>
            )}
          </div>
        </div>

        <div className="bg-card rounded-card shadow-card p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">How It Works</h3>
          
          <div className="space-y-3 text-sm text-text-secondary">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-accent/10 text-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold">1</span>
              </div>
              <div>
                <p className="font-medium text-text-primary">Lead Discovery</p>
                <p>Finds leads with pending research status</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-accent/10 text-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold">2</span>
              </div>
              <div>
                <p className="font-medium text-text-primary">AI Research</p>
                <p>Uses OpenAI to gather company information</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-accent/10 text-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold">3</span>
              </div>
              <div>
                <p className="font-medium text-text-primary">Data Storage</p>
                <p>Stores findings and updates lead information</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-accent/10 text-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold">4</span>
              </div>
              <div>
                <p className="font-medium text-text-primary">Activity Logging</p>
                <p>Creates detailed activity records for tracking</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-card">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> The research worker runs a Claude agent with a Perplexity search tool and normalizes results via OpenAI. 
            Set <code>PERPLEXITY_API_KEY</code>, <code>ANTHROPIC_API_KEY</code>, and <code>OPENAI_API_KEY</code>.
          </p>
        </div>
      </div>
    </div>
  )
}
