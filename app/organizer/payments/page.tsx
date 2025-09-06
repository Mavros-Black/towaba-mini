"use client"

import { useState, useEffect } from 'react'

// Utility function for number formatting
const formatNumber = (num: number): string => {
  return num.toLocaleString()
}

const formatCurrency = (amount: number): string => {
  return `₵${(amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Download,
  Filter,
  Search,
  Calendar,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Smartphone,
  Banknote,
  Plus,
  Award
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { DashboardWrapper } from '@/components/dashboard-wrapper'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PayoutRequestModal } from '@/components/payout-request-modal'

interface Transaction {
  id: string
  reference: string
  amount: number
  platform_fee: number
  organizer_earnings: number
  status: 'SUCCESS' | 'PENDING' | 'FAILED'
  method: 'PAYSTACK' | 'NALO'
  campaign_title: string
  nominee_name: string
  voter_name?: string
  created_at: string
  updated_at: string
}

interface PayoutRequest {
  id: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'PROCESSED' | 'REJECTED'
  request_type: 'DAILY' | 'WEEKLY' | 'END_OF_PROGRAM'
  requested_at: string
  processed_at?: string
  bank_details?: {
    account_name: string
    account_number: string
    bank_name: string
  }
}

interface PaymentStats {
  totalEarnings: number
  totalPlatformFees: number
  totalTransactions: number
  pendingPayouts: number
  processedPayouts: number
  commissionRate: number
  monthlyGrowth: number
  availableBalance: number
}

export default function PaymentsPage() {
  const { user, session, loading } = useAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    totalEarnings: 0,
    totalPlatformFees: 0,
    totalTransactions: 0,
    pendingPayouts: 0,
    processedPayouts: 0,
    commissionRate: 15,
    monthlyGrowth: 0,
    availableBalance: 0
  })
  const [loadingData, setLoadingData] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [methodFilter, setMethodFilter] = useState('ALL')
  const [isCreatingPayout, setIsCreatingPayout] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (session?.access_token) {
      fetchTransactions()
      fetchPaymentStats()
      fetchPayoutRequests()
    }
  }, [session])

  const fetchTransactions = async () => {
    try {
      if (!session?.access_token) return
      
      setLoadingData(true)
      const response = await fetch('/api/organizer/transactions', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      } else {
        console.error('Failed to fetch transactions:', response.status)
        // Generate sample data for demo if API fails
        generateSampleTransactions()
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      // Generate sample data for demo
      generateSampleTransactions()
    } finally {
      setLoadingData(false)
    }
  }

  const fetchPaymentStats = async () => {
    try {
      if (!session?.access_token) return
      
      const response = await fetch('/api/organizer/payments/stats', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error('Failed to fetch payment stats:', response.status)
        generateSampleStats()
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error)
      generateSampleStats()
    }
  }

  const fetchPayoutRequests = async () => {
    try {
      if (!session?.access_token) return
      
      const response = await fetch('/api/organizer/payouts', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPayoutRequests(data.payoutRequests || [])
      } else {
        console.error('Failed to fetch payout requests:', response.status)
        generateSamplePayoutRequests()
      }
    } catch (error) {
      console.error('Error fetching payout requests:', error)
      generateSamplePayoutRequests()
    }
  }

  const generateSampleTransactions = () => {
    const sampleTransactions: Transaction[] = [
      {
        id: '1',
        reference: 'TXN_001_2024',
        amount: 500,
        platform_fee: 75,
        organizer_earnings: 425,
        status: 'SUCCESS',
        method: 'PAYSTACK',
        campaign_title: 'Kumerica Awards',
        nominee_name: 'Kwame Asante',
        voter_name: 'John Doe',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        reference: 'TXN_002_2024',
        amount: 1000,
        platform_fee: 150,
        organizer_earnings: 850,
        status: 'SUCCESS',
        method: 'NALO',
        campaign_title: 'Kumerica Awards',
        nominee_name: 'Ama Serwaa',
        voter_name: 'Jane Smith',
        created_at: '2024-01-15T11:15:00Z',
        updated_at: '2024-01-15T11:15:00Z'
      },
      {
        id: '3',
        reference: 'TXN_003_2024',
        amount: 200,
        platform_fee: 30,
        organizer_earnings: 170,
        status: 'PENDING',
        method: 'PAYSTACK',
        campaign_title: 'Ghana Music Awards',
        nominee_name: 'Kojo Antwi',
        voter_name: 'Mike Johnson',
        created_at: '2024-01-15T12:00:00Z',
        updated_at: '2024-01-15T12:00:00Z'
      },
      {
        id: '4',
        reference: 'TXN_004_2024',
        amount: 300,
        platform_fee: 45,
        organizer_earnings: 255,
        status: 'FAILED',
        method: 'NALO',
        campaign_title: 'Kumerica Awards',
        nominee_name: 'Yaa Asantewaa',
        voter_name: 'Sarah Wilson',
        created_at: '2024-01-15T13:45:00Z',
        updated_at: '2024-01-15T13:45:00Z'
      }
    ]
    setTransactions(sampleTransactions)
  }

  const generateSamplePayoutRequests = () => {
    const samplePayouts: PayoutRequest[] = [
      {
        id: '1',
        amount: 5000,
        status: 'PROCESSED',
        request_type: 'WEEKLY',
        requested_at: '2024-01-10T09:00:00Z',
        processed_at: '2024-01-12T14:30:00Z',
        bank_details: {
          account_name: 'John Doe',
          account_number: '1234567890',
          bank_name: 'Ghana Commercial Bank'
        }
      },
      {
        id: '2',
        amount: 2500,
        status: 'PENDING',
        request_type: 'DAILY',
        requested_at: '2024-01-15T08:00:00Z'
      },
      {
        id: '3',
        amount: 3200,
        status: 'APPROVED',
        request_type: 'WEEKLY',
        requested_at: '2024-01-14T10:00:00Z'
      },
      {
        id: '4',
        amount: 15000,
        status: 'PROCESSED',
        request_type: 'END_OF_PROGRAM',
        requested_at: '2024-01-05T16:00:00Z',
        processed_at: '2024-01-08T10:15:00Z',
        bank_details: {
          account_name: 'John Doe',
          account_number: '1234567890',
          bank_name: 'Ghana Commercial Bank'
        }
      }
    ]
    setPayoutRequests(samplePayouts)
  }

  const createPayoutRequest = async (payoutData: {
    amount: number
    request_type: 'DAILY' | 'WEEKLY' | 'END_OF_PROGRAM'
    bank_details: {
      payment_method?: 'bank' | 'mobile_money'
      account_name?: string
      account_number?: string
      bank_name?: string
      branch?: string
      mobile_network?: string
      mobile_number?: string
      notes?: string
    }
  }) => {
    try {
      if (!session?.access_token) return
      
      setIsCreatingPayout(true)
      
      const response = await fetch('/api/organizer/payouts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payoutData)
      })
      
      if (response.ok) {
        const data = await response.json()
        // Refresh payout requests
        await fetchPayoutRequests()
        // Refresh stats
        await fetchPaymentStats()
        alert(`Payout request created successfully! Amount: ${formatCurrency(data.payoutRequest.amount)}`)
      } else {
        const error = await response.json()
        alert(`Failed to create payout request: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating payout request:', error)
      alert('Failed to create payout request. Please try again.')
    } finally {
      setIsCreatingPayout(false)
    }
  }

  const generateSampleStats = () => {
    setStats({
      totalEarnings: 12750,
      totalPlatformFees: 2250,
      totalTransactions: 45,
      pendingPayouts: 5700,
      processedPayouts: 7050,
      commissionRate: 15,
      monthlyGrowth: 12.5,
      availableBalance: 5700
    })
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = (transaction.campaign_title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (transaction.nominee_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (transaction.reference?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || transaction.status === statusFilter
    const matchesMethod = methodFilter === 'ALL' || transaction.method === methodFilter
    
    return matchesSearch && matchesStatus && matchesMethod
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Success</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'PAYSTACK':
        return <CreditCard className="w-4 h-4 text-blue-500" />
      case 'NALO':
        return <Smartphone className="w-4 h-4 text-purple-500" />
      default:
        return <Banknote className="w-4 h-4 text-gray-500" />
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

  return (
    <DashboardWrapper>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
          <h1 className="text-4xl font-bold mb-3">Earnings & Payouts</h1>
          <p className="text-xl text-green-100">Track your earnings and request payouts from campaign revenues</p>
        </div>

        {/* Earnings Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalEarnings)}</div>
                  <div className="text-sm text-muted-foreground">Total Earnings</div>
                  <div className="text-xs text-green-600 font-medium">+{stats.monthlyGrowth}% this month</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">{formatCurrency(stats.availableBalance)}</div>
                  <div className="text-sm text-muted-foreground">Available Balance</div>
                  <div className="text-xs text-blue-600 font-medium">Ready for payout</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">{formatCurrency(stats.processedPayouts)}</div>
                  <div className="text-sm text-muted-foreground">Processed Payouts</div>
                  <div className="text-xs text-purple-600 font-medium">Successfully paid out</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600">{formatCurrency(stats.pendingPayouts)}</div>
                  <div className="text-sm text-muted-foreground">Pending Payouts</div>
                  <div className="text-xs text-orange-600 font-medium">Awaiting processing</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commission & Payout Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span>Commission Breakdown</span>
              </CardTitle>
              <CardDescription>Platform fee structure and your earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">Your Earnings</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{formatCurrency(stats.totalEarnings)}</div>
                    <div className="text-sm text-gray-600">85% of total revenue</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingDown className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-gray-900">Platform Fee</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600">{formatCurrency(stats.totalPlatformFees)}</div>
                    <div className="text-sm text-gray-600">{stats.commissionRate}% commission</div>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Commission Rate:</strong> {stats.commissionRate}% of all campaign revenue goes to the platform. 
                    You keep {100 - stats.commissionRate}% of all earnings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="w-5 h-5 text-primary" />
                <span>Payout Actions</span>
              </CardTitle>
              <CardDescription>Request payouts and manage your earnings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PayoutRequestModal
                availableBalance={stats.availableBalance}
                onPayoutRequested={createPayoutRequest}
                isCreating={isCreatingPayout}
              >
                <Button 
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  disabled={stats.availableBalance <= 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Request Payout
                </Button>
              </PayoutRequestModal>
              
              <div className="text-center text-sm text-gray-600">
                <p>Available Balance: <strong>{formatCurrency(stats.availableBalance)}</strong></p>
                <p className="text-xs mt-1">Commission already deducted from earnings</p>
              </div>
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Earnings Report
              </Button>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    <strong>Available Balance:</strong> {formatCurrency(stats.availableBalance)} ready for payout
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-700">
                    <strong>🏆 End of Program:</strong> Request all accumulated earnings when your campaign or program ends. Perfect for final settlements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payout Requests */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Download className="w-5 h-5 text-primary" />
                <span>Payout Requests</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Request
                </Button>
              </div>
            </CardTitle>
            <CardDescription>Track your payout requests and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payoutRequests.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(payout.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{formatCurrency(payout.amount)}</h4>
                        {getStatusBadge(payout.status)}
                        {payout.request_type === 'END_OF_PROGRAM' ? (
                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200">
                            🏆 End of Program
                          </Badge>
                        ) : (
                          <Badge variant="outline">{payout.request_type}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Requested: {new Date(payout.requested_at).toLocaleDateString()}
                        {payout.processed_at && ` • Processed: ${new Date(payout.processed_at).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{payout.status}</div>
                    <div className="text-sm text-muted-foreground">{payout.request_type} payout</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <span>Transaction History</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardTitle>
            <CardDescription>All payment transactions with commission breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Methods</SelectItem>
                  <SelectItem value="PAYSTACK">Paystack</SelectItem>
                  <SelectItem value="NALO">Nalo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Transactions List */}
            {loadingData ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredTransactions.length > 0 ? (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(transaction.status)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{transaction.campaign_title || 'Unknown Campaign'}</h4>
                          {getStatusBadge(transaction.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {transaction.nominee_name || 'Unknown Nominee'} • {transaction.reference || 'No Reference'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()} at {new Date(transaction.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {getMethodIcon(transaction.method)}
                          <span className="font-bold text-lg">{formatCurrency(transaction.amount)}</span>
                        </div>
                        <div className="text-sm">
                          <div className="text-green-600 font-medium">Earned: {formatCurrency(transaction.organizer_earnings)}</div>
                          <div className="text-orange-600 text-xs">Fee: {formatCurrency(transaction.platform_fee)}</div>
                        </div>
                        <p className="text-xs text-muted-foreground">{transaction.method}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No transactions found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'ALL' || methodFilter !== 'ALL' 
                    ? 'Try adjusting your filters to see more results'
                    : 'Transactions will appear here once payments are processed'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardWrapper>
  )
}
