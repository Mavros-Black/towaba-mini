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
import { 
  DollarSign, 
  CreditCard, 
  Smartphone, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Eye,
  AlertTriangle,
  Calendar,
  User,
  Building,
  Shield,
  RotateCcw,
  Ban,
  Edit
} from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '@/components/admin-layout'
import AdminProtectedRoute from '@/components/admin-protected-route'

interface Payment {
  id: string
  amount: number
  amountGHS: string
  reference: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
  method: 'PAYSTACK' | 'NALO_USSD'
  voterName: string
  metadata: any
  createdAt: string
  updatedAt: string
  campaign: {
    id: string
    title: string
    organizer: {
      id: string
      name: string
      email: string
    }
  }
}

interface FinancialData {
  overview: {
    totalRevenue: number
    totalRevenueGHS: string
    totalTransactions: number
    successRate: string
    avgTransactionValue: number
    avgTransactionValueGHS: string
  }
  statistics: {
    byStatus: {
      total: number
      successful: number
      pending: number
      failed: number
      amounts: {
        successful: number
        successfulGHS: string
        pending: number
        pendingGHS: string
        failed: number
        failedGHS: string
      }
    }
    byMethod: {
      PAYSTACK: {
        count: number
        amount: number
        amountGHS: string
        successful: number
        successRate: string
      }
      NALO_USSD: {
        count: number
        amount: number
        amountGHS: string
        successful: number
        successRate: string
      }
    }
  }
  recentTransactions: Payment[]
  topCampaigns: Array<{
    id: string
    title: string
    organizer: string
    amount: number
    amountGHS: string
    count: number
  }>
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState<'verify' | 'reject' | 'refund' | 'update_status'>('verify')
  const [actionNotes, setActionNotes] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [processingAction, setProcessingAction] = useState(false)
  
  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const limit = 10

  const fetchPayments = async () => {
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
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...(methodFilter && methodFilter !== 'all' && { method: methodFilter }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      })

      const response = await fetch(`/api/admin/payments?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch payments')
      }

      const data = await response.json()
      setPayments(data.payments)
      setTotalPages(data.pagination.pages)
      setTotalCount(data.pagination.total)
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error('Failed to fetch payments')
    } finally {
      setRefreshing(false)
    }
  }

  const fetchFinancialData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token found')
      }

      const params = new URLSearchParams()
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)

      const response = await fetch(`/api/admin/financial?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch financial data')
      }

      const data = await response.json()
      setFinancialData(data.data)
    } catch (error) {
      console.error('Error fetching financial data:', error)
      toast.error('Failed to fetch financial data')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchPayments(), fetchFinancialData()])
      setLoading(false)
    }
    loadData()
  }, [currentPage, search, statusFilter, methodFilter, dateFrom, dateTo])

  const handleRefresh = () => {
    fetchPayments()
    fetchFinancialData()
  }

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsDetailsModalOpen(true)
  }

  const handlePaymentAction = (payment: Payment, action: 'verify' | 'reject' | 'refund' | 'update_status') => {
    setSelectedPayment(payment)
    setActionType(action)
    setActionNotes('')
    setNewStatus('')
    setIsActionModalOpen(true)
  }

  const handleProcessAction = async () => {
    if (!selectedPayment) return

    try {
      setProcessingAction(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token found')
      }

      const requestBody: any = {
        action: actionType,
        notes: actionNotes
      }

      if (actionType === 'update_status') {
        if (!newStatus) {
          toast.error('Please select a status')
          return
        }
        requestBody.status = newStatus
      }

      const response = await fetch(`/api/admin/payments/${selectedPayment.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error('Failed to process action')
      }

      const data = await response.json()
      toast.success(data.message)
      
      // Reset form and refresh data
      setIsActionModalOpen(false)
      setActionNotes('')
      setNewStatus('')
      await fetchPayments()
      
    } catch (error) {
      console.error('Error processing action:', error)
      toast.error('Failed to process action')
    } finally {
      setProcessingAction(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'PAYSTACK':
        return <CreditCard className="w-4 h-4" />
      case 'NALO_USSD':
        return <Smartphone className="w-4 h-4" />
      default:
        return <DollarSign className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
          <h1 className="text-3xl font-bold">Financial Management</h1>
          <p className="text-muted-foreground">Monitor payments, revenue, and financial transactions</p>
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

      {/* Financial Overview Cards */}
      {financialData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₵{financialData.overview.totalRevenueGHS}</div>
              <p className="text-xs text-muted-foreground">
                {financialData.overview.totalTransactions} transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{financialData.overview.successRate}%</div>
              <p className="text-xs text-muted-foreground">
                Payment success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₵{financialData.overview.avgTransactionValueGHS}</div>
              <p className="text-xs text-muted-foreground">
                Per successful payment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₵{financialData.statistics.byStatus.amounts.pendingGHS}</div>
              <p className="text-xs text-muted-foreground">
                {financialData.statistics.byStatus.pending} pending payments
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Method Breakdown */}
      {financialData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Paystack Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Amount:</span>
                  <span className="font-medium">₵{financialData.statistics.byMethod.PAYSTACK.amountGHS}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Transactions:</span>
                  <span className="font-medium">{financialData.statistics.byMethod.PAYSTACK.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Success Rate:</span>
                  <span className="font-medium">{financialData.statistics.byMethod.PAYSTACK.successRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                NALO USSD Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Amount:</span>
                  <span className="font-medium">₵{financialData.statistics.byMethod.NALO_USSD.amountGHS}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Transactions:</span>
                  <span className="font-medium">{financialData.statistics.byMethod.NALO_USSD.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Success Rate:</span>
                  <span className="font-medium">{financialData.statistics.byMethod.NALO_USSD.successRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Reference, voter, campaign..."
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
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Payment Method</Label>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All methods</SelectItem>
                  <SelectItem value="PAYSTACK">Paystack</SelectItem>
                  <SelectItem value="NALO_USSD">NALO USSD</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>
            Showing {payments.length} of {totalCount} payments
          </CardDescription>
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
                  <th className="text-left p-2">Voter</th>
                  <th className="text-left p-2">Campaign</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div className="font-mono text-sm">{payment.reference}</div>
                    </td>
                    <td className="p-2">
                      <div className="font-semibold">₵{payment.amountGHS}</div>
                    </td>
                    <td className="p-2">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {getMethodIcon(payment.method)}
                        <span className="text-sm">{payment.method}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="text-sm">{payment.voterName}</div>
                    </td>
                    <td className="p-2">
                      <div className="text-sm">
                        <div className="font-medium">{payment.campaign.title}</div>
                        <div className="text-muted-foreground">by {payment.campaign.organizer.name}</div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="text-sm">{formatDate(payment.createdAt)}</div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(payment)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {payment.status === 'PENDING' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePaymentAction(payment, 'verify')}
                              title="Verify Payment"
                              className="text-green-600 hover:text-green-700"
                            >
                              <Shield className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePaymentAction(payment, 'reject')}
                              title="Reject Payment"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        
                        {payment.status === 'SUCCESS' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePaymentAction(payment, 'refund')}
                            title="Process Refund"
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePaymentAction(payment, 'update_status')}
                          title="Update Status"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
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

      {/* Payment Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Complete information about this payment transaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-6">
              {/* Payment Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Reference</Label>
                  <div className="font-mono text-sm">{selectedPayment.reference}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                  <div className="text-lg font-semibold">₵{selectedPayment.amountGHS}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div>{getStatusBadge(selectedPayment.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Method</Label>
                  <div className="flex items-center gap-2">
                    {getMethodIcon(selectedPayment.method)}
                    <span>{selectedPayment.method}</span>
                  </div>
                </div>
              </div>

              {/* Campaign Information */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Campaign</Label>
                <div className="p-3 bg-muted rounded-md">
                  <div className="font-medium">{selectedPayment.campaign.title}</div>
                  <div className="text-sm text-muted-foreground">
                    Organized by {selectedPayment.campaign.organizer.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedPayment.campaign.organizer.email}
                  </div>
                </div>
              </div>

              {/* Voter Information */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Voter</Label>
                <div className="p-3 bg-muted rounded-md">
                  <div className="font-medium">{selectedPayment.voterName}</div>
                  {selectedPayment.metadata?.phone && (
                    <div className="text-sm text-muted-foreground">
                      Phone: {selectedPayment.metadata.phone}
                    </div>
                  )}
                  {selectedPayment.metadata?.email && (
                    <div className="text-sm text-muted-foreground">
                      Email: {selectedPayment.metadata.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                  <div className="text-sm">{formatDate(selectedPayment.createdAt)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Updated</Label>
                  <div className="text-sm">{formatDate(selectedPayment.updatedAt)}</div>
                </div>
              </div>

              {/* Metadata */}
              {selectedPayment.metadata && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Additional Information</Label>
                  <Textarea
                    value={JSON.stringify(selectedPayment.metadata, null, 2)}
                    readOnly
                    className="min-h-[100px] font-mono text-xs"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Action Modal */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'verify' && 'Verify Payment'}
              {actionType === 'reject' && 'Reject Payment'}
              {actionType === 'refund' && 'Process Refund'}
              {actionType === 'update_status' && 'Update Payment Status'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'verify' && 'Mark this payment as verified and successful'}
              {actionType === 'reject' && 'Mark this payment as rejected and failed'}
              {actionType === 'refund' && 'Process a refund for this successful payment'}
              {actionType === 'update_status' && 'Update the payment status manually'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              {/* Payment Info */}
              <div className="p-3 bg-muted rounded-md">
                <div className="text-sm">
                  <div className="font-medium">Reference: {selectedPayment.reference}</div>
                  <div className="text-muted-foreground">Amount: ₵{selectedPayment.amountGHS}</div>
                  <div className="text-muted-foreground">Current Status: {selectedPayment.status}</div>
                </div>
              </div>

              {/* Status Selection (for update_status action) */}
              {actionType === 'update_status' && (
                <div className="space-y-2">
                  <Label htmlFor="newStatus">New Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="SUCCESS">Success</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                      <SelectItem value="REFUNDED">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="actionNotes">
                  {actionType === 'verify' && 'Verification Notes (Optional)'}
                  {actionType === 'reject' && 'Rejection Reason (Optional)'}
                  {actionType === 'refund' && 'Refund Notes (Optional)'}
                  {actionType === 'update_status' && 'Status Update Notes (Optional)'}
                </Label>
                <Textarea
                  id="actionNotes"
                  placeholder="Add any notes about this action..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsActionModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleProcessAction} 
                  disabled={processingAction}
                  className={
                    actionType === 'verify' ? 'bg-green-600 hover:bg-green-700' :
                    actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                    actionType === 'refund' ? 'bg-orange-600 hover:bg-orange-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }
                >
                  {processingAction ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {actionType === 'verify' && <Shield className="w-4 h-4 mr-2" />}
                      {actionType === 'reject' && <Ban className="w-4 h-4 mr-2" />}
                      {actionType === 'refund' && <RotateCcw className="w-4 h-4 mr-2" />}
                      {actionType === 'update_status' && <Edit className="w-4 h-4 mr-2" />}
                      {actionType === 'verify' && 'Verify Payment'}
                      {actionType === 'reject' && 'Reject Payment'}
                      {actionType === 'refund' && 'Process Refund'}
                      {actionType === 'update_status' && 'Update Status'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
        </div>
        )}
      </AdminLayout>
    </AdminProtectedRoute>
  )
}
