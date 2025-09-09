import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get pagination and search parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const method = searchParams.get('method') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''

    const offset = (page - 1) * limit

    // Authentication check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No valid auth header found' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 })
    }

    // Check admin role
    const { data: adminRole, error: adminError } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (adminError || !adminRole) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Build query for payments with campaign and user details
    let query = supabase
      .from('payments')
      .select(`
        id,
        amount,
        reference,
        status,
        method,
        voter_name,
        metadata,
        created_at,
        updated_at,
        campaigns!inner(
          id,
          title,
          organizer_id,
          users!campaigns_organizer_id_fkey(
            id,
            name,
            email
          )
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (search) {
      query = query.or(`reference.ilike.%${search}%,voter_name.ilike.%${search}%,campaigns.title.ilike.%${search}%`)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (method) {
      query = query.eq('method', method)
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    const { data: payments, error: paymentsError } = await query

    if (paymentsError) {
      console.error('Payments fetch error:', paymentsError)
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('payments')
      .select('id', { count: 'exact', head: true })

    if (search) {
      countQuery = countQuery.or(`reference.ilike.%${search}%,voter_name.ilike.%${search}%`)
    }

    if (status) {
      countQuery = countQuery.eq('status', status)
    }

    if (method) {
      countQuery = countQuery.eq('method', method)
    }

    if (dateFrom) {
      countQuery = countQuery.gte('created_at', dateFrom)
    }

    if (dateTo) {
      countQuery = countQuery.lte('created_at', dateTo)
    }

    const { count: totalCount, error: countError } = await countQuery

    if (countError) {
      console.error('Count error:', countError)
      return NextResponse.json({ error: 'Failed to get payments count' }, { status: 500 })
    }

    // Format payments data
    const formattedPayments = payments?.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      amountGHS: (payment.amount / 100).toFixed(2), // Convert pesewas to GHS
      reference: payment.reference,
      status: payment.status,
      method: payment.method,
      voterName: payment.voter_name,
      metadata: payment.metadata,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
      campaign: {
        id: payment.campaigns.id,
        title: payment.campaigns.title,
        organizer: {
          id: payment.campaigns.users.id,
          name: payment.campaigns.users.name,
          email: payment.campaigns.users.email
        }
      }
    })) || []

    return NextResponse.json({
      success: true,
      payments: formattedPayments,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Payments API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
