import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface NaloWebhookPayload {
  transactionId: string
  reference: string
  amount: number
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
  msisdn: string
  network: string
  timestamp: string
  description?: string
}

export async function POST(request: NextRequest) {
  try {
    const payload: NaloWebhookPayload = await request.json()
    
    console.log('Nalo Webhook Received:', payload)

    // Verify webhook signature (implement based on Nalo's security requirements)
    const isValid = await verifyWebhookSignature(request, payload)
    if (!isValid) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Update payment status
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: payload.status === 'SUCCESS' ? 'COMPLETED' : 'FAILED',
        updated_at: new Date().toISOString(),
        metadata: {
          ...payment?.metadata,
          naloTransactionId: payload.transactionId,
          naloStatus: payload.status,
          naloNetwork: payload.network,
          naloTimestamp: payload.timestamp
        }
      })
      .eq('reference', payload.reference)
      .select()
      .single()

    if (paymentError) {
      console.error('Payment update error:', paymentError)
      return NextResponse.json({ error: 'Payment update failed' }, { status: 500 })
    }

    if (!payment) {
      console.error('Payment not found:', payload.reference)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Update vote status
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .update({
        status: payload.status === 'SUCCESS' ? 'COMPLETED' : 'FAILED',
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', payment.id)
      .select()
      .single()

    if (voteError) {
      console.error('Vote update error:', voteError)
      return NextResponse.json({ error: 'Vote update failed' }, { status: 500 })
    }

    // If payment successful, trigger vote count update
    if (payload.status === 'SUCCESS' && vote) {
      await updateVoteCount(vote.nominee_id)
    }

    console.log('Nalo webhook processed successfully:', {
      paymentId: payment.id,
      voteId: vote?.id,
      status: payload.status
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    })

  } catch (error) {
    console.error('Nalo webhook error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

async function verifyWebhookSignature(
  request: NextRequest, 
  payload: NaloWebhookPayload
): Promise<boolean> {
  // Implement webhook signature verification based on Nalo's requirements
  // This is a placeholder - implement according to Nalo's documentation
  
  const signature = request.headers.get('x-nalo-signature')
  const secret = process.env.NALO_WEBHOOK_SECRET
  
  if (!signature || !secret) {
    return false
  }

  // Implement HMAC verification here
  // const expectedSignature = crypto
  //   .createHmac('sha256', secret)
  //   .update(JSON.stringify(payload))
  //   .digest('hex')
  
  // return signature === expectedSignature
  
  // For now, return true (implement proper verification)
  return true
}

async function updateVoteCount(nomineeId: string) {
  try {
    // Trigger the vote count update function
    const { error } = await supabase.rpc('update_vote_count', {
      nominee_id: nomineeId
    })

    if (error) {
      console.error('Vote count update error:', error)
    } else {
      console.log('Vote count updated for nominee:', nomineeId)
    }
  } catch (error) {
    console.error('Error updating vote count:', error)
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const challenge = searchParams.get('challenge')
  
  if (challenge) {
    return NextResponse.json({ challenge })
  }
  
  return NextResponse.json({ 
    message: 'Nalo webhook endpoint is active' 
  })
}