"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { AnimalIllustration } from '@/components/illustrations/animals'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      const { error } = await signIn(formData.email, formData.password)

      if (error) {
        throw new Error(error.message)
      }

      toast.success('Login successful!')
      router.push('/organizer/dashboard')
      
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-screen">
          {/* Left side - Illustration */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:flex justify-center items-center"
          >
            <div className="w-full max-w-md">
              <AnimalIllustration className="w-full h-96" />
            </div>
          </motion.div>

          {/* Right side - Login Form */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <Card className="w-full max-w-md bg-white/10 dark:bg-slate-900/10 backdrop-blur-xl border border-slate-200/20 dark:border-slate-700/20 shadow-xl">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-slate-700 to-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-amber-400" />
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Sign in to your organizer account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email Address
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      disabled={loading}
                      className="bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-600/50 focus:border-amber-400 dark:focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                        disabled={loading}
                        className="bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-600/50 focus:border-amber-400 dark:focus:border-amber-400"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-500 dark:text-slate-400"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-amber-400 shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" />
                        <span className="ml-2">Signing In...</span>
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                <div className="mt-6 space-y-4 text-center">
                  <div>
                    <Link href="/forgot-password" className="text-sm text-amber-600 dark:text-amber-400 hover:underline">
                      Forgot your password?
                    </Link>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Don't have an account?{' '}
                      <Link href="/organizer/register" className="text-amber-600 dark:text-amber-400 hover:underline">
                        Sign up here
                      </Link>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
