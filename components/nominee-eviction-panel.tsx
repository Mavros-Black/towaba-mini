"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  UserX, 
  UserCheck, 
  AlertTriangle, 
  Users, 
  Eye, 
  EyeOff,
  Clock,
  User
} from 'lucide-react'
import { toast } from 'sonner'

interface Nominee {
  id: string
  name: string
  bio: string
  image: string | null
  votes_count: number
  category_name?: string
  is_evicted?: boolean
  evicted_at?: string
  eviction_reason?: string
  evicted_by_email?: string
}

interface NomineeEvictionPanelProps {
  campaignId: string
  campaignTitle: string
  nominees: Nominee[]
  onNomineeUpdate?: () => void
}

export function NomineeEvictionPanel({
  campaignId,
  campaignTitle,
  nominees,
  onNomineeUpdate
}: NomineeEvictionPanelProps) {
  const [activeTab, setActiveTab] = useState('active')
  const [action, setAction] = useState<'evict' | 'reinstate' | null>(null)
  const [selectedNominee, setSelectedNominee] = useState<string>('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [evictedNominees, setEvictedNominees] = useState<Nominee[]>([])

  const activeNominees = nominees.filter(n => !n.is_evicted)
  const nomineesWithVotes = activeNominees.filter(n => n.votes_count > 0)

  useEffect(() => {
    fetchEvictedNominees()
  }, [campaignId])

  const fetchEvictedNominees = async () => {
    try {
      const response = await fetch(`/api/organizer/campaigns/${campaignId}/nominees/evicted`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setEvictedNominees(data.evictedNominees || [])
      }
    } catch (error) {
      console.error('Error fetching evicted nominees:', error)
    }
  }

  const handleEvictNominee = async () => {
    if (!selectedNominee || !reason.trim() || reason.trim().length < 10) {
      toast.error('Please select a nominee and provide a detailed reason')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/organizer/campaigns/${campaignId}/nominees/${selectedNominee}/evict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ reason: reason.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to evict nominee')
      }

      toast.success('Nominee evicted successfully - votes preserved')
      setAction(null)
      setSelectedNominee('')
      setReason('')
      fetchEvictedNominees()
      onNomineeUpdate?.()
    } catch (error) {
      console.error('Evict nominee error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to evict nominee')
    } finally {
      setLoading(false)
    }
  }

  const handleReinstateNominee = async () => {
    if (!selectedNominee || !reason.trim() || reason.trim().length < 10) {
      toast.error('Please select a nominee and provide a detailed reason')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/organizer/campaigns/${campaignId}/nominees/${selectedNominee}/reinstate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ reason: reason.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reinstate nominee')
      }

      toast.success('Nominee reinstated successfully')
      setAction(null)
      setSelectedNominee('')
      setReason('')
      fetchEvictedNominees()
      onNomineeUpdate?.()
    } catch (error) {
      console.error('Reinstate nominee error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to reinstate nominee')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-orange-700">
          <Users className="w-5 h-5" />
          <span>Nominee Management</span>
        </CardTitle>
        <CardDescription className="text-orange-600">
          Evict nominees to hide them from public view while preserving votes, or reinstate evicted nominees.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active" className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Active ({activeNominees.length})</span>
            </TabsTrigger>
            <TabsTrigger value="evicted" className="flex items-center space-x-2">
              <EyeOff className="w-4 h-4" />
              <span>Evicted ({evictedNominees.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Active Nominees</h4>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setAction('evict')}
                className="flex items-center space-x-2"
                disabled={nomineesWithVotes.length === 0}
              >
                <UserX className="w-4 h-4" />
                <span>Evict Nominee</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeNominees.map(nominee => (
                <Card key={nominee.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{nominee.name}</h5>
                      <Badge variant="secondary">
                        {nominee.votes_count} votes
                      </Badge>
                    </div>
                    {nominee.category_name && (
                      <p className="text-sm text-gray-600 mb-2">{nominee.category_name}</p>
                    )}
                    {nominee.bio && (
                      <p className="text-sm text-gray-500 line-clamp-2">{nominee.bio}</p>
                    )}
                    {nominee.votes_count > 0 && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                        <strong>Protected:</strong> Has {nominee.votes_count} votes - cannot be deleted
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {nomineesWithVotes.length === 0 && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  No nominees have votes yet. Once voting begins, nominees with votes can only be evicted (hidden) to preserve voting data.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="evicted" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Evicted Nominees</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAction('reinstate')}
                className="flex items-center space-x-2"
                disabled={evictedNominees.length === 0}
              >
                <UserCheck className="w-4 h-4" />
                <span>Reinstate Nominee</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evictedNominees.map(nominee => (
                <Card key={nominee.id} className="relative border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-red-800">{nominee.name}</h5>
                      <Badge variant="destructive">
                        {nominee.votes_count} votes
                      </Badge>
                    </div>
                    {nominee.category_name && (
                      <p className="text-sm text-red-600 mb-2">{nominee.category_name}</p>
                    )}
                    {nominee.eviction_reason && (
                      <p className="text-sm text-red-500 mb-2">
                        <strong>Reason:</strong> {nominee.eviction_reason}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 text-xs text-red-600">
                      <Clock className="w-3 h-3" />
                      <span>Evicted {new Date(nominee.evicted_at || '').toLocaleDateString()}</span>
                    </div>
                    {nominee.evicted_by_email && (
                      <p className="text-xs text-red-500 mt-1">
                        By: {nominee.evicted_by_email}
                      </p>
                    )}
                    <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-800">
                      <strong>Hidden:</strong> Votes preserved but not visible to public
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {evictedNominees.length === 0 && (
              <Alert className="border-gray-200 bg-gray-50">
                <User className="h-4 w-4 text-gray-600" />
                <AlertDescription className="text-gray-800">
                  No nominees have been evicted from this campaign.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>

        {action === 'evict' && (
          <div className="mt-6 p-4 border border-red-200 rounded-lg bg-white">
            <h4 className="font-semibold text-red-700 mb-4">Evict Nominee</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Nominee to Evict:</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedNominee}
                  onChange={(e) => setSelectedNominee(e.target.value)}
                >
                  <option value="">Choose a nominee...</option>
                  {nomineesWithVotes.map(nominee => (
                    <option key={nominee.id} value={nominee.id}>
                      {nominee.name} ({nominee.votes_count} votes)
                      {nominee.category_name && ` - ${nominee.category_name}`}
                    </option>
                  ))}
                </select>
              </div>
              <Textarea
                placeholder="Provide a detailed reason for evicting this nominee (minimum 10 characters)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Note:</strong> Evicting a nominee will hide them from public view but preserve all their votes. 
                  They can be reinstated later if needed.
                </AlertDescription>
              </Alert>
              <div className="flex space-x-2">
                <Button
                  variant="destructive"
                  onClick={handleEvictNominee}
                  disabled={loading || !selectedNominee || reason.trim().length < 10}
                >
                  {loading ? 'Evicting...' : 'Confirm Evict Nominee'}
                </Button>
                <Button variant="outline" onClick={() => setAction(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {action === 'reinstate' && (
          <div className="mt-6 p-4 border border-green-200 rounded-lg bg-white">
            <h4 className="font-semibold text-green-700 mb-4">Reinstate Nominee</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Nominee to Reinstate:</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedNominee}
                  onChange={(e) => setSelectedNominee(e.target.value)}
                >
                  <option value="">Choose a nominee...</option>
                  {evictedNominees.map(nominee => (
                    <option key={nominee.id} value={nominee.id}>
                      {nominee.name} ({nominee.votes_count} votes)
                      {nominee.category_name && ` - ${nominee.category_name}`}
                    </option>
                  ))}
                </select>
              </div>
              <Textarea
                placeholder="Provide a detailed reason for reinstating this nominee (minimum 10 characters)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
              <Alert className="border-green-200 bg-green-50">
                <UserCheck className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Note:</strong> Reinstating a nominee will make them visible to the public again with all their votes intact.
                </AlertDescription>
              </Alert>
              <div className="flex space-x-2">
                <Button
                  onClick={handleReinstateNominee}
                  disabled={loading || !selectedNominee || reason.trim().length < 10}
                >
                  {loading ? 'Reinstating...' : 'Confirm Reinstate Nominee'}
                </Button>
                <Button variant="outline" onClick={() => setAction(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
