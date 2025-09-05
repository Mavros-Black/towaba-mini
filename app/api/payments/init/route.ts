import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateReference } from '@/lib/utils'
import { PaystackService } from '@/lib/paystack'

const paystackService = new PaystackService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignId, nomineeId, amount, method, email, phone, voterName } = body

    console.log('Payment request body:', body)

    // Validate required fields
    if (!campaignId || !nomineeId || !amount || !method || !voterName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate amount (minimum 100 pesewas = 1 GHS)
    if (amount < 100) {
      return NextResponse.json(
        { error: 'Minimum amount is 100 pesewas (1 GHS)' },
        { status: 400 }
      )
    }

    // Check if campaign exists
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      console.error('Campaign error:', campaignError)
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check if nominee exists
    const { data: nominee, error: nomineeError } = await supabase
      .from('nominees')
      .select('*')
      .eq('id', nomineeId)
      .single()

    if (nomineeError || !nominee) {
      console.error('Nominee error:', nomineeError)
      return NextResponse.json(
        { error: 'Nominee not found' },
        { status: 404 }
      )
    }

    // Generate unique reference
    const reference = generateReference()

    console.log('Creating payment record with:', {
      reference,
      campaign_id: campaignId,
      amount,
      method,
      status: 'PENDING',
      voter_name: voterName,
      metadata: {
        nomineeId,
        email: email || null,
        phone: phone || null,
        isAnonymous: true
      }
    })

    // Create payment record (no user_id required)
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        reference,
        campaign_id: campaignId,
        amount,
        method,
        status: 'PENDING',
        voter_name: voterName,
        metadata: {
          nomineeId,
          email: email || null,
          phone: phone || null,
          isAnonymous: true
        }
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Payment creation error:', paymentError)
      return NextResponse.json(
        { error: 'Failed to create payment record: ' + paymentError.message },
        { status: 500 }
      )
    }

    console.log('Payment created successfully:', payment)

    // Create vote record (no user_id required)
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert({
        nominee_id: nomineeId,
        campaign_id: campaignId,
        amount,
        payment_id: payment.id,
        status: 'PENDING',
        voter_name: voterName,
        voter_phone: phone || 'Unknown'
      })
      .select()
      .single()

    if (voteError) {
      console.error('Vote creation error:', voteError)
      return NextResponse.json(
        { error: 'Failed to create vote record: ' + voteError.message },
        { status: 500 }
      )
    }

    console.log('Vote created successfully:', vote)

    // Initialize Paystack payment if method is PAYSTACK
    if (method === 'PAYSTACK') {
      if (!email) {
        return NextResponse.json(
          { error: 'Email is required for Paystack payments' },
          { status: 400 }
        )
      }

      try {
        const paystackResponse = await paystackService.initializePayment({
          email,
          amount,
          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payments/verify/${reference}`,
          metadata: {
            paymentId: payment.id,
            voteId: vote.id,
            campaignId,
            nomineeId,
            voterName,
            reference
          }
        })

        if (paystackResponse.status) {
          return NextResponse.json({
            success: true,
            message: 'Payment initialized successfully',
            data: {
              reference,
              paymentId: payment.id,
              voteId: vote.id,
              amount,
              method,
              status: 'PENDING',
              authorizationUrl: paystackResponse.data.authorization_url,
              accessCode: paystackResponse.data.access_code
            }
          })
        } else {
          throw new Error(paystackResponse.message || 'Failed to initialize Paystack payment')
        }
      } catch (paystackError) {
        console.error('Paystack initialization error:', paystackError)
        return NextResponse.json(
          { error: 'Failed to initialize Paystack payment: ' + (paystackError instanceof Error ? paystackError.message : 'Unknown error') },
          { status: 500 }
        )
      }
    }

    // For NALO_USSD or other methods, return success (they'll handle payment differently)
    return NextResponse.json({
      success: true,
      message: 'Payment and vote created successfully',
      data: {
        reference,
        paymentId: payment.id,
        voteId: vote.id,
        amount,
        method,
        status: 'PENDING'
      }
    })

  } catch (error) {
    console.error('Payment initialization error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize payment: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
