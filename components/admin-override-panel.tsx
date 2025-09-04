"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Trash2, Users, AlertTriangle, History, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface AdminOverridePanelProps {
  campaignId: string
  campaignTitle: string
  voteCount: number
  nominees: Array<{
    id: string
    name: string
    votes_count: number
    category_name?: string
  }>
  onActionComplete?: () => void
}

export function AdminOverridePanel({
  campaignId,
  campaignTitle,
  voteCount,
  nominees,
  onActionComplete
}: AdminOverridePanelProps) {
  const [action, setAction] = useState<'delete_campaign' | 'delete_nominee' | 'transfer_votes' | null>(null)
  const [selectedNominee, setSelectedNominee] = useState<string>('')
  const [targetNominee, setTargetNominee] = useState<string>('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDeleteCampaign = async () => {
    if (!reason.trim() || reason.trim().length < 10) {
      toast.error('Please provide a detailed reason (at least 10 characters)')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ reason: reason.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete campaign')
      }

      toast.success('Campaign deleted successfully')
      setAction(null)
      setReason('')
      onActionComplete?.()
    } catch (error) {
      console.error('Delete campaign error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNominee = async () => {
    if (!selectedNominee || !reason.trim() || reason.trim().length < 10) {
      toast.error('Please select a nominee and provide a detailed reason')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/nominees/${selectedNominee}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ reason: reason.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete nominee')
      }

      toast.success('Nominee deleted successfully')
      setAction(null)
      setSelectedNominee('')
      setReason('')
      onActionComplete?.()
    } catch (error) {
      console.error('Delete nominee error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete nominee')
    } finally {
      setLoading(false)
    }
  }

  const handleTransferVotes = async () => {
    if (!selectedNominee || !targetNominee || !reason.trim() || reason.trim().length < 10) {
      toast.error('Please select nominees and provide a detailed reason')
      return
    }

    if (selectedNominee === targetNominee) {
      toast.error('Cannot transfer votes to the same nominee')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/votes/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          fromNomineeId: selectedNominee,
          toNomineeId: targetNominee,
          reason: reason.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to transfer votes')
      }

      toast.success('Votes transferred successfully')
      setAction(null)
      setSelectedNominee('')
      setTargetNominee('')
      setReason('')
      onActionComplete?.()
    } catch (error) {
      console.error('Transfer votes error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to transfer votes')
    } finally {
      setLoading(false)
    }
  }

  const nomineesWithVotes = nominees.filter(n => n.votes_count > 0)

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-red-700">
          <Shield className="w-5 h-5" />
          <span>Admin Override Panel</span>
        </CardTitle>
        <CardDescription className="text-red-600">
          Emergency actions for campaigns with votes. All actions are logged and audited.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Warning:</strong> This campaign has {voteCount} votes. 
            These actions will permanently affect voting data and cannot be undone.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="destructive"
            onClick={() => setAction('delete_campaign')}
            className="flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Campaign</span>
          </Button>

          <Button
            variant="destructive"
            onClick={() => setAction('delete_nominee')}
            className="flex items-center space-x-2"
            disabled={nomineesWithVotes.length === 0}
          >
            <Users className="w-4 h-4" />
            <span>Delete Nominee</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setAction('transfer_votes')}
            className="flex items-center space-x-2"
            disabled={nomineesWithVotes.length < 2}
          >
            <History className="w-4 h-4" />
            <span>Transfer Votes</span>
          </Button>
        </div>

        {action === 'delete_campaign' && (
          <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-white">
            <h4 className="font-semibold text-red-700">Delete Campaign: {campaignTitle}</h4>
            <p className="text-sm text-red-600">
              This will permanently delete the campaign and all {voteCount} votes. This action cannot be undone.
            </p>
            <Textarea
              placeholder="Provide a detailed reason for deleting this campaign (minimum 10 characters)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <div className="flex space-x-2">
              <Button
                variant="destructive"
                onClick={handleDeleteCampaign}
                disabled={loading || reason.trim().length < 10}
              >
                {loading ? 'Deleting...' : 'Confirm Delete Campaign'}
              </Button>
              <Button variant="outline" onClick={() => setAction(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {action === 'delete_nominee' && (
          <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-white">
            <h4 className="font-semibold text-red-700">Delete Nominee</h4>
            <div>
              <label className="block text-sm font-medium mb-2">Select Nominee to Delete:</label>
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
              placeholder="Provide a detailed reason for deleting this nominee (minimum 10 characters)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <div className="flex space-x-2">
              <Button
                variant="destructive"
                onClick={handleDeleteNominee}
                disabled={loading || !selectedNominee || reason.trim().length < 10}
              >
                {loading ? 'Deleting...' : 'Confirm Delete Nominee'}
              </Button>
              <Button variant="outline" onClick={() => setAction(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {action === 'transfer_votes' && (
          <div className="space-y-4 p-4 border border-blue-200 rounded-lg bg-white">
            <h4 className="font-semibold text-blue-700">Transfer Votes Between Nominees</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">From Nominee:</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedNominee}
                  onChange={(e) => setSelectedNominee(e.target.value)}
                >
                  <option value="">Choose source nominee...</option>
                  {nomineesWithVotes.map(nominee => (
                    <option key={nominee.id} value={nominee.id}>
                      {nominee.name} ({nominee.votes_count} votes)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">To Nominee:</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={targetNominee}
                  onChange={(e) => setTargetNominee(e.target.value)}
                >
                  <option value="">Choose target nominee...</option>
                  {nominees.filter(n => n.id !== selectedNominee).map(nominee => (
                    <option key={nominee.id} value={nominee.id}>
                      {nominee.name} ({nominee.votes_count} votes)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Textarea
              placeholder="Provide a detailed reason for transferring votes (minimum 10 characters)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <div className="flex space-x-2">
              <Button
                onClick={handleTransferVotes}
                disabled={loading || !selectedNominee || !targetNominee || reason.trim().length < 10}
              >
                {loading ? 'Transferring...' : 'Confirm Transfer Votes'}
              </Button>
              <Button variant="outline" onClick={() => setAction(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 pt-2 border-t">
          <p><strong>Note:</strong> All admin actions are logged with timestamps, IP addresses, and detailed reasons for audit purposes.</p>
        </div>
      </CardContent>
    </Card>
  )
}
