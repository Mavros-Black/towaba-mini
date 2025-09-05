import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function POST(
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
        organizer_id,
        reset_frequency,
        auto_reset_enabled,
        next_auto_reset,
        current_period_start,
        current_period_end,
        custom_reset_days
      `)
      .eq('id', campaignId)
      .eq('organizer_id', user.id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (!campaign.auto_reset_enabled) {
      return NextResponse.json({ 
        error: 'Auto-reset is not enabled for this campaign' 
      }, { status: 400 })
    }

    // Simulate the auto-reset process
    const now = new Date()
    console.log(`[TEST-AUTO-RESET] Testing auto-reset for campaign: ${campaign.title}`)

    // Get current period stats
    const { data: currentVotes, error: votesError } = await supabase
      .from('votes')
      .select(`
        id,
        amount,
        voter_phone,
        nominee_id,
        nominees!inner(name)
      `)
      .eq('campaign_id', campaignId)
      .eq('voting_period_id', campaign.current_period_start ? 
        `${campaignId}_period_${new Date(campaign.current_period_start).getTime()}` : 
        `${campaignId}_period_1`)

    if (votesError) {
      return NextResponse.json({ error: 'Failed to fetch current votes' }, { status: 500 })
    }

    const currentStats = {
      total_votes: currentVotes?.length || 0,
      total_revenue: currentVotes?.reduce((sum: number, vote: any) => sum + (vote.amount || 0), 0) || 0,
      total_voters: new Set(currentVotes?.map((v: any) => v.voter_phone)).size || 0,
      nominee_stats: currentVotes?.reduce((acc: Record<string, any>, vote: any) => {
        const nomineeId = vote.nominee_id
        if (!acc[nomineeId]) {
          acc[nomineeId] = { name: vote.nominees.name, votes: 0, revenue: 0 }
        }
        acc[nomineeId].votes += 1
        acc[nomineeId].revenue += vote.amount || 0
        return acc
      }, {} as Record<string, any>) || {}
    }

    // Calculate next period details
    const nextPeriodStart = now
    let nextPeriodEnd: Date
    let nextAutoReset: Date

    switch (campaign.reset_frequency) {
      case 'weekly':
        nextPeriodEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        nextAutoReset = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        break
      case 'monthly':
        nextPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
        nextAutoReset = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
        break
      case 'custom':
        const days = campaign.custom_reset_days || 7
        nextPeriodEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
        nextAutoReset = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
        break
      default:
        return NextResponse.json({ 
          error: `Unknown reset frequency: ${campaign.reset_frequency}` 
        }, { status: 400 })
    }

    // Complete current period
    const { error: completePeriodError } = await supabase
      .from('voting_periods')
      .update({
        end_date: now,
        status: 'completed',
        total_votes: currentStats.total_votes,
        total_revenue: currentStats.total_revenue,
        total_voters: currentStats.total_voters,
        updated_at: now
      })
      .eq('campaign_id', campaignId)
      .eq('status', 'active')

    if (completePeriodError) {
      console.error('Error completing current period:', completePeriodError)
      return NextResponse.json({ error: 'Failed to complete current period' }, { status: 500 })
    }

    // Create new period
    const { data: newPeriod, error: newPeriodError } = await supabase
      .from('voting_periods')
      .insert({
        campaign_id: campaignId,
        period_number: (await getNextPeriodNumber(campaignId)) + 1,
        start_date: nextPeriodStart,
        end_date: nextPeriodEnd,
        status: 'active'
      })
      .select()
      .single()

    if (newPeriodError) {
      console.error('Error creating new period:', newPeriodError)
      return NextResponse.json({ error: 'Failed to create new period' }, { status: 500 })
    }

    // Update campaign with new period info
    const { error: updateCampaignError } = await supabase
      .from('campaigns')
      .update({
        current_period_start: nextPeriodStart,
        current_period_end: nextPeriodEnd,
        next_auto_reset: nextAutoReset,
        updated_at: now
      })
      .eq('id', campaignId)

    if (updateCampaignError) {
      console.error('Error updating campaign:', updateCampaignError)
      return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
    }

    // Log the test reset
    const { error: logError } = await supabase
      .from('period_reset_logs')
      .insert({
        campaign_id: campaignId,
        period_id: newPeriod.id,
        reset_type: `test_auto_${campaign.reset_frequency}`,
        reset_triggered_by: user.id,
        previous_period_stats: currentStats,
        new_period_stats: {
          period_number: newPeriod.period_number,
          start_date: nextPeriodStart,
          end_date: nextPeriodEnd
        },
        notes: `Test auto-reset triggered by organizer for ${campaign.reset_frequency} frequency`
      })

    if (logError) {
      console.error('Error logging test reset:', logError)
    }

    return NextResponse.json({
      success: true,
      message: `Test auto-reset completed successfully for ${campaign.reset_frequency} frequency`,
      data: {
        campaign_title: campaign.title,
        reset_frequency: campaign.reset_frequency,
        previous_stats: currentStats,
        new_period: newPeriod,
        next_auto_reset: nextAutoReset,
        test_mode: true
      }
    })

  } catch (error) {
    console.error('Error in test auto-reset:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to get next period number
async function getNextPeriodNumber(campaignId: string): Promise<number> {
  const { data, error } = await supabase
    .from('voting_periods')
    .select('period_number')
    .eq('campaign_id', campaignId)
    .order('period_number', { ascending: false })
    .limit(1)

  if (error || !data || data.length === 0) {
    return 0
  }

  return data[0].period_number
}
