import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

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
        { status: 401 }
      )
    }

    console.log('Authenticated user ID:', user.id)

    // Total campaigns for the current user only
    const { count: totalCampaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('organizer_id', user.id)

    if (campaignsError) {
      console.error('Error fetching campaigns count:', campaignsError)
      return NextResponse.json(
        { error: 'Failed to fetch campaigns count' },
        { status: 500 }
      )
    }

    // Active campaigns (created in last 30 days) for the current user only
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { count: activeCampaigns, error: activeError } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('organizer_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (activeError) {
      console.error('Error fetching active campaigns count:', activeError)
      return NextResponse.json(
        { error: 'Failed to fetch active campaigns count' },
        { status: 500 }
      )
    }

    // Total nominees from the current user's campaigns only
    const { data: userCampaigns, error: userCampaignsError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('organizer_id', user.id)

    if (userCampaignsError) {
      console.error('Error fetching user campaigns:', userCampaignsError)
      return NextResponse.json(
        { error: 'Failed to fetch user campaigns' },
        { status: 500 }
      )
    }

    const campaignIds = userCampaigns?.map((c: any) => c.id) || []
    
    // If user has no campaigns, return zero counts
    if (campaignIds.length === 0) {
      return NextResponse.json({
        totalCampaigns: 0,
        totalNominees: 0,
        activeCampaigns: 0,
        totalVotes: 0,
        totalRevenue: 0,
        monthlyGrowth: 0
      })
    }
    
    const { count: totalNominees, error: nomineesError } = await supabase
      .from('nominees')
      .select('*', { count: 'exact', head: true })
      .in('campaign_id', campaignIds)

    if (nomineesError) {
      console.error('Error fetching nominees count:', nomineesError)
      return NextResponse.json(
        { error: 'Failed to fetch nominees count' },
        { status: 500 }
      )
    }

    // Total votes (sum of vote amounts based on payments) from the current user's campaigns only
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('amount')
      .eq('status', 'SUCCESS')
      .in('campaign_id', campaignIds)

    if (votesError) {
      console.error('Error fetching votes:', votesError)
      return NextResponse.json(
        { error: 'Failed to fetch votes' },
        { status: 500 }
      )
    }

    // Calculate total votes based on amount paid (amount in pesewas / 100 = votes)
    const totalVotes = votes?.reduce((sum: number, vote: any) => sum + Math.floor((vote.amount || 0) / 100), 0) || 0

    console.log('Total votes count (based on amounts):', totalVotes)
    console.log('Campaign IDs for vote counting:', campaignIds)

    // Total revenue (sum of all successful vote amounts) from the current user's campaigns only
    const { data: revenueVotes, error: revenueError } = await supabase
      .from('votes')
      .select('amount')
      .eq('status', 'SUCCESS')
      .in('campaign_id', campaignIds)

    if (revenueError) {
      console.error('Error fetching revenue votes:', revenueError)
      return NextResponse.json(
        { error: 'Failed to fetch revenue data' },
        { status: 500 }
      )
    }

    const totalRevenue = revenueVotes?.reduce((sum: number, vote: any) => sum + (vote.amount || 0), 0) || 0

    // Monthly growth (campaigns created this month vs last month)
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    
    const { count: thisMonthCampaigns, error: thisMonthError } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('organizer_id', user.id)
      .gte('created_at', thisMonth.toISOString())

    const { count: lastMonthCampaigns, error: lastMonthError } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('organizer_id', user.id)
      .gte('created_at', lastMonth.toISOString())
      .lt('created_at', thisMonth.toISOString())

    if (thisMonthError || lastMonthError) {
      console.error('Error fetching monthly campaigns:', thisMonthError || lastMonthError)
      return NextResponse.json(
        { error: 'Failed to fetch monthly campaigns' },
        { status: 500 }
      )
    }

    const monthlyGrowth = (lastMonthCampaigns || 0) > 0 
      ? Math.round(((thisMonthCampaigns || 0) - (lastMonthCampaigns || 0)) / (lastMonthCampaigns || 1) * 100)
      : 0

    return NextResponse.json({
      totalCampaigns: totalCampaigns || 0,
      totalNominees: totalNominees || 0,
      activeCampaigns: activeCampaigns || 0,
      totalVotes: totalVotes || 0,
      totalRevenue: totalRevenue,
      monthlyGrowth: monthlyGrowth
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
