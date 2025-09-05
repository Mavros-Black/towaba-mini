"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Button } from '@/components/ui/button'
import { Menu, X, User, LogOut } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Campaigns', href: '/campaigns' },
  { name: 'How To', href: '/how-to' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Contact', href: '/contact' },
]

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const { user, signOut } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/30 dark:border-slate-700/30 shadow-lg rounded-2xl w-[80%] max-w-6xl">
      <div className="px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <span className="text-amber-400 font-black text-xl">T</span>
              </motion.div>
              <span className="text-2xl font-black text-slate-800 dark:text-white">
                Towaba
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    pathname === item.href
                      ? 'text-slate-800 dark:text-white bg-slate-200/30 dark:bg-white/20 backdrop-blur-sm'
                      : 'text-slate-600 dark:text-white/80 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100/20 dark:hover:bg-white/10 backdrop-blur-sm'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="bg-slate-100/20 dark:bg-slate-700/20 hover:bg-slate-200/30 dark:hover:bg-slate-600/30 backdrop-blur-sm border border-slate-200/30 dark:border-slate-600/30 text-slate-700 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-300 rounded-xl w-10 h-10"
                >
                  <User className="w-5 h-5" />
                </Button>
                
                {/* User Dropdown */}
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/30 dark:border-slate-700/30 rounded-2xl shadow-lg py-2"
                  >
                    <Link
                      href="/organizer/dashboard"
                      className="block px-4 py-3 text-sm text-slate-800 dark:text-white hover:bg-slate-100/20 dark:hover:bg-white/10 transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        signOut()
                        setUserDropdownOpen(false)
                      }}
                      className="block w-full text-left px-4 py-3 text-sm text-slate-800 dark:text-white hover:bg-slate-100/20 dark:hover:bg-white/10 transition-colors"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <>
                <Link href="/organizer/register">
                  <Button 
                    variant="outline"
                    className="bg-slate-100/20 dark:bg-white/10 hover:bg-slate-200/30 dark:hover:bg-white/20 backdrop-blur-sm border border-slate-300/50 dark:border-white/30 text-slate-700 dark:text-white hover:text-slate-800 dark:hover:text-white transition-all duration-300 rounded-xl"
                  >
                    Become Organizer
                  </Button>
                </Link>
                <Link href="/login">
                  <Button 
                    className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-amber-400 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-amber-400/20"
                  >
                    Login
                  </Button>
                </Link>
              </>
            )}
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="bg-slate-100/20 dark:bg-slate-700/20 hover:bg-slate-200/30 dark:hover:bg-slate-600/30 backdrop-blur-sm border border-slate-200/30 dark:border-slate-600/30 text-slate-700 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-300 rounded-xl"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden absolute top-full left-0 right-0 mt-2 border border-slate-200/20 dark:border-slate-700/20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-lg"
        >
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${
                  pathname === item.href
                    ? 'text-slate-800 dark:text-slate-200 bg-slate-200/30 dark:bg-slate-700/30 backdrop-blur-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/20 dark:hover:bg-slate-700/20 backdrop-blur-sm'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  )
}
