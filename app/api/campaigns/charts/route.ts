import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    // Get the current user from the request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid authentication token' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid authentication token' },
        { status: 500 }
      )
    }

    console.log('Authenticated user ID:', user.id)

    // Get user's campaign IDs first
    const { data: userCampaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('organizer_id', user.id)

    if (campaignsError) {
      console.error('Error fetching user campaigns:', campaignsError)
      return NextResponse.json(
        { error: 'Failed to fetch user campaigns' },
        { status: 500 }
      )
    }

    const campaignIds = userCampaigns?.map(c => c.id) || []
    
    // If user has no campaigns, return empty data
    if (campaignIds.length === 0) {
      return NextResponse.json({
        chartData: [],
        pieData: [],
        areaData: []
      })
    }
    
    // Get the last 6 months of data
    const months = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        name: date.toLocaleDateString('en-US', { month: 'short' }),
        startDate: date.toISOString(),
        endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString()
      })
    }

    // Fetch data for each month
    const chartData = await Promise.all(
      months.map(async (month) => {
        // Votes for this month (sum of nominee vote counts) from the current user's campaigns only
        const { data: nominees, error: nomineesError } = await supabase
          .from('nominees')
          .select('votes_count')
          .in('campaign_id', campaignIds)
          .gte('created_at', month.startDate)
          .lt('created_at', month.endDate)

        if (nomineesError) {
          console.error(`Error fetching nominees for ${month.name}:`, nomineesError)
        }

        const votes = nominees?.reduce((sum, nominee) => sum + (nominee.votes_count || 0), 0) || 0

        // Revenue for this month (successful payments) from the current user's campaigns only
        const { data: payments, error: paymentsError } = await supabase
          .from('payments')
          .select('amount, status')
          .eq('status', 'SUCCESS')
          .in('campaign_id', campaignIds)
          .gte('created_at', month.startDate)
          .lt('created_at', month.endDate)

        if (paymentsError) {
          console.error(`Error fetching payments for ${month.name}:`, paymentsError)
        }

        const revenue = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0

        // Campaigns created this month by the current user only
        const { count: campaigns, error: campaignsError } = await supabase
          .from('campaigns')
          .select('*', { count: 'exact', head: true })
          .eq('organizer_id', user.id)
          .gte('created_at', month.startDate)
          .lt('created_at', month.endDate)

        if (campaignsError) {
          console.error(`Error fetching campaigns for ${month.name}:`, campaignsError)
        }

        return {
          name: month.name,
          votes: votes || 0,
          revenue: revenue,
          campaigns: campaigns || 0
        }
      })
    )

    // Get pie chart data (top 5 campaigns by total vote counts) for the current user only
    const { data: topCampaigns, error: pieError } = await supabase
      .from('campaigns')
      .select(`
        id,
        title,
        nominees!inner(votes_count)
      `)
      .eq('organizer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (pieError) {
      console.error('Error fetching top campaigns:', pieError)
    }

    const pieData = topCampaigns?.map((campaign, index) => {
      const totalVotes = campaign.nominees?.reduce((sum, nominee) => sum + (nominee.votes_count || 0), 0) || 0
      return {
        name: campaign.title.length > 15 ? campaign.title.substring(0, 15) + '...' : campaign.title,
        value: totalVotes,
        color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
      }
    }) || []

    // If no real data, provide some sample data
    if (pieData.length === 0) {
      pieData.push(
        { name: 'Sample Campaign 1', value: 150, color: '#3B82F6' },
        { name: 'Sample Campaign 2', value: 120, color: '#10B981' },
        { name: 'Sample Campaign 3', value: 80, color: '#F59E0B' }
      )
    }

    return NextResponse.json({
      chartData,
      pieData,
      areaData: chartData // Use same data for area chart
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
