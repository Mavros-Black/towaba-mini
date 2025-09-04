"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EnvCheck } from '@/components/env-check'
import { EnvDebug } from '@/components/env-debug'

export default function TestSupabasePage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-supabase')
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to test connection',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <EnvCheck />
        <EnvDebug />
        <Card>
          <CardHeader>
            <CardTitle>Quick Setup Guide</CardTitle>
            <CardDescription>
              Follow these steps to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="font-medium">Create .env.local file</p>
                <p className="text-sm text-muted-foreground">Add your Supabase credentials</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="font-medium">Restart dev server</p>
                <p className="text-sm text-muted-foreground">Stop and restart npm run dev</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="font-medium">Test connection</p>
                <p className="text-sm text-muted-foreground">Click the button below</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
          <CardDescription>
            Test the connection to your Supabase project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testConnection} 
            disabled={loading}
            className="mb-4"
          >
            {loading ? 'Testing...' : 'Test Connection'}
          </Button>

          {testResult && (
            <div className={`p-4 rounded-lg ${
              testResult.success 
                ? 'bg-green-100 border border-green-300 text-green-800' 
                : 'bg-red-100 border border-red-300 text-red-800'
            }`}>
              <h3 className="font-semibold mb-2">
                {testResult.success ? '✅ Success' : '❌ Failed'}
              </h3>
              <p className="mb-2">{testResult.message}</p>
              {testResult.error && (
                <p className="text-sm opacity-80">Error: {testResult.error}</p>
              )}
              {testResult.code && (
                <p className="text-sm opacity-80">Code: {testResult.code}</p>
              )}
              {testResult.connection && (
                <p className="text-sm opacity-80">Status: {testResult.connection}</p>
              )}
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            <p>This test will:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Try to connect to your Supabase project</li>
              <li>Attempt to query a non-existent table (expected to fail)</li>
              <li>Verify the connection is working properly</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
