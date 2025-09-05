'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Trophy,
  BarChart3,
  Download,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface PeriodData {
  id: string
  period_number: number
  start_date: string
  end_date: string
  total_votes: number
  total_revenue: number
  total_voters: number
  status: string
  winner_nominee_id?: string
  winner_votes?: number
}

interface NomineeStats {
  nominee_id: string
  nominee_name: string
  total_votes: number
  total_revenue: number
  rank: number
  percentage: number
}

interface CampaignPeriodsData {
  campaign: {
    id: string
    title: string
    voting_period_type: string
    reset_frequency: string
  }
  current_period: PeriodData | null
  historical_periods: PeriodData[]
  period_summaries: Record<string, NomineeStats[]>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function CampaignPeriodsPage() {
  const params = useParams()
  const campaignId = params.id as string
  
  const [data, setData] = useState<CampaignPeriodsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodData | null>(null)

  useEffect(() => {
    fetchPeriodsData()
  }, [campaignId])

  const fetchPeriodsData = async () => {
    try {
      const response = await fetch(`/api/organizer/campaigns/${campaignId}/periods`)
      if (!response.ok) throw new Error('Failed to fetch periods data')
      
      const result = await response.json()
      setData(result)
      if (result.historical_periods.length > 0) {
        setSelectedPeriod(result.historical_periods[0])
      }
    } catch (error) {
      console.error('Error fetching periods data:', error)
      toast.error('Failed to load periods data')
    } finally {
      setLoading(false)
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
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPeriodDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Prepare chart data
  const prepareChartData = () => {
    if (!data?.historical_periods) return []

    return data.historical_periods.map(period => ({
      period: `Period ${period.period_number}`,
      votes: period.total_votes,
      revenue: period.total_revenue / 100, // Convert to GHS
      voters: period.total_voters,
      duration: getPeriodDuration(period.start_date, period.end_date)
    }))
  }

  const prepareNomineeChartData = (periodId: string) => {
    const summaries = data?.period_summaries[periodId] || []
    return summaries.map(summary => ({
      name: summary.nominee_name,
      votes: summary.total_votes,
      revenue: summary.total_revenue / 100,
      percentage: summary.percentage
    }))
  }

  const exportPeriodData = (period: PeriodData) => {
    const summaries = data?.period_summaries[period.id] || []
    const csvData = [
      ['Nominee', 'Votes', 'Revenue (GHS)', 'Rank', 'Percentage'],
      ...summaries.map(s => [
        s.nominee_name,
        s.total_votes.toString(),
        (s.total_revenue / 100).toString(),
        s.rank.toString(),
        `${s.percentage.toFixed(2)}%`
      ])
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `period-${period.period_number}-results.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Failed to load periods data</h1>
          <p className="text-gray-600 mt-2">Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  const chartData = prepareChartData()

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/organizer/campaigns/${campaignId}/view`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaign
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Voting Periods</h1>
            <p className="text-gray-600">{data.campaign.title}</p>
          </div>
        </div>
        <Badge variant="outline">
          {data.campaign.reset_frequency} Reset
        </Badge>
      </div>

      {/* Current Period */}
      {data.current_period && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Current Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Total Votes</p>
                  <p className="text-2xl font-bold">{data.current_period.total_votes}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.current_period.total_revenue)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Voters</p>
                  <p className="text-2xl font-bold">{data.current_period.total_voters}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Period #{data.current_period.period_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(data.current_period.start_date)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="periods">Historical Periods</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Period Comparison Chart */}
          {chartData.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Period Performance Comparison</CardTitle>
                <CardDescription>
                  Compare voting performance across different periods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any, name: any) => [
                          name === 'revenue' ? formatCurrency((value as number) * 100) : value,
                          name === 'votes' ? 'Votes' : name === 'revenue' ? 'Revenue' : 'Voters'
                        ]}
                      />
                      <Line type="monotone" dataKey="votes" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="voters" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Revenue Chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Period</CardTitle>
                <CardDescription>
                  Total revenue generated in each voting period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any) => [formatCurrency((value as number) * 100), 'Revenue']}
                      />
                      <Bar dataKey="revenue" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="periods" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Periods List */}
            <Card>
              <CardHeader>
                <CardTitle>Historical Periods</CardTitle>
                <CardDescription>
                  Click on a period to view detailed results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.historical_periods.map((period) => (
                    <div 
                      key={period.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPeriod?.id === period.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedPeriod(period)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Period #{period.period_number}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(period.start_date)} - {formatDate(period.end_date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{period.total_votes} votes</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(period.total_revenue)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selected Period Details */}
            {selectedPeriod && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Period #{selectedPeriod.period_number} Results</CardTitle>
                      <CardDescription>
                        {formatDateTime(selectedPeriod.start_date)} - {formatDateTime(selectedPeriod.end_date)}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportPeriodData(selectedPeriod)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Period Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{selectedPeriod.total_votes}</p>
                        <p className="text-sm text-blue-600">Total Votes</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(selectedPeriod.total_revenue)}
                        </p>
                        <p className="text-sm text-green-600">Revenue</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{selectedPeriod.total_voters}</p>
                        <p className="text-sm text-purple-600">Voters</p>
                      </div>
                    </div>

                    {/* Nominee Results */}
                    <div>
                      <h4 className="font-medium mb-3">Nominee Performance</h4>
                      <div className="space-y-2">
                        {data.period_summaries[selectedPeriod.id]?.map((nominee, index) => (
                          <div key={nominee.nominee_id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                index === 0 ? 'bg-yellow-500' : 
                                index === 1 ? 'bg-gray-400' : 
                                index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{nominee.nominee_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {nominee.total_votes} votes ({nominee.percentage.toFixed(1)}%)
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(nominee.total_revenue)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Selected Period Nominee Chart */}
          {selectedPeriod && data.period_summaries[selectedPeriod.id] && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vote Distribution</CardTitle>
                  <CardDescription>
                    How votes were distributed among nominees
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={prepareNomineeChartData(selectedPeriod.id)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="votes"
                        >
                          {prepareNomineeChartData(selectedPeriod.id).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Nominee</CardTitle>
                  <CardDescription>
                    Revenue generated by each nominee
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prepareNomineeChartData(selectedPeriod.id)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: any) => [formatCurrency((value as number) * 100), 'Revenue']}
                        />
                        <Bar dataKey="revenue" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
