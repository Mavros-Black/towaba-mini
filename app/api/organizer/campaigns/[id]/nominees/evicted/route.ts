import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

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
        { error: 'You can only view evicted nominees from your own campaigns' },
        { status: 403 }
      )
    }

    // Get evicted nominees
    const { data: evictedNominees, error: evictedError } = await supabase
      .rpc('get_evicted_nominees', {
        campaign_uuid: campaignId
      })

    if (evictedError) {
      console.error('Error fetching evicted nominees:', evictedError)
      return NextResponse.json(
        { error: 'Failed to fetch evicted nominees' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      evictedNominees: evictedNominees || []
    })

  } catch (error) {
    console.error('Fetch evicted nominees error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch evicted nominees' },
      { status: 500 }
    )
  }
}
