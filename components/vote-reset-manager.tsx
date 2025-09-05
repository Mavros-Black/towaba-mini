'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  RotateCcw, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Users, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Settings,
  History
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'

interface VoteResetManagerProps {
  campaignId: string
  campaignTitle: string
}

interface PeriodData {
  campaign: {
    id: string
    title: string
    voting_period_type: string
    reset_frequency: string
    auto_reset_enabled: boolean
    current_period_start: string
    current_period_end: string
    next_auto_reset: string | null
    custom_reset_days: number | null
  }
  current_period: {
    id: string
    period_number: number
    start_date: string
    end_date: string
    total_votes: number
    total_revenue: number
    total_voters: number
    status: string
  } | null
  historical_periods: Array<{
    id: string
    period_number: number
    start_date: string
    end_date: string
    total_votes: number
    total_revenue: number
    total_voters: number
    status: string
  }>
  can_reset: boolean
}

export default function VoteResetManager({ campaignId, campaignTitle }: VoteResetManagerProps) {
  const { session } = useAuth()
  const [periodData, setPeriodData] = useState<PeriodData | null>(null)
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [resetType, setResetType] = useState('manual')
  const [customDays, setCustomDays] = useState(7)
  const [resetNotes, setResetNotes] = useState('')

  useEffect(() => {
    if (session?.access_token) {
      fetchPeriodData()
    }
  }, [campaignId, session?.access_token])

  const fetchPeriodData = async () => {
    try {
      if (!session?.access_token) {
        setLoading(false)
        return
      }

      const response = await fetch(`/api/organizer/campaigns/${campaignId}/reset-votes`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch period data')
      
      const data = await response.json()
      
      // If campaign is in continuous mode and no current period exists, create a default one
      if (data.campaign.voting_period_type === 'continuous' && !data.current_period) {
        // Fetch overall campaign statistics for continuous voting
        const statsResponse = await fetch(`/api/organizer/campaigns/${campaignId}/votes/count`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          
          // Create a mock current period with overall campaign stats
          data.current_period = {
            id: 'continuous',
            period_number: 1,
            start_date: data.campaign.created_at || new Date().toISOString(),
            end_date: null,
            total_votes: statsData.totalVotes || 0,
            total_revenue: 0, // We'll need to fetch this separately
            total_voters: statsData.totalVotes || 0,
            status: 'active'
          }
        }
      }
      
      setPeriodData(data)
    } catch (error) {
      console.error('Error fetching period data:', error)
      toast.error('Failed to load period data')
    } finally {
      setLoading(false)
    }
  }

  const handleResetVotes = async () => {
    if (!periodData || !session?.access_token) return

    setResetting(true)
    try {
      const response = await fetch(`/api/organizer/campaigns/${campaignId}/reset-votes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          resetType,
          customDays: resetType === 'custom' ? customDays : undefined,
          notes: resetNotes
        })
      })

      if (!response.ok) throw new Error('Failed to reset votes')

      const result = await response.json()
      toast.success(result.message)
      
      // Refresh data
      await fetchPeriodData()
      setResetDialogOpen(false)
      setResetNotes('')
    } catch (error) {
      console.error('Error resetting votes:', error)
      toast.error('Failed to reset votes')
    } finally {
      setResetting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getResetTypeLabel = (type: string) => {
    switch (type) {
      case 'manual': return 'Manual Reset'
      case 'weekly': return 'Weekly Auto-Reset'
      case 'monthly': return 'Monthly Auto-Reset'
      case 'custom': return 'Custom Auto-Reset'
      default: return 'Continuous Voting'
    }
  }

  const getResetTypeIcon = (type: string) => {
    switch (type) {
      case 'manual': return <RotateCcw className="w-4 h-4" />
      case 'weekly': return <Calendar className="w-4 h-4" />
      case 'monthly': return <Calendar className="w-4 h-4" />
      case 'custom': return <Settings className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!session?.access_token) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please log in to access vote reset functionality.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!periodData) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load voting period data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    )
  }

  const { campaign, current_period, historical_periods } = periodData

  return (
    <div className="space-y-6">
      {/* Current Period Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getResetTypeIcon(campaign.reset_frequency)}
                {campaign.voting_period_type === 'continuous' ? 'Continuous Voting' : 'Current Voting Period'}
              </CardTitle>
              <CardDescription>
                {getResetTypeLabel(campaign.reset_frequency)} • {campaignTitle}
              </CardDescription>
            </div>
            <Badge variant={current_period?.status === 'active' ? 'default' : 'secondary'}>
              {current_period?.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {current_period ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Total Votes</p>
                  <p className="text-2xl font-bold">{current_period.total_votes}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(current_period.total_revenue)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Voters</p>
                  <p className="text-2xl font-bold">{current_period.total_voters}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {campaign.voting_period_type === 'continuous' ? 'Overall Stats' : `Period #${current_period.period_number}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {campaign.voting_period_type === 'continuous' ? 'Since campaign start' : formatDate(current_period.start_date)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No active voting period found. This campaign may be in continuous voting mode.
              </AlertDescription>
            </Alert>
          )}

          {/* Auto-reset info */}
          {campaign.auto_reset_enabled && campaign.next_auto_reset && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Next auto-reset: {formatDate(campaign.next_auto_reset)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reset Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Vote Reset Management</CardTitle>
          <CardDescription>
            Reset votes to start a new voting period. All historical data will be preserved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  {campaign.voting_period_type === 'continuous' ? 'Start Periodic Voting' : 'Reset Votes for New Period'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Reset Votes</DialogTitle>
                  <DialogDescription>
                    Choose how you want to reset votes. This will start a new voting period.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="resetType">Reset Type</Label>
                    <Select value={resetType} onValueChange={setResetType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual Reset (One-time)</SelectItem>
                        <SelectItem value="weekly">Weekly Auto-Reset</SelectItem>
                        <SelectItem value="monthly">Monthly Auto-Reset</SelectItem>
                        <SelectItem value="custom">Custom Auto-Reset</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {resetType === 'custom' && (
                    <div>
                      <Label htmlFor="customDays">Reset Every (Days)</Label>
                      <Input
                        id="customDays"
                        type="number"
                        min="1"
                        max="365"
                        value={customDays}
                        onChange={(e) => setCustomDays(parseInt(e.target.value) || 7)}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any notes about this reset..."
                      value={resetNotes}
                      onChange={(e) => setResetNotes(e.target.value)}
                    />
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This action will archive current votes and start a new period. 
                      All historical data will be preserved for analytics.
                    </AlertDescription>
                  </Alert>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleResetVotes} 
                    disabled={resetting}
                    className="flex items-center gap-2"
                  >
                    {resetting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Resetting...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        Reset Votes
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={fetchPeriodData}>
              <History className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historical Periods */}
      {historical_periods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historical Periods</CardTitle>
            <CardDescription>
              Previous voting periods and their results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {historical_periods.map((period) => (
                <div key={period.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">Period #{period.period_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(period.start_date)} - {formatDate(period.end_date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{period.total_votes} votes</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(period.total_revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
