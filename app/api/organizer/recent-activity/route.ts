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
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get organizer's campaigns
    console.log('Fetching campaigns for user:', user.id)
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, title, created_at')
      .eq('organizer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError)
      return NextResponse.json({ 
        error: 'Failed to fetch campaigns',
        details: campaignsError.message 
      }, { status: 500 })
    }

    const campaignIds = campaigns?.map((c: any) => c.id) || []
    console.log('Found campaigns:', campaigns?.length || 0, 'Campaign IDs:', campaignIds)

    // Get recent votes (only if we have campaigns)
    let recentVotes = []
    if (campaignIds.length > 0) {
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select(`
          id,
          amount,
          status,
          created_at,
          campaign_id
        `)
        .in('campaign_id', campaignIds)
        .eq('status', 'SUCCESS')
        .order('created_at', { ascending: false })
        .limit(10)

      if (votesError) {
        console.error('Error fetching votes:', votesError)
        // Don't return error, just continue without votes
      } else {
        recentVotes = votes || []
      }
    }
    console.log('Found votes:', recentVotes?.length || 0)

    // Get recent payout requests
    let recentPayouts = []
    const { data: payouts, error: payoutsError } = await supabase
      .from('payout_requests')
      .select(`
        id,
        amount,
        status,
        created_at,
        type
      `)
      .eq('organizer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (payoutsError) {
      console.error('Error fetching payouts:', payoutsError)
      // Don't return error, just continue without payouts
    } else {
      recentPayouts = payouts || []
    }
    console.log('Found payouts:', recentPayouts?.length || 0)

    // Combine and format activities
    const activities: any[] = []

    // Add campaign creation activities
    campaigns?.forEach((campaign: any) => {
      activities.push({
        id: `campaign-${campaign.id}`,
        type: 'campaign_created',
        title: 'New campaign created',
        description: campaign.title,
        timestamp: campaign.created_at,
        icon: 'campaign',
        color: 'green'
      })
    })

    // Add vote activities (grouped by time)
    const voteGroups = new Map()
    recentVotes?.forEach((vote: any) => {
      const date = new Date(vote.created_at).toDateString()
      if (!voteGroups.has(date)) {
        voteGroups.set(date, {
          count: 0,
          totalAmount: 0,
          campaigns: new Set()
        })
      }
      const group = voteGroups.get(date)
      group.count += Math.floor((vote.amount || 0) / 100) // Convert to vote count
      group.totalAmount += vote.amount || 0
      // Find campaign title from the campaigns we already fetched
      const campaign = campaigns?.find((c: any) => c.id === vote.campaign_id)
      group.campaigns.add(campaign?.title || 'Unknown Campaign')
    })

    voteGroups.forEach((group, date) => {
      activities.push({
        id: `votes-${date}`,
        type: 'votes_received',
        title: `${group.count} new votes received`,
        description: `Across ${group.campaigns.size} campaigns`,
        timestamp: new Date(date).toISOString(),
        icon: 'votes',
        color: 'blue',
        amount: group.totalAmount
      })
    })

    // Add payout activities
    recentPayouts?.forEach((payout: any) => {
      activities.push({
        id: `payout-${payout.id}`,
        type: 'payout_requested',
        title: `${payout.request_type} payout requested`,
        description: `₵${(payout.amount / 100).toString()}`,
        timestamp: payout.created_at,
        icon: 'payout',
        color: 'purple',
        status: payout.status
      })
    })

    // Sort by timestamp (most recent first) and limit to 10
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    console.log('Returning activities:', sortedActivities.length)
    return NextResponse.json({
      activities: sortedActivities
    })

  } catch (error) {
    console.error('Error in recent activity API:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
