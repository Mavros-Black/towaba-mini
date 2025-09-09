'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Eye,
  Send,
  Building,
  Calendar,
  CreditCard,
  Smartphone
} from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '@/components/admin-layout'
import AdminProtectedRoute from '@/components/admin-protected-route'

interface CampaignEarnings {
  id: string
  title: string
  organizer_id: string
  users: {
    id: string
    name: string
    email: string
  }
  totalRevenue: number
  totalRevenueGHS: string
  paymentCount: number
  lastPaymentDate: string | null
  organizerEarnings: number
  organizerEarningsGHS: string
  platformFee: number
  platformFeeGHS: string
  pendingPayout: number
  pendingPayoutGHS: string
}

export default function PayoutsPage() {
  const [campaigns, setCampaigns] = useState<CampaignEarnings[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false)
  const [payoutMethod, setPayoutMethod] = useState('')
  const [payoutNotes, setPayoutNotes] = useState('')
  const [processingPayout, setProcessingPayout] = useState(false)
  
  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const limit = 10

  const fetchCampaigns = async () => {
    try {
      setRefreshing(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token found')
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/admin/payouts?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch campaigns')
      }

      const data = await response.json()
      setCampaigns(data.campaigns)
      setTotalPages(data.pagination.pages)
      setTotalCount(data.pagination.total)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      toast.error('Failed to fetch campaigns')
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchCampaigns()
      setLoading(false)
    }
    loadData()
  }, [currentPage, search, statusFilter])

  const handleRefresh = () => {
    fetchCampaigns()
  }

  const handleSelectCampaign = (campaignId: string, checked: boolean) => {
    if (checked) {
      setSelectedCampaigns(prev => [...prev, campaignId])
    } else {
      setSelectedCampaigns(prev => prev.filter(id => id !== campaignId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCampaigns(campaigns.map(c => c.id))
    } else {
      setSelectedCampaigns([])
    }
  }

  const handleProcessPayout = async () => {
    if (selectedCampaigns.length === 0) {
      toast.error('Please select at least one campaign')
      return
    }

    if (!payoutMethod) {
      toast.error('Please select a payout method')
      return
    }

    try {
      setProcessingPayout(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/admin/payouts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          campaignIds: selectedCampaigns,
          payoutMethod,
          notes: payoutNotes
        })
      })

      if (!response.ok) {
        throw new Error('Failed to process payouts')
      }

      const data = await response.json()
      
      // Show results
      const successful = data.results.filter((r: any) => r.success).length
      const failed = data.results.filter((r: any) => !r.success).length
      
      toast.success(`Payout processing completed: ${successful} successful, ${failed} failed`)
      
      // Reset form and refresh data
      setSelectedCampaigns([])
      setPayoutMethod('')
      setPayoutNotes('')
      setIsPayoutModalOpen(false)
      await fetchCampaigns()
      
    } catch (error) {
      console.error('Error processing payouts:', error)
      toast.error('Failed to process payouts')
    } finally {
      setProcessingPayout(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPayoutMethodIcon = (method: string) => {
    switch (method) {
      case 'BANK_TRANSFER':
        return <Building className="w-4 h-4" />
      case 'MOBILE_MONEY':
        return <Smartphone className="w-4 h-4" />
      case 'PAYSTACK':
        return <CreditCard className="w-4 h-4" />
      default:
        return <DollarSign className="w-4 h-4" />
    }
  }

  // Calculate totals
  const totalPendingPayout = campaigns.reduce((sum, c) => sum + c.pendingPayout, 0)
  const totalPlatformFee = campaigns.reduce((sum, c) => sum + c.platformFee, 0)
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.totalRevenue, 0)

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        {loading ? (
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
          </div>
        ) : (
        <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payout Management</h1>
          <p className="text-muted-foreground">Process organizer payouts and manage earnings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{(totalRevenue / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Across all campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{(totalPendingPayout / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {campaigns.filter(c => c.pendingPayout > 0).length} campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{(totalPlatformFee / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              10% commission
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              With earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Campaign, organizer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending Payout</SelectItem>
                  <SelectItem value="paid">Paid Out</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              {selectedCampaigns.length > 0 && (
                <Dialog open={isPayoutModalOpen} onOpenChange={setIsPayoutModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Process Payout ({selectedCampaigns.length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Process Payout</DialogTitle>
                      <DialogDescription>
                        Process payout for {selectedCampaigns.length} selected campaign(s)
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="payoutMethod">Payout Method</Label>
                        <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payout method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                            <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                            <SelectItem value="PAYSTACK">Paystack</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Add any notes about this payout..."
                          value={payoutNotes}
                          onChange={(e) => setPayoutNotes(e.target.value)}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsPayoutModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleProcessPayout} disabled={processingPayout}>
                          {processingPayout ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Process Payout
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Earnings</CardTitle>
          <CardDescription>
            Showing {campaigns.length} of {totalCount} campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">
                    <Checkbox
                      checked={selectedCampaigns.length === campaigns.length && campaigns.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left p-2">Campaign</th>
                  <th className="text-left p-2">Organizer</th>
                  <th className="text-left p-2">Total Revenue</th>
                  <th className="text-left p-2">Platform Fee</th>
                  <th className="text-left p-2">Organizer Earnings</th>
                  <th className="text-left p-2">Payments</th>
                  <th className="text-left p-2">Last Payment</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <Checkbox
                        checked={selectedCampaigns.includes(campaign.id)}
                        onCheckedChange={(checked) => handleSelectCampaign(campaign.id, checked as boolean)}
                      />
                    </td>
                    <td className="p-2">
                      <div className="font-medium">{campaign.title}</div>
                    </td>
                    <td className="p-2">
                      <div className="text-sm">
                        <div className="font-medium">{campaign.users.name}</div>
                        <div className="text-muted-foreground">{campaign.users.email}</div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="font-semibold">₵{campaign.totalRevenueGHS}</div>
                    </td>
                    <td className="p-2">
                      <div className="text-sm text-muted-foreground">₵{campaign.platformFeeGHS}</div>
                    </td>
                    <td className="p-2">
                      <div className="font-semibold text-green-600">₵{campaign.organizerEarningsGHS}</div>
                    </td>
                    <td className="p-2">
                      <div className="text-sm">{campaign.paymentCount}</div>
                    </td>
                    <td className="p-2">
                      <div className="text-sm">{formatDate(campaign.lastPaymentDate)}</div>
                    </td>
                    <td className="p-2">
                      {campaign.pendingPayout > 0 ? (
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Paid
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
        </div>
        )}
      </AdminLayout>
    </AdminProtectedRoute>
  )
}
