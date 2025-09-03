"use client"

import React, { useState } from 'react'
import { Search, ChevronDown, Command } from 'lucide-react'
import * as Avatar from '@radix-ui/react-avatar'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import SmartNotifications from '@/components/ai/SmartNotifications'

export default function TopBar() {
  const [organization, setOrganization] = useState('Acme Capital')

  return (
    <div className="h-16 bg-surface-glass border-b border-default fixed top-0 left-64 right-0 z-10">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="btn-ghost flex items-center gap-2">
              <span className="font-semibold">{organization}</span>
              <ChevronDown className="h-4 w-4 text-text-muted" />
            </DropdownMenu.Trigger>
            
            <DropdownMenu.Portal>
              <DropdownMenu.Content 
                className="min-w-[200px] bg-surface rounded-card shadow-elevated p-2 z-50 animate-scale-in border border-default"
                sideOffset={8}
              >
                <DropdownMenu.Item 
                  className="px-3 py-2 text-sm rounded hover:bg-gray-50 cursor-pointer outline-none"
                  onSelect={() => setOrganization('Acme Capital')}
                >
                  Acme Capital
                </DropdownMenu.Item>
                <DropdownMenu.Item 
                  className="px-3 py-2 text-sm rounded hover:bg-gray-50 cursor-pointer outline-none"
                  onSelect={() => setOrganization('Velocity Funding')}
                >
                  Velocity Funding
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-[1px] bg-gray-200 my-1" />
                <DropdownMenu.Item className="px-3 py-2 text-sm rounded hover:bg-gray-50 cursor-pointer outline-none">
                  Add Organization
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search deals, merchants, brokers..."
              className="w-full pl-10 pr-16 py-2.5 bg-card-glass border border-default rounded-button text-sm focus:outline-none focus:border-accent transition-all placeholder:text-text-muted"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-surface-hover rounded text-text-muted border border-border-light">
              <Command className="h-3 w-3" />
              <span className="text-xs font-medium">K</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <SmartNotifications />

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="outline-none">
                <Avatar.Root className="inline-flex h-8 w-8 select-none items-center justify-center overflow-hidden rounded-full bg-primary">
                  <Avatar.Image 
                    className="h-full w-full object-cover" 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop" 
                    alt="User avatar" 
                  />
                  <Avatar.Fallback className="text-white text-sm font-medium">
                    JD
                  </Avatar.Fallback>
                </Avatar.Root>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content 
                className="min-w-[200px] bg-surface rounded-lg shadow-elevated p-1 z-50"
                sideOffset={5}
              >
                <DropdownMenu.Item className="px-3 py-2 text-sm rounded hover:bg-gray-50 cursor-pointer outline-none">
                  Profile
                </DropdownMenu.Item>
                <DropdownMenu.Item className="px-3 py-2 text-sm rounded hover:bg-gray-50 cursor-pointer outline-none">
                  Account Settings
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-[1px] bg-gray-200 my-1" />
                <DropdownMenu.Item className="px-3 py-2 text-sm rounded hover:bg-gray-50 cursor-pointer outline-none">
                  Sign Out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </div>
  )
}