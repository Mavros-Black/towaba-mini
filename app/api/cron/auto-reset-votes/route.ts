import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request (you can add authentication here)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    console.log(`[AUTO-RESET] Starting automatic vote reset check at ${now.toISOString()}`)

    // Find campaigns that need auto-reset
    const { data: campaignsToReset, error: campaignsError } = await supabase
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
      .eq('auto_reset_enabled', true)
      .eq('status', 'ACTIVE')
      .lte('next_auto_reset', now.toISOString())

    if (campaignsError) {
      console.error('[AUTO-RESET] Error fetching campaigns:', campaignsError)
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
    }

    if (!campaignsToReset || campaignsToReset.length === 0) {
      console.log('[AUTO-RESET] No campaigns need auto-reset at this time')
      return NextResponse.json({ 
        message: 'No campaigns need auto-reset',
        checked_at: now.toISOString()
      })
    }

    console.log(`[AUTO-RESET] Found ${campaignsToReset.length} campaigns to reset`)

    const resetResults = []

    for (const campaign of campaignsToReset) {
      try {
        console.log(`[AUTO-RESET] Processing campaign: ${campaign.title} (${campaign.id})`)

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
          .eq('campaign_id', campaign.id)
          .eq('voting_period_id', campaign.current_period_start ? 
            `${campaign.id}_period_${new Date(campaign.current_period_start).getTime()}` : 
            `${campaign.id}_period_1`)

        if (votesError) {
          console.error(`[AUTO-RESET] Error fetching votes for campaign ${campaign.id}:`, votesError)
          continue
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
            console.log(`[AUTO-RESET] Unknown reset frequency for campaign ${campaign.id}: ${campaign.reset_frequency}`)
            continue
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
          .eq('campaign_id', campaign.id)
          .eq('status', 'active')

        if (completePeriodError) {
          console.error(`[AUTO-RESET] Error completing period for campaign ${campaign.id}:`, completePeriodError)
          continue
        }

        // Create new period
        const { data: newPeriod, error: newPeriodError } = await supabase
          .from('voting_periods')
          .insert({
            campaign_id: campaign.id,
            period_number: (await getNextPeriodNumber(campaign.id)) + 1,
            start_date: nextPeriodStart,
            end_date: nextPeriodEnd,
            status: 'active'
          })
          .select()
          .single()

        if (newPeriodError) {
          console.error(`[AUTO-RESET] Error creating new period for campaign ${campaign.id}:`, newPeriodError)
          continue
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
          .eq('id', campaign.id)

        if (updateCampaignError) {
          console.error(`[AUTO-RESET] Error updating campaign ${campaign.id}:`, updateCampaignError)
          continue
        }

        // Log the auto-reset
        const { error: logError } = await supabase
          .from('period_reset_logs')
          .insert({
            campaign_id: campaign.id,
            period_id: newPeriod.id,
            reset_type: `auto_${campaign.reset_frequency}`,
            reset_triggered_by: null, // System triggered
            previous_period_stats: currentStats,
            new_period_stats: {
              period_number: newPeriod.period_number,
              start_date: nextPeriodStart,
              end_date: nextPeriodEnd
            },
            notes: `Automatic ${campaign.reset_frequency} reset triggered by system`
          })

        if (logError) {
          console.error(`[AUTO-RESET] Error logging reset for campaign ${campaign.id}:`, logError)
        }

        resetResults.push({
          campaign_id: campaign.id,
          campaign_title: campaign.title,
          reset_type: campaign.reset_frequency,
          previous_stats: currentStats,
          new_period: newPeriod,
          next_reset: nextAutoReset,
          success: true
        })

        console.log(`[AUTO-RESET] Successfully reset campaign: ${campaign.title}`)

      } catch (error) {
        console.error(`[AUTO-RESET] Error processing campaign ${campaign.id}:`, error)
        resetResults.push({
          campaign_id: campaign.id,
          campaign_title: campaign.title,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        })
      }
    }

    console.log(`[AUTO-RESET] Completed processing ${campaignsToReset.length} campaigns`)
    console.log(`[AUTO-RESET] Successful resets: ${resetResults.filter(r => r.success).length}`)
    console.log(`[AUTO-RESET] Failed resets: ${resetResults.filter(r => !r.success).length}`)

    return NextResponse.json({
      message: 'Auto-reset processing completed',
      processed_at: now.toISOString(),
      total_campaigns: campaignsToReset.length,
      successful_resets: resetResults.filter(r => r.success).length,
      failed_resets: resetResults.filter(r => !r.success).length,
      results: resetResults
    })

  } catch (error) {
    console.error('[AUTO-RESET] Fatal error:', error)
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

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    message: 'Auto-reset cron endpoint is healthy',
    timestamp: new Date().toISOString()
  })
}
