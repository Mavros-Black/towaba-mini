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
        { status: 401 }
      )
    }

    // Fetch campaigns for the current user only
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        organizer:users!campaigns_organizer_id_fkey(name)
      `)
      .eq('organizer_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching campaigns:', error)
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      )
    }

    // Fetch counts for each campaign
    const campaignsWithCounts = await Promise.all(
      campaigns?.map(async (campaign) => {
        // Get categories count
        const { count: categoriesCount } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id)

        // Get nominees count
        const { count: nomineesCount } = await supabase
          .from('nominees')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id)

        // Get total vote count (sum of vote amounts based on payments)
        const { data: votes, error: votesError } = await supabase
          .from('votes')
          .select('amount')
          .eq('status', 'SUCCESS')
          .eq('campaign_id', campaign.id)

        if (votesError) {
          console.error(`Error fetching votes for campaign ${campaign.id}:`, votesError)
        }

        // Calculate total votes based on amount paid (amount in pesewas / 100 = votes)
        const totalVoteCount = votes?.reduce((sum, vote) => sum + Math.floor((vote.amount || 0) / 100), 0) || 0

        return {
          ...campaign,
          _count: {
            categories: categoriesCount || 0,
            nominees: nomineesCount || 0,
            voters: totalVoteCount
          }
        }
      }) || []
    )

    return NextResponse.json({
      campaigns: campaignsWithCounts,
      total: campaignsWithCounts.length
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
