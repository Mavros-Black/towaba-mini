import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get organizer's campaigns
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, title, created_at, end_date')
      .eq('organizer_id', user.id)

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError)
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
    }

    const campaignIds = campaigns?.map((c: any) => c.id) || []

    if (campaignIds.length === 0) {
      return NextResponse.json({
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalVotes: 0,
        totalRevenue: 0,
        totalEarnings: 0,
        campaignPerformance: [],
        monthlyStats: [],
        topNominees: []
      })
    }

    // Get successful votes for organizer's campaigns only
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select(`
        id,
        amount,
        status,
        created_at,
        campaign_id,
        nominee_id,
        nominees(name),
        campaigns(title)
      `)
      .in('campaign_id', campaignIds)
      .eq('status', 'SUCCESS')

    if (votesError) {
      console.error('Error fetching votes:', votesError)
      return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 })
    }

    // Calculate basic stats
    const totalVotes = votes?.reduce((sum: number, v: any) => sum + Math.floor((v.amount || 0) / 100), 0) || 0
    const totalRevenue = votes?.reduce((sum: number, v: any) => sum + (v.amount || 0), 0) || 0
    const totalEarnings = Math.floor(totalRevenue * 0.85) // 85% to organizer
    const activeCampaigns = campaigns?.filter((c: any) => {
      const endDate = new Date(c.end_date)
      return endDate > new Date()
    }).length || 0

    // Campaign performance
    const campaignPerformance = campaigns?.map((campaign: any) => {
      const campaignVotes = votes?.filter((v: any) => v.campaign_id === campaign.id) || []
      const campaignRevenue = campaignVotes.reduce((sum: number, v: any) => sum + (v.amount || 0), 0)
      const campaignEarnings = Math.floor(campaignRevenue * 0.85)
      
      return {
        id: campaign.id,
        title: campaign.title,
        totalVotes: campaignVotes.reduce((sum: number, v: any) => sum + Math.floor((v.amount || 0) / 100), 0),
        totalRevenue: campaignRevenue,
        totalEarnings: campaignEarnings,
        created_at: campaign.created_at,
        end_date: campaign.end_date
      }
    }) || []

    // Monthly stats for the last 6 months
    const monthlyStats = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      const monthVotes = votes?.filter((v: any) => {
        const voteDate = new Date(v.created_at)
        return voteDate >= monthStart && voteDate <= monthEnd
      }) || []
      
      const monthRevenue = monthVotes.reduce((sum: number, v: any) => sum + (v.amount || 0), 0)
      const monthEarnings = Math.floor(monthRevenue * 0.85)
      
      monthlyStats.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        votes: monthVotes.reduce((sum: number, v: any) => sum + Math.floor((v.amount || 0) / 100), 0),
        revenue: monthRevenue,
        earnings: monthEarnings
      })
    }

    // Top nominees across all campaigns
    const nomineeStats = new Map()
    votes?.forEach((vote: any) => {
      const nomineeName = vote.nominees?.name || 'Unknown'
      if (!nomineeStats.has(nomineeName)) {
        nomineeStats.set(nomineeName, { name: nomineeName, votes: 0, revenue: 0 })
      }
      const stats = nomineeStats.get(nomineeName)
      stats.votes += Math.floor((vote.amount || 0) / 100)
      stats.revenue += vote.amount || 0
    })

    const topNominees = Array.from(nomineeStats.values())
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 10)

    return NextResponse.json({
      totalCampaigns: campaigns?.length || 0,
      activeCampaigns,
      totalVotes,
      totalRevenue,
      totalEarnings,
      campaignPerformance,
      monthlyStats,
      topNominees
    })

  } catch (error) {
    console.error('Error in analytics API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
