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

    const campaignIds = userCampaigns?.map((c: any) => c.id) || []
    
    if (campaignIds.length === 0) {
      return NextResponse.json({
        transactions: [],
        total: 0
      })
    }

    // Fetch successful votes/payments for the user's campaigns only
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
        nominees(name),
        campaigns(title)
      `)
      .in('campaign_id', campaignIds)
      .eq('status', 'SUCCESS')
      .order('created_at', { ascending: false })

    if (votesError) {
      console.error('Error fetching votes:', votesError)
      return NextResponse.json(
        { error: 'Failed to fetch votes' },
        { status: 500 }
      )
    }

    // Debug: Log the structure of the first vote to understand the data format
    if (votes && votes.length > 0) {
      console.log('Sample vote data structure:', JSON.stringify(votes[0], null, 2))
    }

    // Transform the data to match the Transaction interface with commission breakdown
    const transactions = votes?.map((vote: any) => {
      const amount = vote.amount || 0
      const platformFee = Math.floor(amount * 0.15) // 15% platform fee
      const organizerEarnings = amount - platformFee // 85% to organizer
      
      return {
        id: vote.id,
        reference: vote.reference || `VOTE-${vote.id.slice(0, 8)}`,
        campaign_id: vote.campaign_id,
        nominee_id: vote.nominee_id,
        amount: amount,
        platform_fee: platformFee,
        organizer_earnings: organizerEarnings,
        status: vote.status,
        method: 'PAYSTACK', // Default method since votes table doesn't have method column
        voter_name: vote.voter_name || 'Anonymous',
        created_at: vote.created_at,
        updated_at: vote.created_at,
        campaign_title: vote.campaigns?.title || 'Unknown Campaign',
        nominee_name: vote.nominees?.name || 'Unknown Nominee'
      }
    }) || []

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
