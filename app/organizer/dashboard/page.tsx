"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Award, Calendar, TrendingUp, Loader2, FolderOpen, Target, DollarSign, BarChart3, PieChart, Activity, CreditCard, Shield } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { DashboardWrapper } from '@/components/dashboard-wrapper'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'

interface Campaign {
  id: string
  title: string
  description: string | null
  created_at: string
  status: string
  _count: {
    categories: number
    nominees: number
    voters: number
  }
}



interface ChartData {
  name: string
  votes: number
  revenue: number
  campaigns: number
}

interface PieData {
  name: string
  value: number
  color: string
}

export default function DashboardPage() {
  const { user, session, loading } = useAuth()
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalNominees: 0,
    totalVotes: 0,
    totalRevenue: 0,
    monthlyGrowth: 0
  })
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [pieData, setPieData] = useState<PieData[]>([])
  const [areaData, setAreaData] = useState<ChartData[]>([])
  const [chartsLoading, setChartsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (session?.access_token) {
      fetchCampaigns()
      fetchStats()
      fetchChartData()
    }
  }, [session])

  const fetchCampaigns = async () => {
    try {
      if (!session?.access_token) return
      
      const response = await fetch('/api/campaigns', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns?.slice(0, 5) || [])
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    }
  }

  const fetchStats = async () => {
    try {
      if (!session?.access_token) return
      
      const response = await fetch('/api/campaigns/stats', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
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
        setChartData(data.chartData)
        setPieData(data.pieData)
        setAreaData(data.areaData)
      } else {
        generateChartData()
      }
    } catch (error) {
      console.error('Error fetching chart data:', error)
      generateChartData()
    } finally {
      setChartsLoading(false)
    }
  }

  const generateChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const votesData = months.map((month, index) => ({
      name: month,
      votes: Math.floor(Math.random() * 500) + 100,
      revenue: Math.floor(Math.random() * 100) + 20,
      campaigns: Math.floor(Math.random() * 10) + 1
    }))
    
    setChartData(votesData)

    const pieChartData = campaigns.length > 0 ? campaigns.slice(0, 5).map((campaign, index) => ({
      name: (campaign.title || 'Untitled').length > 15 ? (campaign.title || 'Untitled').substring(0, 15) + '...' : (campaign.title || 'Untitled'),
      value: campaign._count?.voters || Math.floor(Math.random() * 100) + 10,
      color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
    })) : [
      { name: 'Sample Campaign 1', value: 150, color: '#3B82F6' },
      { name: 'Sample Campaign 2', value: 120, color: '#10B981' },
      { name: 'Sample Campaign 3', value: 80, color: '#F59E0B' }
    ]
    
    setPieData(pieChartData)

    const areaChartData = months.map((month, index) => ({
      name: month,
      votes: Math.floor(Math.random() * 300) + 50,
      revenue: Math.floor(Math.random() * 60) + 10,
      campaigns: Math.floor(Math.random() * 8) + 1
    }))
    
    setAreaData(areaChartData)
  }



  useEffect(() => {
    if (campaigns.length > 0) {
      generateChartData()
    }
  }, [campaigns])

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
        {/* Enhanced Header */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h1 className="text-4xl font-bold mb-3">Welcome back, {user?.email?.split('@')[0] || 'User'}</h1>
          <p className="text-xl text-blue-100">Your voting campaigns overview</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                  <div className="text-3xl font-bold text-blue-600">{stats.totalCampaigns}</div>
                  <div className="text-sm text-muted-foreground">Total Campaigns</div>
                  <div className="text-xs text-green-600 font-medium">+{stats.monthlyGrowth}% this month</div>
                </div>
            </div>
          </CardContent>
        </Card>


          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                  <div className="text-3xl font-bold text-purple-600">{stats.totalNominees}</div>
                  <div className="text-sm text-muted-foreground">Total Nominees</div>
                  <div className="text-xs text-green-600 font-medium">Across all campaigns</div>
                </div>
            </div>
          </CardContent>
        </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                  <div className="text-3xl font-bold text-orange-600">{stats.totalVotes}</div>
                  <div className="text-sm text-muted-foreground">Total Votes</div>
                  <div className="text-xs text-green-600 font-medium">All time</div>
                </div>
            </div>
          </CardContent>
        </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
      </div>
              <div>
                  <div className="text-3xl font-bold text-yellow-600">₵{(stats.totalRevenue / 100).toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                  <div className="text-xs text-green-600 font-medium">+8% from last month</div>
                </div>
              </div>
            </CardContent>
          </Card>


            </div>
            
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Votes & Revenue Bar Chart */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span>Votes & Revenue Trends</span>
              </CardTitle>
              <CardDescription>Monthly performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              {chartsLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'votes' ? `${value} votes` : `₵${((value as number) / 100).toFixed(2)}`,
                        name === 'votes' ? 'Votes' : 'Revenue'
                      ]}
                    />
                    <Bar yAxisId="left" dataKey="votes" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{stats.totalVotes}</div>
                  <div className="text-sm text-blue-600">Total Votes</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">₵{(stats.totalRevenue / 100).toFixed(2)}</div>
                  <div className="text-sm text-green-600">Total Revenue</div>
                </div>
            </div>
          </CardContent>
        </Card>

          {/* Campaign Performance Pie Chart */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-primary" />
                <span>Campaign Performance</span>
              </CardTitle>
              <CardDescription>Votes distribution across campaigns</CardDescription>
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
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}-${entry.name}`} fill={entry.color || '#8884d8'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} votes`, name]} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              )}
              <div className="space-y-2 mt-4">
                {pieData.map((item, index) => (
                  <div key={`pie-${index}-${item.name}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm font-medium truncate max-w-[120px]">{item.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{item.value} votes</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Area Chart for Trends */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Growth Trends</span>
            </CardTitle>
            <CardDescription>Monthly growth patterns for votes, revenue, and campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            {chartsLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={areaData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'votes' ? `${value} votes` : name === 'revenue' ? `₵${((value as number) / 100).toFixed(2)}` : `${value} campaigns`,
                      name === 'votes' ? 'Votes' : name === 'revenue' ? 'Revenue' : 'Campaigns'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="votes" 
                    stackId="1" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.6} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stackId="2" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="campaigns" 
                    stackId="3" 
                    stroke="#F59E0B" 
                    fill="#F59E0B" 
                    fillOpacity={0.6} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">Votes</div>
                <div className="text-sm text-blue-600">Monthly trend</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">Revenue</div>
                <div className="text-sm text-green-600">Monthly trend</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">Campaigns</div>
                <div className="text-sm text-yellow-600">Monthly trend</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Quick Actions */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/organizer/campaigns/create">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Campaign
                </Button>
              </Link>
              <Link href="/organizer/campaigns">
                <Button variant="outline" className="w-full border-2 hover:bg-gray-50" size="lg">
                  View All Campaigns
                </Button>
              </Link>
              <Link href="/organizer/analytics">
                <Button variant="outline" className="w-full border-2 hover:bg-gray-50" size="lg">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-primary" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>Latest updates and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New campaign created</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">50 new votes received</p>
                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Payment processed</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
              </div>
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Recent Campaigns */}
        {campaigns.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span>Recent Campaigns</span>
                </div>
                <Link href="/organizer/campaigns">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </CardTitle>
              <CardDescription>Your latest voting campaigns with protection status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold text-lg">{campaign.title}</h4>
                        <Badge 
                          variant={campaign.status === 'ACTIVE' ? 'default' : 
                                  campaign.status === 'DRAFT' ? 'secondary' : 
                                  campaign.status === 'SCHEDULED' ? 'outline' : 'destructive'}
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {campaign.description || 'No description'}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span>{campaign._count?.nominees || 0} nominees</span>
                        <span>{campaign._count?.voters || 0} votes</span>
                        <span>{campaign._count?.categories || 0} categories</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/organizer/campaigns/${campaign.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/organizer/campaigns/${campaign.id}/protection`}>
                        <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                          <Shield className="w-4 h-4 mr-1" />
                          Protection
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {campaigns.length === 0 && (
          <Card className="text-center py-12 shadow-lg">
            <CardContent>
              <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first voting campaign to get started
              </p>
              <Link href="/organizer/campaigns/create">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Campaign
              </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardWrapper>
  )
}