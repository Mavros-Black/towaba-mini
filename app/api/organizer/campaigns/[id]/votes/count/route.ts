import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

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

    // First verify the user owns this campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, organizer_id')
      .eq('id', campaignId)
      .eq('organizer_id', user.id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found or access denied' }, { status: 404 })
    }

    // Get total vote count for this campaign based on amounts paid
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('amount')
      .eq('campaign_id', campaignId)
      .eq('status', 'SUCCESS')

    if (votesError) {
      console.error('Error fetching votes:', votesError)
      return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 })
    }

    // Calculate total votes based on amount paid (amount in pesewas / 100 = votes)
    const totalVotes = votes?.reduce((sum: number, vote: any) => sum + Math.floor((vote.amount || 0) / 100), 0) || 0

    return NextResponse.json({
      totalVotes: totalVotes
    })

  } catch (error) {
    console.error('Error in vote count API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
