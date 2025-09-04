"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Search, Menu, User } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface DashboardNavbarProps {
  onMenuToggle: () => void
  title?: string
}

export function DashboardNavbar({ onMenuToggle, title = "Dashboard" }: DashboardNavbarProps) {
  const { user } = useAuth()

  return (
    <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left side - Menu button and title */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
          </div>
        </div>

        {/* Right side - Search, notifications, user */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              3
            </Badge>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.email || 'Organizer'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Organizer
              </p>
            </div>
            
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
