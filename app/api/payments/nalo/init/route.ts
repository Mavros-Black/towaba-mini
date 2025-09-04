import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  try {
    const body = await request.json()
    const { campaignId, nomineeId, amount, method } = body

    // Validate required fields
    if (!campaignId || !nomineeId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: campaignId, nomineeId, amount' },
        { status: 400 }
      )
    }

    // Verify campaign exists and is active
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, title, status, amount_per_vote')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Campaign is not active' },
        { status: 400 }
      )
    }

    // Verify nominee exists
    const { data: nominee, error: nomineeError } = await supabase
      .from('nominees')
      .select('id, name, campaign_id')
      .eq('id', nomineeId)
      .eq('campaign_id', campaignId)
      .eq('is_evicted', false)
      .single()

    if (nomineeError || !nominee) {
      return NextResponse.json(
        { error: 'Nominee not found or evicted' },
        { status: 404 }
      )
    }

    // Create payment record
    const reference = `NALO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        reference,
        campaign_id: campaignId,
        amount: amount * 100, // Convert to pesewas
        method: 'NALO_USSD',
        status: 'PENDING',
        voter_name: 'USSD_USER',
        metadata: {
          nomineeId,
          campaignTitle: campaign.title,
          nomineeName: nominee.name,
          isAnonymous: true,
          paymentMethod: 'USSD'
        }
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Payment creation error:', paymentError)
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      )
    }

    // Create vote record
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert({
        nominee_id: nomineeId,
        campaign_id: campaignId,
        amount: amount * 100,
        payment_id: payment.id,
        status: 'PENDING',
        voter_name: 'USSD_USER',
        reference: payment.reference
      })
      .select()
      .single()

    if (voteError) {
      console.error('Vote creation error:', voteError)
      // Clean up payment record
      await supabase
        .from('payments')
        .delete()
        .eq('id', payment.id)
      
      return NextResponse.json(
        { error: 'Failed to create vote record' },
        { status: 500 }
      )
    }

    // Return payment details for USSD flow
    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        reference: payment.reference,
        amount: amount,
        nominee: nominee.name,
        campaign: campaign.title
      },
      vote: {
        id: vote.id,
        status: vote.status
      },
      ussdCode: process.env.NALO_USSD_CODE || '*920*123#',
      instructions: {
        step1: `Dial ${process.env.NALO_USSD_CODE || '*920*123#'}`,
        step2: 'Select "Vote for Campaign"',
        step3: `Choose "${campaign.title}"`,
        step4: `Select "${nominee.name}"`,
        step5: `Confirm payment of ${amount} GHS`
      }
    })

  } catch (error) {
    console.error('Nalo payment init error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
