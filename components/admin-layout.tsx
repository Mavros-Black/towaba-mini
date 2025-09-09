'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard,
  Users,
  Megaphone,
  DollarSign,
  BarChart3,
  Settings,
  Shield,
  HelpCircle,
  Menu,
  X,
  LogOut,
  Search,
  Bell,
  User,
  CreditCard,
  FileText
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface AdminLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Campaigns',
    href: '/admin/campaigns',
    icon: Megaphone,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Payments',
    href: '/admin/payments',
    icon: DollarSign,
  },
  {
    name: 'Payouts',
    href: '/admin/payouts',
    icon: CreditCard,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: FileText,
  },
  {
    name: 'Security',
    href: '/admin/security',
    icon: Shield,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    name: 'Support',
    href: '/admin/support',
    icon: HelpCircle,
  },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const notificationsRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignOut = () => {
    // Implement sign out logic
    console.log('Signing out...')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-background border-r">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Admin Panel</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
          <div className="absolute bottom-4 left-4 right-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="fixed inset-y-0 flex w-64 flex-col">
        <div className="flex flex-col flex-grow bg-background border-r">
          <div className="flex items-center h-16 px-4 border-b">
            <h2 className="text-lg font-semibold">Admin Panel</h2>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <div className="fixed top-0 left-64 right-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 shadow-sm sm:px-6 px-8">
          {/* Left side - Mobile menu and search */}
          <div className="flex items-center gap-x-4 flex-1">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search campaigns, users, payments..."
                  className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center gap-x-2">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative h-9 w-9 p-0"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center font-medium">
                  3
                </span>
              </Button>
                
                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-md shadow-lg z-50">
                    <div className="p-4 border-b">
                      <h3 className="text-sm font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="p-3 border-b hover:bg-muted cursor-pointer">
                        <p className="text-sm font-medium">New campaign submitted</p>
                        <p className="text-xs text-muted-foreground">America's Got Talent - 2 minutes ago</p>
                      </div>
                      <div className="p-3 border-b hover:bg-muted cursor-pointer">
                        <p className="text-sm font-medium">Payment processed</p>
                        <p className="text-xs text-muted-foreground">₵50.00 - 15 minutes ago</p>
                      </div>
                      <div className="p-3 hover:bg-muted cursor-pointer">
                        <p className="text-sm font-medium">User registration</p>
                        <p className="text-xs text-muted-foreground">John Doe - 1 hour ago</p>
                      </div>
                    </div>
                    <div className="p-2 border-t">
                      <Button variant="ghost" size="sm" className="w-full">
                        View all notifications
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
            <div className="h-6 w-px bg-border mx-2" />
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-x-2 h-9 px-2"
              >
                <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium leading-none">Admin User</p>
                  <p className="text-xs text-muted-foreground leading-none mt-0.5">admin@towaba.com</p>
                </div>
              </Button>
                
                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-md shadow-lg z-50">
                    <div className="p-3 border-b">
                      <p className="text-sm font-medium">Admin User</p>
                      <p className="text-xs text-muted-foreground">admin@towaba.com</p>
                    </div>
                    <div className="py-1">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                      <div className="border-t my-1" />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start text-red-600 hover:text-red-700"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="pt-20 pb-6">
          {children}
        </main>
      </div>
    </div>
  )
}
