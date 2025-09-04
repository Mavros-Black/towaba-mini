"use client"

import { useState } from 'react'
import { DashboardSidebar } from './dashboard-sidebar'
import { DashboardNavbar } from './dashboard-navbar'

interface DashboardWrapperProps {
  children: React.ReactNode
  title?: string
}

export function DashboardWrapper({ children, title }: DashboardWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navbar at the very top - full width */}
      <DashboardNavbar onMenuToggle={toggleSidebar} title={title} />
      
      {/* Content area with sidebar and main content side by side */}
      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        
        {/* Main content area */}
        <div className="flex-1 lg:ml-64">
          <main className="p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
