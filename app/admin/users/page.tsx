'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Users, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Ban,
  User,
  Mail,
  Calendar,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Shield,
  UserCheck,
  UserX,
  Crown,
  Vote,
  DollarSign,
  Megaphone
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase-auth'
import AdminLayout from '@/components/admin-layout'
import AdminProtectedRoute from '@/components/admin-protected-route'

interface User {
  id: string
  email: string
  name: string
  role: 'voter' | 'organizer'
  account_status: 'active' | 'suspended' | 'pending'
  campaign_count: number
  vote_count: number
  payment_count: number
  total_revenue: number
  last_activity: string
  created_at: string
  updated_at: string
}

interface UserFilters {
  status: string
  role: string
  search: string
  sortBy: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filters, setFilters] = useState<UserFilters>({
    status: 'all',
    role: 'all',
    search: '',
    sortBy: 'created_at'
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchUsers = async () => {
    try {
      setRefreshing(true)
      
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      if (data.success) {
        setUsers(data.users || [])
      } else {
        throw new Error(data.error || 'Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRefresh = () => {
    fetchUsers()
    toast.success('Users refreshed')
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  const handleSuspendUser = async (user: User) => {
    if (!confirm(`Are you sure you want to suspend "${user.name || user.email}"?`)) {
      return
    }

    try {
      // TODO: Implement user suspension API
      toast.info(`User suspension for "${user.name || user.email}" will be implemented`)
      console.log('Suspend user:', user)
    } catch (error) {
      console.error('Error suspending user:', error)
      toast.error('Failed to suspend user')
    }
  }

  const handleActivateUser = async (user: User) => {
    try {
      // TODO: Implement user activation API
      toast.info(`User activation for "${user.name || user.email}" will be implemented`)
      console.log('Activate user:', user)
    } catch (error) {
      console.error('Error activating user:', error)
      toast.error('Failed to activate user')
    }
  }

  const handleApproveOrganizer = async (user: User) => {
    try {
      // TODO: Implement organizer approval API
      toast.info(`Organizer approval for "${user.name || user.email}" will be implemented`)
      console.log('Approve organizer:', user)
    } catch (error) {
      console.error('Error approving organizer:', error)
      toast.error('Failed to approve organizer')
    }
  }

  // Filter users based on current filters
  const filteredUsers = users.filter(user => {
    if (filters.status !== 'all' && user.account_status !== filters.status) return false
    if (filters.role !== 'all' && user.role !== filters.role) return false
    if (filters.search && !user.name?.toLowerCase().includes(filters.search.toLowerCase()) && 
        !user.email.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="text-muted-foreground">
                  Manage users, organizers, and account permissions
                </p>
              </div>
              <div className="flex items-center gap-2">
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
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Registered users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Organizers</CardTitle>
                  <Crown className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users.filter(u => u.role === 'organizer').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Campaign creators
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <UserCheck className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users.filter(u => u.account_status === 'active').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                  <Vote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users.reduce((sum, u) => sum + u.vote_count, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all users
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
                        placeholder="Search users..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <Select value={filters.role} onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="organizer">Organizers</SelectItem>
                        <SelectItem value="voter">Voters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
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
                        <SelectItem value="created_at">Registration Date</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="campaign_count">Campaigns</SelectItem>
                        <SelectItem value="vote_count">Votes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>Users ({filteredUsers.length})</CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Campaigns</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Votes</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Revenue</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                <div className="font-medium">{user.name || 'No Name'}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge 
                                variant={user.role === 'organizer' ? 'default' : 'secondary'}
                                className="flex items-center gap-1 w-fit"
                              >
                                {user.role === 'organizer' ? (
                                  <Crown className="h-3 w-3" />
                                ) : (
                                  <User className="h-3 w-3" />
                                )}
                                {user.role}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge 
                                variant={
                                  user.account_status === 'active' ? 'default' :
                                  user.account_status === 'suspended' ? 'destructive' :
                                  'secondary'
                                }
                              >
                                {user.account_status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <Megaphone className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{user.campaign_count}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <Vote className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{user.vote_count}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">₵{user.total_revenue?.toLocaleString() || 0}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                <div className="text-sm font-medium">
                                  {new Date(user.created_at).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(user.created_at).toLocaleTimeString()}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleViewUser(user)}
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
                                    <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {user.account_status === 'active' && (
                                      <DropdownMenuItem onClick={() => handleSuspendUser(user)}>
                                        <Ban className="h-4 w-4 mr-2 text-red-600" />
                                        Suspend User
                                      </DropdownMenuItem>
                                    )}
                                    {user.account_status === 'suspended' && (
                                      <DropdownMenuItem onClick={() => handleActivateUser(user)}>
                                        <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                                        Activate User
                                      </DropdownMenuItem>
                                    )}
                                    {user.role === 'organizer' && (
                                      <DropdownMenuItem onClick={() => handleApproveOrganizer(user)}>
                                        <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                                        Approve Organizer
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-muted-foreground">
                            <Users className="h-8 w-8 mx-auto mb-2" />
                            <p>No users found</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* User Details Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    User Details
                  </DialogTitle>
                  <DialogDescription>
                    Comprehensive view of user information and activity
                  </DialogDescription>
                </DialogHeader>

                {selectedUser && (
                  <div className="space-y-6">
                    {/* User Header */}
                    <div className="text-center p-6 border-b">
                      <h3 className="text-2xl font-bold mb-2">{selectedUser.name || 'No Name'}</h3>
                      <p className="text-muted-foreground mb-4">{selectedUser.email}</p>
                      <div className="flex justify-center gap-2">
                        <Badge 
                          variant={selectedUser.role === 'organizer' ? 'default' : 'secondary'}
                          className="flex items-center gap-1"
                        >
                          {selectedUser.role === 'organizer' ? (
                            <Crown className="h-3 w-3" />
                          ) : (
                            <User className="h-3 w-3" />
                          )}
                          {selectedUser.role}
                        </Badge>
                        <Badge 
                          variant={
                            selectedUser.account_status === 'active' ? 'default' :
                            selectedUser.account_status === 'suspended' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {selectedUser.account_status}
                        </Badge>
                      </div>
                    </div>

                    {/* User Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <Megaphone className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold">{selectedUser.campaign_count}</div>
                        <div className="text-sm text-muted-foreground">Campaigns</div>
                      </div>
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <Vote className="h-6 w-6 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold">{selectedUser.vote_count}</div>
                        <div className="text-sm text-muted-foreground">Votes Cast</div>
                      </div>
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <DollarSign className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                        <div className="text-2xl font-bold">₵{selectedUser.total_revenue?.toLocaleString() || 0}</div>
                        <div className="text-sm text-muted-foreground">Total Revenue</div>
                      </div>
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <Calendar className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                        <div className="text-2xl font-bold">
                          {Math.floor((Date.now() - new Date(selectedUser.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                        </div>
                        <div className="text-sm text-muted-foreground">Days Active</div>
                      </div>
                    </div>

                    {/* User Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Account Information
                        </h4>
                        <div className="bg-muted p-4 rounded-lg space-y-3">
                          <div>
                            <span className="text-sm text-muted-foreground">Email:</span>
                            <p className="font-medium">{selectedUser.email}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Name:</span>
                            <p className="font-medium">{selectedUser.name || 'Not provided'}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">User ID:</span>
                            <p className="font-medium text-xs">{selectedUser.id}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Account Timeline
                        </h4>
                        <div className="bg-muted p-4 rounded-lg space-y-3">
                          <div>
                            <span className="text-sm text-muted-foreground">Joined:</span>
                            <p className="font-medium">
                              {new Date(selectedUser.created_at).toLocaleDateString()} at {new Date(selectedUser.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Last Activity:</span>
                            <p className="font-medium">
                              {new Date(selectedUser.last_activity).toLocaleDateString()} at {new Date(selectedUser.last_activity).toLocaleTimeString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Account Status:</span>
                            <p className="font-medium capitalize">{selectedUser.account_status}</p>
                          </div>
                        </div>
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
          </div>
        )}
      </AdminLayout>
    </AdminProtectedRoute>
  )
}