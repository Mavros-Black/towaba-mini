import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    
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

    // Get payout requests for the organizer
    const { data: payouts, error: payoutsError } = await supabase
      .from('payout_requests')
      .select('*')
      .eq('organizer_id', user.id)
      .order('requested_at', { ascending: false })

    if (payoutsError) {
      console.error('Error fetching payouts:', payoutsError)
      return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 })
    }

    return NextResponse.json({
      payoutRequests: payouts || []
    })

  } catch (error) {
    console.error('Error in payouts API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    
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

    const body = await request.json()
    const { amount, request_type, bank_details } = body

    // Validate required fields
    if (!amount || !request_type) {
      return NextResponse.json({ error: 'Amount and request type are required' }, { status: 400 })
    }

    // Create payout request
    const { data: payout, error: payoutError } = await supabase
      .from('payout_requests')
      .insert({
        organizer_id: user.id,
        amount: amount,
        request_type: request_type,
        status: 'PENDING',
        bank_details: bank_details || null,
        requested_at: new Date().toISOString()
      })
      .select()
      .single()

    if (payoutError) {
      console.error('Error creating payout request:', payoutError)
      return NextResponse.json({ error: 'Failed to create payout request' }, { status: 500 })
    }

    return NextResponse.json({
      payoutRequest: payout
    })

  } catch (error) {
    console.error('Error in create payout API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
