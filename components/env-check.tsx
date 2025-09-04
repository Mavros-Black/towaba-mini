"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export function EnvCheck() {
  const [envStatus, setEnvStatus] = useState<{
    supabaseUrl: boolean
    supabaseAnonKey: boolean
    serviceRoleKey: boolean
  }>({
    supabaseUrl: false,
    supabaseAnonKey: false,
    serviceRoleKey: false
  })

  useEffect(() => {
    // Check environment variables (only in browser)
    if (typeof window !== 'undefined') {
      setEnvStatus({
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      })
    }
  }, [])

  const allGood = envStatus.supabaseUrl && envStatus.supabaseAnonKey

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Environment Check</span>
          {allGood ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          )}
        </CardTitle>
        <CardDescription>
          Supabase environment variables status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">SUPABASE_URL</span>
          <Badge variant={envStatus.supabaseUrl ? "default" : "destructive"}>
            {envStatus.supabaseUrl ? "✅ Set" : "❌ Missing"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">SUPABASE_ANON_KEY</span>
          <Badge variant={envStatus.supabaseAnonKey ? "default" : "destructive"}>
            {envStatus.supabaseAnonKey ? "✅ Set" : "❌ Missing"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">SERVICE_ROLE_KEY</span>
          <Badge variant={envStatus.serviceRoleKey ? "default" : "outline"}>
            {envStatus.serviceRoleKey ? "✅ Set" : "⚠️ Optional"}
          </Badge>
        </div>

        {!allGood && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Missing environment variables!</strong> Check the SUPABASE_SETUP.md file for setup instructions.
            </p>
          </div>
        )}

        {allGood && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-md">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>All required variables are set!</strong> You're ready to use Supabase.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
