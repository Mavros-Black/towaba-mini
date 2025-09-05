"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  Award, 
  CreditCard, 
  Settings, 
  LogOut, 
  Menu,
  X,
  User,
  DollarSign,
  BarChart3
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface DashboardSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function DashboardSidebar({ isOpen, onToggle }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/organizer/dashboard',
      icon: LayoutDashboard,
      current: pathname === '/organizer/dashboard'
    },
    {
      name: 'Campaigns',
      href: '/organizer/campaigns',
      icon: Award,
      current: pathname.startsWith('/organizer/campaigns')
    },
    {
      name: 'Votes',
      href: '/organizer/votes',
      icon: CreditCard,
      current: pathname === '/organizer/votes'
    },
    {
      name: 'Payments',
      href: '/organizer/payments',
      icon: DollarSign,
      current: pathname === '/organizer/payments'
    },
    {
      name: 'Analytics & Reports',
      href: '/organizer/analytics',
      icon: BarChart3,
      current: pathname === '/organizer/analytics'
    },
    {
      name: 'Settings',
      href: '/organizer/settings',
      icon: Settings,
      current: pathname === '/organizer/settings'
    }
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

                     {/* Sidebar */}
        <div className={`
          fixed top-16 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          transform transition-transform duration-300 ease-in-out flex flex-col h-[calc(100vh-4rem)]
          lg:translate-x-0 lg:fixed lg:z-50 lg:top-0 lg:h-screen
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <Award className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Towaba</span>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.email || 'Organizer'}
              </p>
              <Badge variant="secondary" className="text-xs">
                Organizer
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${item.current
                    ? 'bg-primary text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
                onClick={() => {
                  // Close mobile sidebar when clicking a link
                  if (window.innerWidth < 1024) {
                    onToggle()
                  }
                }}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sign Out - at the bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  )
}
