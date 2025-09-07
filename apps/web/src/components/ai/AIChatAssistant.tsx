"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  insights?: {
    type: 'success' | 'warning' | 'info'
    title: string
    value: string
  }[]
}

const initialMessages: Message[] = [
  {
    id: '1',
    type: 'assistant',
    content: 'Hello! I\'m your AI assistant for DealSphere. I can help you analyze deals, assess risk, and provide funding recommendations. What would you like to know?',
    timestamp: new Date(),
  }
]

const examplePrompts = [
  "Analyze the risk profile for merchant ID #12345",
  "Show me trending metrics for this quarter", 
  "What deals need immediate attention?",
  "Generate funding recommendations for new applications"
]

export default function AIChatAssistant() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const simulateAIResponse = (userMessage: string): Message => {
    const responses = [
      {
        content: "Based on your recent data, I've identified 3 high-priority deals that require immediate attention. Deal #A4521 shows elevated risk indicators with a 23% higher default probability than average.",
        insights: [
          { type: 'warning' as const, title: 'High Risk Deal', value: 'Deal #A4521' },
          { type: 'info' as const, title: 'Risk Score', value: '7.2/10' },
          { type: 'success' as const, title: 'Recommended Action', value: 'Review Documentation' }
        ]
      },
      {
        content: "Your funding velocity has increased 34% this quarter. Current pipeline shows $12.4M in potential deals with an average approval rate of 78%. I recommend focusing on the underwriting bottleneck to improve processing time.",
        insights: [
          { type: 'success' as const, title: 'Funding Growth', value: '+34%' },
          { type: 'info' as const, title: 'Pipeline Value', value: '$12.4M' },
          { type: 'warning' as const, title: 'Bottleneck', value: 'Underwriting Stage' }
        ]
      },
      {
        content: "I've analyzed the merchant's cash flow patterns and credit history. The risk profile is favorable with consistent daily deposits averaging $45K. Recommended funding amount: $180K with 18-month term.",
        insights: [
          { type: 'success' as const, title: 'Daily Deposits', value: '$45K avg' },
          { type: 'info' as const, title: 'Recommendation', value: '$180K funding' },
          { type: 'success' as const, title: 'Risk Level', value: 'Low-Medium' }
        ]
      }
    ]
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: randomResponse.content,
      timestamp: new Date(),
      insights: randomResponse.insights
    }
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = simulateAIResponse(inputValue)
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500 + Math.random() * 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt)
    inputRef.current?.focus()
  }

  return (
    <div className="bg-card rounded-card shadow-card card-hover h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border-light">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-accent" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">AI Assistant</h3>
            <p className="text-xs text-text-muted">Powered by DealSphere Intelligence</p>
          </div>
          <div className="ml-auto">
            <Sparkles className="h-4 w-4 text-accent animate-pulse" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.type === 'user' ? "justify-end" : "justify-start"
            )}
          >
            {message.type === 'assistant' && (
              <div className="w-7 h-7 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-3.5 w-3.5 text-accent" />
              </div>
            )}
            
            <div className={cn(
              "max-w-[80%] space-y-2",
              message.type === 'user' ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "px-4 py-3 rounded-xl text-sm",
                message.type === 'user'
                  ? "bg-accent text-white ml-auto"
                  : "bg-surface-glass border border-border-light"
              )}>
                <p className="leading-relaxed">{message.content}</p>
              </div>
              
              {message.insights && (
                <div className="grid grid-cols-1 gap-2 mt-3">
                  {message.insights.map((insight, index) => (
                    <div
                      key={index}
                      className={cn(
                        "px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-2",
                        insight.type === 'success' && "bg-success/10 border-success/20 text-success",
                        insight.type === 'warning' && "bg-warning/10 border-warning/20 text-warning",
                        insight.type === 'info' && "bg-primary/10 border-primary/20 text-primary"
                      )}
                    >
                      {insight.type === 'success' && <CheckCircle className="h-3 w-3" />}
                      {insight.type === 'warning' && <AlertTriangle className="h-3 w-3" />}
                      {insight.type === 'info' && <TrendingUp className="h-3 w-3" />}
                      <span className="opacity-80">{insight.title}:</span>
                      <span className="font-semibold">{insight.value}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-text-muted px-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {message.type === 'user' && (
              <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-7 h-7 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="h-3.5 w-3.5 text-accent" />
            </div>
            <div className="px-4 py-3 rounded-xl bg-surface-glass border border-border-light">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Example Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-text-muted mb-2">Try asking:</p>
          <div className="grid grid-cols-1 gap-1">
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handlePromptClick(prompt)}
                className="text-left text-xs text-text-secondary hover:text-accent hover:bg-accent/5 px-2 py-1 rounded transition-colors"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border-light">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about deals, risk, or get recommendations..."
            className="flex-1 px-3 py-2 bg-surface-glass border border-border-light rounded-button text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-text-muted"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className={cn(
              "px-3 py-2 rounded-button transition-all flex items-center justify-center",
              inputValue.trim() && !isTyping
                ? "bg-accent text-white hover:bg-accent/90 shadow-sm"
                : "bg-surface-hover text-text-muted cursor-not-allowed"
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}