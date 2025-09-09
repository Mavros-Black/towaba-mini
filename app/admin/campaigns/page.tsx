'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Megaphone, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Shield,
  User,
  Mail,
  Clock,
  BarChart3,
  Settings,
  Edit,
  Copy,
  Archive,
  Ban
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase-auth'
import AdminLayout from '@/components/admin-layout'
import AdminProtectedRoute from '@/components/admin-protected-route'

interface Campaign {
  id: string
  title: string
  description: string
  status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'REJECTED' | 'SUSPENDED'
  organizer_name: string
  organizer_email: string
  created_at: string
  updated_at: string
  start_date: string
  end_date: string
  total_votes: number
  total_revenue: number
  nominee_count: number
  category_count: number
  is_featured: boolean
  vote_count: number
  revenue: number
}

interface CampaignFilters {
  status: string
  search: string
  dateRange: string
  sortBy: string
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filters, setFilters] = useState<CampaignFilters>({
    status: 'all',
    search: '',
    dateRange: 'all',
    sortBy: 'created_at'
  })
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: '',
    start_date: '',
    end_date: ''
  })

  const fetchCampaigns = async () => {
    try {
      setRefreshing(true)
      
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/admin/campaigns', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch campaigns')
      }

      const data = await response.json()
      if (data.success) {
        setCampaigns(data.campaigns || [])
      } else {
        throw new Error(data.error || 'Failed to fetch campaigns')
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      toast.error('Failed to fetch campaigns')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const handleRefresh = () => {
    fetchCampaigns()
    toast.success('Campaigns refreshed')
  }

  const handleViewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCampaign(null)
  }

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setEditForm({
      title: campaign.title,
      description: campaign.description,
      status: campaign.status,
      start_date: campaign.start_date ? new Date(campaign.start_date).toISOString().split('T')[0] : '',
      end_date: campaign.end_date ? new Date(campaign.end_date).toISOString().split('T')[0] : ''
    })
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingCampaign(null)
    setEditForm({
      title: '',
      description: '',
      status: '',
      start_date: '',
      end_date: ''
    })
  }

  const handleSaveCampaign = async () => {
    if (!editingCampaign) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`/api/admin/campaigns/${editingCampaign.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          status: editForm.status,
          start_date: editForm.start_date,
          end_date: editForm.end_date
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update campaign')
      }

      toast.success(`Campaign "${editForm.title}" updated successfully`)
      handleCloseEditModal()
      fetchCampaigns() // Refresh the list
    } catch (error) {
      console.error('Error updating campaign:', error)
      toast.error('Failed to update campaign')
    }
  }

  const handleApproveCampaign = async (campaign: Campaign) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`/api/admin/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ status: 'ACTIVE' })
      })

      if (!response.ok) {
        throw new Error('Failed to approve campaign')
      }

      toast.success(`Campaign "${campaign.title}" approved successfully`)
      fetchCampaigns() // Refresh the list
    } catch (error) {
      console.error('Error approving campaign:', error)
      toast.error('Failed to approve campaign')
    }
  }

  const handleRejectCampaign = async (campaign: Campaign) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`/api/admin/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ status: 'REJECTED' })
      })

      if (!response.ok) {
        throw new Error('Failed to reject campaign')
      }

      toast.success(`Campaign "${campaign.title}" rejected`)
      fetchCampaigns() // Refresh the list
    } catch (error) {
      console.error('Error rejecting campaign:', error)
      toast.error('Failed to reject campaign')
    }
  }

  const handleSuspendCampaign = async (campaign: Campaign) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`/api/admin/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ status: 'SUSPENDED' })
      })

      if (!response.ok) {
        throw new Error('Failed to suspend campaign')
      }

      toast.success(`Campaign "${campaign.title}" suspended`)
      fetchCampaigns() // Refresh the list
    } catch (error) {
      console.error('Error suspending campaign:', error)
      toast.error('Failed to suspend campaign')
    }
  }

  const handleDeleteCampaign = async (campaign: Campaign) => {
    if (!confirm(`Are you sure you want to delete "${campaign.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`/api/admin/campaigns/${campaign.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete campaign')
      }

      toast.success(`Campaign "${campaign.title}" deleted successfully`)
      fetchCampaigns() // Refresh the list
    } catch (error) {
      console.error('Error deleting campaign:', error)
      toast.error('Failed to delete campaign')
    }
  }

  const handleDuplicateCampaign = (campaign: Campaign) => {
    // TODO: Implement duplicate functionality
    toast.info(`Duplicate functionality for "${campaign.title}" will be implemented`)
    console.log('Duplicate campaign:', campaign)
  }

  const setupAdmin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/admin/setup-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to setup admin')
      }

      const data = await response.json()
      console.log('Setup Admin Data:', data)
      toast.success('Admin setup completed')
    } catch (error) {
      console.error('Error setting up admin:', error)
      toast.error('Failed to setup admin')
    }
  }

  const debugAdmin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/admin/debug-admin', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to debug admin')
      }
      
      const data = await response.json()
      console.log('Debug Admin Data:', data)
      toast.success('Check console for debug info')
    } catch (error) {
      console.error('Error debugging admin:', error)
      toast.error('Failed to debug admin status')
    }
  }

  const initAdminSystem = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/admin/init-admin-system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to initialize admin system')
      }

      const data = await response.json()
      console.log('Init Admin System Data:', data)
      toast.success('Admin system initialized')
    } catch (error) {
      console.error('Error initializing admin system:', error)
      toast.error('Failed to initialize admin system')
    }
  }

  // Filter campaigns based on current filters
  const filteredCampaigns = campaigns.filter(campaign => {
    if (filters.status !== 'all' && campaign.status !== filters.status) return false
    if (filters.search && !campaign.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !campaign.organizer_name.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <AdminProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading campaigns...</p>
            </div>
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    )
  }

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Campaign Management</h1>
              <p className="text-muted-foreground">
                Manage and monitor all voting campaigns
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={setupAdmin}
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Shield className="h-4 w-4 mr-2" />
                Setup Admin
              </Button>
              <Button 
                onClick={handleRefresh} 
                disabled={refreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                <Megaphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all organizers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.filter(c => c.status === 'ACTIVE').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently running
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.filter(c => c.status === 'PENDING').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₵{campaigns.reduce((sum, c) => sum + (c.total_revenue || 0), 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  From all campaigns
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search campaigns..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Created Date</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="total_votes">Votes</SelectItem>
                      <SelectItem value="total_revenue">Revenue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaigns Table */}
          <Card>
            <CardHeader>
              <CardTitle>Campaigns ({filteredCampaigns.length})</CardTitle>
              <CardDescription>
                Manage and monitor all voting campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Campaign</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Organizer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Votes</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Revenue</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCampaigns.length > 0 ? (
                      filteredCampaigns.map((campaign) => (
                        <tr key={campaign.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="max-w-[300px]">
                              <div className="font-medium truncate" title={campaign.title}>
                                {campaign.title}
                              </div>
                              <div className="text-sm text-muted-foreground truncate" title={campaign.description}>
                                {campaign.description}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="font-medium">{campaign.organizer_name}</div>
                              <div className="text-sm text-muted-foreground">{campaign.organizer_email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={
                                campaign.status === 'ACTIVE' ? 'default' :
                                campaign.status === 'PENDING' ? 'secondary' :
                                campaign.status === 'REJECTED' ? 'destructive' :
                                'outline'
                              }
                            >
                              {campaign.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{campaign.total_votes}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">₵{campaign.total_revenue?.toLocaleString() || 0}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="text-sm font-medium">
                                {new Date(campaign.created_at).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(campaign.created_at).toLocaleTimeString()}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewCampaign(campaign)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuLabel>Campaign Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleEditCampaign(campaign)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Campaign
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDuplicateCampaign(campaign)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {campaign.status === 'PENDING' && (
                                    <DropdownMenuItem onClick={() => handleApproveCampaign(campaign)}>
                                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                      Approve
                                    </DropdownMenuItem>
                                  )}
                                  {campaign.status === 'PENDING' && (
                                    <DropdownMenuItem onClick={() => handleRejectCampaign(campaign)}>
                                      <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                      Reject
                                    </DropdownMenuItem>
                                  )}
                                  {campaign.status === 'ACTIVE' && (
                                    <DropdownMenuItem onClick={() => handleSuspendCampaign(campaign)}>
                                      <Ban className="h-4 w-4 mr-2 text-yellow-600" />
                                      Suspend
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteCampaign(campaign)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                          <Megaphone className="h-8 w-8 mx-auto mb-2" />
                          <p>No campaigns found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>

      {/* Campaign Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Campaign Details
            </DialogTitle>
            <DialogDescription>
              Comprehensive view of campaign information and statistics
            </DialogDescription>
          </DialogHeader>

          {selectedCampaign && (
            <div className="space-y-6">
              {/* Campaign Header */}
              <div className="text-center p-6 border-b">
                <h3 className="text-2xl font-bold mb-2">{selectedCampaign.title}</h3>
                <p className="text-muted-foreground mb-4">{selectedCampaign.description}</p>
                <Badge 
                  variant={
                    selectedCampaign.status === 'ACTIVE' ? 'default' :
                    selectedCampaign.status === 'PENDING' ? 'secondary' :
                    selectedCampaign.status === 'REJECTED' ? 'destructive' :
                    'outline'
                  }
                  className="text-sm"
                >
                  {selectedCampaign.status}
                </Badge>
              </div>

              {/* Campaign Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted p-4 rounded-lg text-center">
                  <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{selectedCampaign.total_votes}</div>
                  <div className="text-sm text-muted-foreground">Total Votes</div>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">₵{selectedCampaign.total_revenue?.toLocaleString() || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">{selectedCampaign.nominee_count || 0}</div>
                  <div className="text-sm text-muted-foreground">Nominees</div>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <Settings className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold">{selectedCampaign.category_count || 0}</div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
              </div>

              {/* Campaign Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Organizer Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Organizer Information
                  </h4>
                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Name:</span>
                      <p className="font-medium">{selectedCampaign.organizer_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <p className="font-medium">{selectedCampaign.organizer_email}</p>
                    </div>
                  </div>
                </div>

                {/* Campaign Timeline */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Campaign Timeline
                  </h4>
                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Start Date:</span>
                      <p className="font-medium">
                        {selectedCampaign.start_date ? new Date(selectedCampaign.start_date).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">End Date:</span>
                      <p className="font-medium">
                        {selectedCampaign.end_date ? new Date(selectedCampaign.end_date).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Created:</span>
                      <p className="font-medium">
                        {new Date(selectedCampaign.created_at).toLocaleDateString()} at {new Date(selectedCampaign.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Last Updated:</span>
                      <p className="font-medium">
                        {new Date(selectedCampaign.updated_at).toLocaleDateString()} at {new Date(selectedCampaign.updated_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Status Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Campaign Performance
                </h4>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{selectedCampaign.total_votes}</div>
                      <div className="text-sm text-muted-foreground">Total Votes Cast</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">₵{selectedCampaign.total_revenue?.toLocaleString() || 0}</div>
                      <div className="text-sm text-muted-foreground">Revenue Generated</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {selectedCampaign.total_votes > 0 ? (selectedCampaign.total_revenue / selectedCampaign.total_votes).toFixed(2) : 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg. Vote Value (₵)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Actions */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setIsModalOpen(false)
                      handleEditCampaign(selectedCampaign)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Campaign
                  </Button>
                  {selectedCampaign.status === 'PENDING' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => {
                          setIsModalOpen(false)
                          handleApproveCampaign(selectedCampaign)
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => {
                          setIsModalOpen(false)
                          handleRejectCampaign(selectedCampaign)
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  {selectedCampaign.status === 'ACTIVE' && (
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => {
                        setIsModalOpen(false)
                        handleSuspendCampaign(selectedCampaign)
                      }}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Suspend
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Campaign Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Campaign
            </DialogTitle>
            <DialogDescription>
              Update campaign information and settings
            </DialogDescription>
          </DialogHeader>

          {editingCampaign && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Campaign Title</Label>
                  <Input
                    id="title"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter campaign title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter campaign description"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={editForm.start_date}
                      onChange={(e) => setEditForm(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={editForm.end_date}
                      onChange={(e) => setEditForm(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={editForm.status} onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Campaign Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Organizer:</span>
                      <p className="font-medium">{editingCampaign.organizer_name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium">{editingCampaign.organizer_email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Votes:</span>
                      <p className="font-medium">{editingCampaign.total_votes}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Revenue:</span>
                      <p className="font-medium">₵{editingCampaign.total_revenue?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveCampaign}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminProtectedRoute>
  )
}