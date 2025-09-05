import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Verify the token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaignId = params.id

    // Verify campaign ownership
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        id,
        title,
        voting_period_type,
        reset_frequency
      `)
      .eq('id', campaignId)
      .eq('organizer_id', user.id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Get all periods for this campaign
    const { data: periods, error: periodsError } = await supabase
      .from('voting_periods')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('period_number', { ascending: false })

    if (periodsError) {
      console.error('Error fetching periods:', periodsError)
      return NextResponse.json({ error: 'Failed to fetch periods' }, { status: 500 })
    }

    // Separate current and historical periods
    const currentPeriod = periods?.find((p: any) => p.status === 'active') || null
    const historicalPeriods = periods?.filter((p: any) => p.status === 'completed') || []

    // Get period summaries for all periods
    const periodSummaries: Record<string, any[]> = {}

    for (const period of periods || []) {
      const { data: summaries, error: summaryError } = await supabase
        .from('period_vote_summary')
        .select(`
          nominee_id,
          total_votes,
          total_revenue,
          rank,
          percentage,
          nominees!inner(name)
        `)
        .eq('period_id', period.id)
        .order('rank', { ascending: true })

      if (!summaryError && summaries) {
        periodSummaries[period.id] = summaries.map((summary: any) => ({
          nominee_id: summary.nominee_id,
          nominee_name: summary.nominees.name,
          total_votes: summary.total_votes,
          total_revenue: summary.total_revenue,
          rank: summary.rank,
          percentage: summary.percentage
        }))
      }
    }

    // If no period summaries exist, calculate them from votes
    if (Object.keys(periodSummaries).length === 0) {
      for (const period of periods || []) {
        const { data: votes, error: votesError } = await supabase
          .from('votes')
          .select(`
            nominee_id,
            amount,
            nominees!inner(name)
          `)
          .eq('voting_period_id', period.id)

        if (!votesError && votes) {
          // Calculate nominee stats
          const nomineeStats: Record<string, any> = {}
          
          votes.forEach((vote: any) => {
            const nomineeId = vote.nominee_id
            if (!nomineeStats[nomineeId]) {
              nomineeStats[nomineeId] = {
                nominee_id: nomineeId,
                nominee_name: vote.nominees.name,
                total_votes: 0,
                total_revenue: 0
              }
            }
            nomineeStats[nomineeId].total_votes += 1
            nomineeStats[nomineeId].total_revenue += vote.amount || 0
          })

          // Calculate percentages and ranks
          const totalVotes = votes.length
          const sortedNominees = Object.values(nomineeStats)
            .map((nominee: any) => ({
              ...nominee,
              percentage: totalVotes > 0 ? (nominee.total_votes / totalVotes) * 100 : 0
            }))
            .sort((a: any, b: any) => b.total_votes - a.total_votes)
            .map((nominee: any, index: number) => ({
              ...nominee,
              rank: index + 1
            }))

          periodSummaries[period.id] = sortedNominees
        }
      }
    }

    return NextResponse.json({
      campaign,
      current_period: currentPeriod,
      historical_periods: historicalPeriods,
      period_summaries: periodSummaries
    })

  } catch (error) {
    console.error('Error fetching periods data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
