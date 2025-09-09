import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function GET(request: NextRequest) {
  try {
    // Simple test to check database connectivity and user data
    console.log('Testing database connectivity...')

    // Test 1: Check if users table exists and has data
    const { data: users, error: usersError, count: userCount } = await supabase
      .from('users')
      .select('id, email, name, created_at', { count: 'exact' })
      .limit(5)

    console.log('Users query result:', { users, usersError, userCount })

    // Test 2: Check if campaigns table exists and has data
    const { data: campaigns, error: campaignsError, count: campaignCount } = await supabase
      .from('campaigns')
      .select('id, title, organizer_id', { count: 'exact' })
      .limit(5)

    console.log('Campaigns query result:', { campaigns, campaignsError, campaignCount })

    // Test 3: Check if votes table exists and has data
    const { data: votes, error: votesError, count: voteCount } = await supabase
      .from('votes')
      .select('id, user_id, amount', { count: 'exact' })
      .limit(5)

    console.log('Votes query result:', { votes, votesError, voteCount })

    // Test 4: Check if payments table exists and has data
    const { data: payments, error: paymentsError, count: paymentCount } = await supabase
      .from('payments')
      .select('id, user_id, amount', { count: 'exact' })
      .limit(5)

    console.log('Payments query result:', { payments, paymentsError, paymentCount })

    return NextResponse.json({
      success: true,
      message: 'Database connectivity test completed',
      results: {
        users: {
          count: userCount || 0,
          sample: users || [],
          error: usersError?.message || null
        },
        campaigns: {
          count: campaignCount || 0,
          sample: campaigns || [],
          error: campaignsError?.message || null
        },
        votes: {
          count: voteCount || 0,
          sample: votes || [],
          error: votesError?.message || null
        },
        payments: {
          count: paymentCount || 0,
          sample: payments || [],
          error: paymentsError?.message || null
        }
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
