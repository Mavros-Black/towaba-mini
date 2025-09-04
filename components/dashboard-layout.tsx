"use client"

import { useState } from 'react'
import { DashboardSidebar } from './dashboard-sidebar'
import { DashboardNavbar } from './dashboard-navbar'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <DashboardSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Main content area */}
      <div className="lg:ml-64">
        {/* Navbar */}
        <DashboardNavbar onMenuToggle={toggleSidebar} title={title} />
        
        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
