import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function GET(request: NextRequest) {
  try {
    console.log('Payouts GET endpoint called')
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid authorization header')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    console.log('Token extracted:', token ? 'Present' : 'Missing')
    
    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.log('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User authenticated:', user.id)

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

    console.log('Payouts fetched successfully:', payouts?.length || 0)

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
    console.log('Payouts POST endpoint called')
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid authorization header')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    console.log('Token extracted:', token ? 'Present' : 'Missing')
    
    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.log('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User authenticated:', user.id)

    const body = await request.json()
    const { amount, request_type, bank_details } = body

    console.log('Payout request body:', body)
    console.log('User ID:', user.id)

    // Validate required fields
    if (!amount || !request_type) {
      console.log('Validation failed: missing amount or request_type')
      return NextResponse.json({ error: 'Amount and request type are required' }, { status: 400 })
    }

    console.log('Attempting to create payout request...')

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
      console.error('Payout error details:', {
        code: payoutError.code,
        message: payoutError.message,
        details: payoutError.details,
        hint: payoutError.hint
      })
      return NextResponse.json({ 
        error: 'Failed to create payout request',
        details: payoutError.message 
      }, { status: 500 })
    }

    console.log('Payout request created successfully:', payout)

    return NextResponse.json({
      payoutRequest: payout
    })

  } catch (error) {
    console.error('Error in create payout API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
