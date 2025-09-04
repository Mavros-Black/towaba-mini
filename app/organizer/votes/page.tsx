"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  CreditCard, 
  TrendingUp, 
  Download, 
  Filter, 
  Search, 
  Calendar,
  DollarSign,
  Users,
  BarChart3,
  PieChart,
  Activity,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { DashboardWrapper } from '@/components/dashboard-wrapper'
import { 
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
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts'

interface Transaction {
  id: string
  reference: string
  campaign_id: string
  nominee_id: string
  amount: number
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
  method: string
  voter_name: string
  created_at: string
  campaign_title?: string
  nominee_name?: string
}

interface ChartData {
  name: string
  votes: number
  revenue: number
}

interface PieData {
  name: string
  value: number
  color: string
}

export default function VotesPage() {
  const { user, session, loading } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [chartsLoading, setChartsLoading] = useState(true)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [pieData, setPieData] = useState<PieData[]>([])
  const [areaData, setAreaData] = useState<ChartData[]>([])

  useEffect(() => {
    if (session?.access_token) {
      fetchTransactions()
      fetchChartData()
    }
  }, [session])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm, statusFilter, methodFilter, dateFilter])

  const fetchTransactions = async () => {
    try {
      if (!session?.access_token) return
      
      const response = await fetch('/api/organizer/transactions', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const fetchChartData = async () => {
    try {
      if (!session?.access_token) return
      
      setChartsLoading(true)
      const response = await fetch('/api/campaigns/charts', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setChartData(data.chartData || [])
        setPieData(data.pieData || [])
        setAreaData(data.areaData || [])
      }
    } catch (error) {
      console.error('Error fetching chart data:', error)
    } finally {
      setChartsLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = [...transactions]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.voter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.campaign_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.nominee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter)
    }

    // Method filter
    if (methodFilter !== 'all') {
      filtered = filtered.filter(t => t.method === methodFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(t => new Date(t.created_at) >= today)
          break
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(t => new Date(t.created_at) >= weekAgo)
          break
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(t => new Date(t.created_at) >= monthAgo)
          break
      }
    }

    setFilteredTransactions(filtered)
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Reference', 'Campaign', 'Nominee', 'Voter', 'Amount (GHS)', 'Status', 'Method', 'Date']
    const csvData = filteredTransactions.map(t => [
      t.id,
      t.reference,
      t.campaign_title || 'Unknown',
      t.nominee_name || 'Unknown',
      t.voter_name,
      (t.amount / 100).toFixed(2),
      t.status,
      t.method,
      new Date(t.created_at).toLocaleDateString()
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `votes-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'default'
      case 'PENDING': return 'secondary'
      case 'FAILED': return 'destructive'
      default: return 'secondary'
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'paystack': return '💳'
      case 'nalo': return '📱'
      case 'mobile_money': return '📱'
      default: return '💳'
    }
  }

  if (loading) {
    return (
      <DashboardWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardWrapper>
    )
  }

  const totalRevenue = filteredTransactions
    .filter(t => t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0)

  const successCount = filteredTransactions.filter(t => t.status === 'SUCCESS').length
  const pendingCount = filteredTransactions.filter(t => t.status === 'PENDING').length
  const failedCount = filteredTransactions.filter(t => t.status === 'FAILED').length

  return (
    <DashboardWrapper>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
          <h1 className="text-4xl font-bold mb-3">Votes & Transactions</h1>
          <p className="text-xl text-green-100">Complete overview of all voting activity and payments</p>
          <div className="mt-6 flex justify-center space-x-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{filteredTransactions.length}</div>
              <div className="text-sm text-green-200">Total Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{successCount}</div>
              <div className="text-sm text-green-200">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">₵{(totalRevenue / 100).toFixed(2)}</div>
              <div className="text-sm text-green-200">Total Revenue</div>
            </div>
          </div>
        </div>

        {/* Filters and Export */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-primary" />
                  <span>Filters & Export</span>
                </CardTitle>
                <CardDescription>Filter transactions and export data</CardDescription>
              </div>
              <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="SUCCESS">Successful</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Method</label>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="PAYSTACK">Paystack</SelectItem>
                    <SelectItem value="NALO">Nalo</SelectItem>
                    <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution Pie Chart */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-primary" />
                <span>Transaction Status Distribution</span>
              </CardTitle>
              <CardDescription>Breakdown of successful, pending, and failed transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {chartsLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'Successful', value: successCount, color: '#10B981' },
                        { name: 'Pending', value: pendingCount, color: '#3B82F6' },
                        { name: 'Failed', value: failedCount, color: '#EF4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: 'Successful', value: successCount, color: '#10B981' },
                        { name: 'Pending', value: pendingCount, color: '#3B82F6' },
                        { name: 'Failed', value: failedCount, color: '#EF4444' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Revenue Trend Line Chart */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>Revenue Trend</span>
              </CardTitle>
              <CardDescription>Daily revenue from successful transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {chartsLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`₵${((value as number) / 100).toFixed(2)}`, 'Revenue']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <span>All Transactions</span>
            </CardTitle>
            <CardDescription>
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign & Nominee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voter</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-mono text-gray-900 font-medium">
                              {transaction.reference}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              {transaction.id.slice(0, 8)}...
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="max-w-[200px]">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {transaction.campaign_title || 'Unknown Campaign'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              → {transaction.nominee_name || 'Unknown Nominee'}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-sm text-gray-900">{transaction.voter_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              ₵{(transaction.amount / 100).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {transaction.amount} pesewas
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getMethodIcon(transaction.method)}</span>
                            <span className="text-sm text-gray-600">{transaction.method}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-500">
                            <div>{new Date(transaction.created_at).toLocaleDateString()}</div>
                            <div className="text-xs">
                              {new Date(transaction.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center space-y-2">
                          <CreditCard className="w-12 h-12 text-gray-300" />
                          <p>No transactions found</p>
                          <p className="text-sm text-gray-400">
                            Try adjusting your filters or check back later
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardWrapper>
  )
}
