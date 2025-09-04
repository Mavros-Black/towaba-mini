import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; nomineeId: string } }
) {
  try {
    const campaignId = params.id
    const nomineeId = params.nomineeId
    const { reason } = await request.json()

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { error: 'Reason is required and must be at least 10 characters long' },
        { status: 400 }
      )
    }

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

    // Verify the campaign belongs to the authenticated user
    const { data: campaign, error: campaignCheckError } = await supabase
      .from('campaigns')
      .select('id, organizer_id')
      .eq('id', campaignId)
      .single()

    if (campaignCheckError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.organizer_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only reinstate nominees from your own campaigns' },
        { status: 403 }
      )
    }

    // Verify the nominee belongs to the campaign and is evicted
    const { data: nominee, error: nomineeCheckError } = await supabase
      .from('nominees')
      .select('id, name, campaign_id, is_evicted')
      .eq('id', nomineeId)
      .eq('campaign_id', campaignId)
      .single()

    if (nomineeCheckError || !nominee) {
      return NextResponse.json(
        { error: 'Nominee not found in this campaign' },
        { status: 404 }
      )
    }

    if (!nominee.is_evicted) {
      return NextResponse.json(
        { error: 'Nominee is not evicted' },
        { status: 400 }
      )
    }

    // Reinstate the nominee
    const { data: result, error: reinstateError } = await supabase
      .rpc('reinstate_nominee', {
        nominee_uuid: nomineeId,
        reinstator_uuid: user.id,
        reason: reason.trim()
      })

    if (reinstateError) {
      console.error('Reinstate nominee error:', reinstateError)
      return NextResponse.json(
        { error: 'Failed to reinstate nominee: ' + reinstateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Nominee reinstated successfully',
      data: result
    })

  } catch (error) {
    console.error('Reinstate nominee error:', error)
    return NextResponse.json(
      { error: 'Failed to reinstate nominee' },
      { status: 500 }
    )
  }
}
