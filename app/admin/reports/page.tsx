'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Megaphone,
  Download,
  RefreshCw,
  Calendar,
  FileText,
  PieChart,
  Activity
} from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '@/components/admin-layout'
import AdminProtectedRoute from '@/components/admin-protected-route'

interface ReportData {
  type: string
  period: { dateFrom: string; dateTo: string }
  metrics?: any
  summary?: any
  dailyData?: any[]
  campaigns?: any[]
  users?: any[]
  payments?: any[]
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [reportType, setReportType] = useState('overview')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [format, setFormat] = useState('json')

  const generateReport = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token found')
      }

      const params = new URLSearchParams({
        type: reportType,
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
        ...(format && { format })
      })

      const response = await fetch(`/api/admin/reports?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      if (format === 'csv') {
        // Handle CSV download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${reportType}-report.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Report downloaded successfully')
        return
      }

      const data = await response.json()
      setReportData(data.report)
      toast.success('Report generated successfully')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const renderOverviewReport = () => {
    if (!reportData?.metrics) return null

    const { metrics } = reportData

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalCampaigns}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₵{metrics.totalRevenueGHS}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.successRate}%</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span className="font-medium">Paystack</span>
                <span className="text-lg font-bold">{metrics.methodBreakdown.PAYSTACK}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span className="font-medium">NALO USSD</span>
                <span className="text-lg font-bold">{metrics.methodBreakdown.NALO_USSD}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderRevenueReport = () => {
    if (!reportData?.summary || !reportData?.dailyData) return null

    const { summary, dailyData } = reportData

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₵{summary.totalRevenueGHS}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalTransactions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₵{summary.avgTransactionValueGHS}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue</CardTitle>
            <CardDescription>Revenue breakdown by day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dailyData.slice(0, 10).map((day, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{formatDate(day.date)}</span>
                  <div className="text-right">
                    <div className="font-bold">₵{day.amountGHS}</div>
                    <div className="text-sm text-muted-foreground">{day.count} transactions</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderCampaignsReport = () => {
    if (!reportData?.campaigns) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Top performing campaigns by revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.campaigns.slice(0, 10).map((campaign, index) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{campaign.title}</div>
                  <div className="text-sm text-muted-foreground">by {campaign.users.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {campaign.successfulPayments}/{campaign.totalPayments} payments ({campaign.successRate}% success rate)
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">₵{campaign.totalRevenueGHS}</div>
                  <div className="text-sm text-muted-foreground">{campaign.totalPayments} transactions</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderUsersReport = () => {
    if (!reportData?.users) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
          <CardDescription>Top users by campaign revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.users.slice(0, 10).map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <div className="text-sm text-muted-foreground">
                    {user.campaignsCount} campaigns, {user.votesCount} votes
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">₵{user.totalRevenueGHS}</div>
                  <div className="text-sm text-muted-foreground">Total revenue</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderPaymentsReport = () => {
    if (!reportData?.payments) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>Recent payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Reference</th>
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Method</th>
                  <th className="text-left p-2">Campaign</th>
                  <th className="text-left p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {reportData.payments.slice(0, 20).map((payment) => (
                  <tr key={payment.id} className="border-b">
                    <td className="p-2 font-mono text-sm">{payment.reference}</td>
                    <td className="p-2 font-semibold">₵{payment.amountGHS}</td>
                    <td className="p-2">
                      <Badge variant={payment.status === 'SUCCESS' ? 'default' : 'secondary'}>
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="p-2">{payment.method}</td>
                    <td className="p-2">
                      <div className="text-sm">
                        <div className="font-medium">{payment.campaignTitle}</div>
                        <div className="text-muted-foreground">by {payment.organizerName}</div>
                      </div>
                    </td>
                    <td className="p-2 text-sm">{formatDate(payment.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate comprehensive reports and analytics</p>
        </div>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="campaigns">Campaigns</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="payments">Payments</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={generateReport} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {reportData.type.charAt(0).toUpperCase() + reportData.type.slice(1)} Report
              </h2>
              <p className="text-muted-foreground">
                {reportData.period.dateFrom && reportData.period.dateTo 
                  ? `${formatDate(reportData.period.dateFrom)} - ${formatDate(reportData.period.dateTo)}`
                  : 'All time'
                }
              </p>
            </div>
            <Button variant="outline" onClick={generateReport} disabled={loading}>
              <Download className="w-4 h-4 mr-2" />
              {format === 'csv' ? 'Download CSV' : 'Refresh'}
            </Button>
          </div>

          {reportData.type === 'overview' && renderOverviewReport()}
          {reportData.type === 'revenue' && renderRevenueReport()}
          {reportData.type === 'campaigns' && renderCampaignsReport()}
          {reportData.type === 'users' && renderUsersReport()}
          {reportData.type === 'payments' && renderPaymentsReport()}
        </div>
      )}
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  )
}
