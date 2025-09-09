'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Megaphone, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  RefreshCw,
  PieChart as PieChartIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase-auth'
import AdminLayout from '@/components/admin-layout'
import AdminProtectedRoute from '@/components/admin-protected-route'
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Label
} from 'recharts'
import Highcharts3DPie from '@/components/highcharts-3d-pie'

interface DashboardStats {
  totalUsers: number
  totalCampaigns: number
  totalRevenue: number
  activeCampaigns: number
  pendingCampaigns: number
  totalVotes: number
  paymentSuccessRate: number
  recentActivity: Array<{
    id: string
    type: 'campaign_created' | 'payment_success' | 'user_registered' | 'campaign_published'
    message: string
    timestamp: string
    status: 'success' | 'warning' | 'info'
  }>
  recentTransactions: Array<{
    id: string
    reference: string
    amount: number
    amountGHS: string
    status: string
    method: string
    voterName: string
    campaignTitle: string
    createdAt: string
  }>
  revenueChart: Array<{
    date: string
    revenue: number
    votes?: number
  }>
  campaignPerformance: Array<{
    name: string
    votes: number
    revenue: number
    fullName: string
  }>
  paymentMethodChart: Array<{
    name: string
    value: number
    percentage: number
  }>
  votesTable: Array<{
    id: string
    amount: number
    status: string
    createdAt: string
    voterName: string
    campaignTitle: string
    nomineeName: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardStats = async () => {
    try {
      setRefreshing(true)
      
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const handleRefresh = () => {
    fetchDashboardStats()
    toast.success('Dashboard refreshed')
  }

  if (loading) {
    return (
      <AdminProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span>Loading dashboard...</span>
            </div>
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'campaign_created':
        return <Megaphone className="h-4 w-4" />
      case 'payment_success':
        return <DollarSign className="h-4 w-4" />
      case 'user_registered':
        return <Users className="h-4 w-4" />
      case 'campaign_published':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'info':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTransactionStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4" />
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'FAILED':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-600'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-600'
      case 'FAILED':
        return 'bg-red-100 text-red-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="max-w-7xl mx-auto space-y-6 px-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Platform overview and key performance indicators
            </p>
          </div>
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

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalUsers?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Registered organizers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalCampaigns?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeCampaigns || 0} active, {stats?.pendingCampaigns || 0} pending
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
                ₵{(stats?.totalRevenue || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Platform commission
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalVotes?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all campaigns
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Revenue Trend
              </CardTitle>
              <CardDescription>
                Daily platform revenue from successful payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.revenueChart || []}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                      formatter={(value: any) => [`₵${value}`, 'Revenue']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#revenueGradient)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChartIcon className="h-5 w-5 mr-2" />
                Campaign Revenue Distribution
              </CardTitle>
              <CardDescription>
                Top performing campaigns by revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <Highcharts3DPie />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Megaphone className="h-6 w-6 mb-2" />
                <span>Manage Campaigns</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <Users className="h-6 w-6 mb-2" />
                <span>User Management</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                <DollarSign className="h-6 w-6 mb-2" />
                <span>Financial Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Platform Metrics
              </CardTitle>
              <CardDescription>
                Key performance indicators and system health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Payment Success Rate</span>
                <Badge variant={stats?.paymentSuccessRate && stats.paymentSuccessRate > 95 ? 'default' : 'destructive'}>
                  {stats?.paymentSuccessRate || 0}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Campaigns</span>
                <Badge variant="secondary">
                  {stats?.activeCampaigns || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending Approval</span>
                <Badge variant={stats?.pendingCampaigns && stats.pendingCampaigns > 0 ? 'destructive' : 'secondary'}>
                  {stats?.pendingCampaigns || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Payment Methods Distribution
              </CardTitle>
              <CardDescription>
                Distribution of successful payments by method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={stats?.paymentMethodChart || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={80}
                      innerRadius={20}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {(stats?.paymentMethodChart || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={[
                          '#3b82f6', // Blue
                          '#f43f5e', // Pink/Red
                          '#f97316', // Orange
                          '#22c55e', // Green
                          '#eab308'  // Yellow
                        ][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} payments`, name]}
                      labelStyle={{ fontSize: '12px' }}
                      contentStyle={{ fontSize: '12px' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Payment Method Legend */}
              <div className="space-y-2">
                {stats?.paymentMethodChart && stats.paymentMethodChart.length > 0 ? (
                  stats.paymentMethodChart.map((method, index) => (
                    <div key={method.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ 
                            backgroundColor: [
                              '#3b82f6', // Blue
                              '#f43f5e', // Pink/Red
                              '#f97316', // Orange
                              '#22c55e', // Green
                              '#eab308'  // Yellow
                            ][index % 5]
                          }}
                        />
                        <span className="font-medium">{method.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{method.value}</span>
                        <span className="text-muted-foreground ml-1">({method.percentage}%)</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <DollarSign className="h-8 w-8 mx-auto mb-2" />
                    <p>No payment data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Recent Transactions
              </CardTitle>
              <CardDescription>
                Latest payment transactions and financial activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto space-y-3">
                {stats?.recentTransactions?.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getTransactionStatusColor(transaction.status)}`}>
                        {getTransactionStatusIcon(transaction.status)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{transaction.reference}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.campaignTitle} • {transaction.voterName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">₵{transaction.amountGHS}</p>
                      <p className="text-xs text-muted-foreground">{transaction.method}</p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <DollarSign className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No recent transactions</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest platform activities and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.recentActivity?.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`mt-0.5 ${getActivityColor(activity.status)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        {activity.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-4">
                    <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Votes Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Recent Votes
            </CardTitle>
            <CardDescription>
              Latest voting activity across all campaigns
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background border-b">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Voter</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Campaign</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nominee</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.votesTable && stats.votesTable.length > 0 ? (
                      stats.votesTable.slice(0, 20).map((vote) => (
                        <tr key={vote.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 text-sm">
                            <div className="font-medium">{vote.voterName}</div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <div className="max-w-[200px] truncate" title={vote.campaignTitle}>
                              {vote.campaignTitle}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <div className="max-w-[150px] truncate" title={vote.nomineeName}>
                              {vote.nomineeName}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm font-medium">
                            ₵{(vote.amount / 100).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <Badge 
                              variant={vote.status === 'SUCCESS' ? 'default' : vote.status === 'PENDING' ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {vote.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(vote.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          <Users className="h-8 w-8 mx-auto mb-2" />
                          <p>No votes found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  )
}