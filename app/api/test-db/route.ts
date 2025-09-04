import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test inserting a minimal payment record
    const testPayment = {
      reference: 'TEST-REF-123',
      campaign_id: '550e8400-e29b-41d4-a716-446655440010', // Use the existing campaign ID
      amount: 100,
      method: 'PAYSTACK',
      status: 'PENDING',
      metadata: {
        test: true,
        timestamp: new Date().toISOString()
      }
    }

    console.log('Testing payment insert with:', testPayment)

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert(testPayment)
      .select()
      .single()

    if (paymentError) {
      console.error('Payment test error:', paymentError)
      return NextResponse.json({
        success: false,
        message: 'Payment insert failed',
        error: paymentError.message,
        details: paymentError.details,
        hint: paymentError.hint
      }, { status: 500 })
    }

    // Test inserting a minimal vote record
    const testVote = {
      nominee_id: '550e8400-e29b-41d4-a716-446655440030', // Use the existing nominee ID
      campaign_id: '550e8400-e29b-41d4-a716-446655440010',
      amount: 100,
      payment_id: payment.id,
      status: 'PENDING'
    }

    console.log('Testing vote insert with:', testVote)

    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert(testVote)
      .select()
      .single()

    if (voteError) {
      console.error('Vote test error:', voteError)
      return NextResponse.json({
        success: false,
        message: 'Vote insert failed',
        error: voteError.message,
        details: voteError.details,
        hint: voteError.hint
      }, { status: 500 })
    }

    // Clean up test data
    await supabase.from('votes').delete().eq('id', vote.id)
    await supabase.from('payments').delete().eq('id', payment.id)

    return NextResponse.json({
      success: true,
      message: 'Database test successful',
      payment: payment,
      vote: vote
    })

  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
