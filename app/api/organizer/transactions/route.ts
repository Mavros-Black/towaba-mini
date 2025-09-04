import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user from the request
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Get user's campaign IDs first
    const { data: userCampaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, title')
      .eq('organizer_id', user.id)

    if (campaignsError) {
      console.error('Error fetching user campaigns:', campaignsError)
      return NextResponse.json(
        { error: 'Failed to fetch user campaigns' },
        { status: 500 }
      )
    }

    const campaignIds = userCampaigns?.map(c => c.id) || []
    
    if (campaignIds.length === 0) {
      return NextResponse.json({
        transactions: [],
        total: 0
      })
    }

    // Fetch all votes/payments for the user's campaigns
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select(`
        id,
        reference,
        campaign_id,
        nominee_id,
        amount,
        status,
        voter_name,
        created_at,
        nominees!inner(name),
        campaigns!inner(title)
      `)
      .in('campaign_id', campaignIds)
      .order('created_at', { ascending: false })

    if (votesError) {
      console.error('Error fetching votes:', votesError)
      return NextResponse.json(
        { error: 'Failed to fetch votes' },
        { status: 500 }
      )
    }

    // Transform the data to match the Transaction interface
    const transactions = votes?.map(vote => ({
      id: vote.id,
      reference: vote.reference || `VOTE-${vote.id.slice(0, 8)}`,
      campaign_id: vote.campaign_id,
      nominee_id: vote.nominee_id,
      amount: vote.amount,
      status: vote.status,
      method: 'PAYSTACK', // Default method since votes table doesn't have method column
      voter_name: vote.voter_name || 'Anonymous',
      created_at: vote.created_at,
      campaign_title: vote.campaigns?.[0]?.title,
      nominee_name: vote.nominees?.[0]?.name
    })) || []

    return NextResponse.json({
      transactions,
      total: transactions.length
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
