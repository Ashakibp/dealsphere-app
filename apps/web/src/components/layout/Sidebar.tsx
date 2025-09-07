"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  Building2, 
  Users, 
  UserCircle,
  UsersRound,
  Settings,
  Bot,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationItem {
  name: string
  href: string
  icon: any
  isNew?: boolean
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Deals', href: '/deals', icon: FileText },
  { name: 'AI Lead Intake', href: '/ai-lead-intake', icon: Sparkles, isNew: true },
  { name: 'Merchants', href: '/merchants', icon: Building2 },
  { name: 'Brokers', href: '/brokers', icon: Users },
  { name: 'Contacts', href: '/contacts', icon: UserCircle },
  { name: 'Teams', href: '/teams', icon: UsersRound },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar flex flex-col border-r border-default">
      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold text-gradient">DealSphere</h1>
        <div className="w-full h-0.5 bg-gradient-accent mt-3 rounded-full opacity-60"></div>
      </div>
      
      <nav className="flex-1 px-4 pb-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
                           (item.href !== '/' && pathname.startsWith(item.href))
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-button transition-all text-sm relative",
                    "hover:bg-surface-hover hover:border-accent",
                    "border border-transparent",
                    isActive 
                      ? "bg-accent text-white border-accent" 
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                  {item.name === 'Teams' && (
                    <Bot className="h-4 w-4 ml-auto pulse-glow text-accent" />
                  )}
                  {item.isNew && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-accent text-white text-xs rounded-full font-bold animate-pulse">
                      NEW
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      <div className="p-4">
        <div className="bg-card-glass rounded-button p-3 border border-default">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-accent rounded-full pulse-glow"></div>
            <div className="text-xs text-text-secondary">
              <div className="font-medium text-text-primary">System Status</div>
              <div>All systems operational</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}