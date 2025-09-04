"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Eye, EyeOff } from 'lucide-react'

export function EnvDebug() {
  const [envValues, setEnvValues] = useState<{
    supabaseUrl: string | undefined
    supabaseAnonKey: string | undefined
    serviceRoleKey: string | undefined
  }>({
    supabaseUrl: undefined,
    supabaseAnonKey: undefined,
    serviceRoleKey: undefined
  })
  const [showValues, setShowValues] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkEnvVars = () => {
    const values = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    }
    setEnvValues(values)
    setLastCheck(new Date())
  }

  useEffect(() => {
    checkEnvVars()
  }, [])

  const formatKey = (key: string | undefined) => {
    if (!key) return 'Not set'
    if (showValues) {
      return key.length > 50 ? `${key.substring(0, 50)}...` : key
    }
    return key ? `${key.substring(0, 8)}...` : 'Not set'
  }

  const getKeyStatus = (key: string | undefined) => {
    if (!key) return 'destructive'
    if (key.startsWith('eyJ')) return 'default'
    if (key.includes('placeholder')) return 'secondary'
    return 'outline'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Environment Debug</CardTitle>
            <CardDescription>
              Raw environment variable values
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowValues(!showValues)}
            >
              {showValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showValues ? 'Hide' : 'Show'} Values
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={checkEnvVars}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">NEXT_PUBLIC_SUPABASE_URL</span>
          <Badge variant={getKeyStatus(envValues.supabaseUrl)}>
            {formatKey(envValues.supabaseUrl)}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
          <Badge variant={getKeyStatus(envValues.supabaseAnonKey)}>
            {formatKey(envValues.supabaseAnonKey)}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">SUPABASE_SERVICE_ROLE_KEY</span>
          <Badge variant={getKeyStatus(envValues.serviceRoleKey)}>
            {formatKey(envValues.serviceRoleKey)}
          </Badge>
        </div>

        {lastCheck && (
          <div className="text-xs text-muted-foreground mt-2">
            Last checked: {lastCheck.toLocaleTimeString()}
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Debug Info:</strong> This shows the actual environment variable values. 
            If they show as "Not set", there's an issue with your .env.local file.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
