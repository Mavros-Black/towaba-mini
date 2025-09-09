import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Get the authenticated user from the request
    const authHeader = request.headers.get('authorization')
    console.log('Auth header received:', authHeader ? 'Present' : 'Missing')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid auth header found')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('Token length:', token.length)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.log('Auth error:', authError?.message)
      console.log('User found:', !!user)
      return NextResponse.json(
        { error: 'Invalid authentication token', details: authError?.message },
        { status: 401 }
      )
    }

    console.log('Authenticated user:', user.email, 'ID:', user.id)

    // Check if user is admin
    console.log('Checking admin role for user ID:', user.id)
    const { data: adminRole, error: adminError } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    console.log('Admin role query result:', { adminRole, adminError })

    if (adminError) {
      console.error('Admin role check failed:', adminError)
      return NextResponse.json(
        { error: 'Access denied: Admin privileges required', details: adminError.message },
        { status: 403 }
      )
    }

    if (!adminRole) {
      console.error('User not found in admin_roles table:', user.id)
      return NextResponse.json(
        { error: 'Access denied: Admin privileges required' },
        { status: 403 }
      )
    }

    console.log('Admin access granted for user:', user.email, 'Role:', adminRole.role)

    // Build the query
    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data: users, error: usersError } = await query

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ 
        error: 'Failed to fetch users', 
        details: usersError.message 
      }, { status: 500 })
    }

    // If no users found, return empty array
    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        users: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0
        }
      }, { status: 200 })
    }

    // Get additional statistics for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        try {
          // Get campaign count
          const { count: campaignCount, error: campaignError } = await supabase
            .from('campaigns')
            .select('*', { count: 'exact', head: true })
            .eq('organizer_id', user.id)

          if (campaignError) {
            console.error(`Error fetching campaign count for user ${user.id}:`, campaignError)
          }

          // Get vote count
          const { count: voteCount, error: voteError } = await supabase
            .from('votes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          if (voteError) {
            console.error(`Error fetching vote count for user ${user.id}:`, voteError)
          }

          // Get payment count
          const { count: paymentCount, error: paymentError } = await supabase
            .from('payments')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          if (paymentError) {
            console.error(`Error fetching payment count for user ${user.id}:`, paymentError)
          }

          // Get total revenue from campaigns
          const { data: campaignStats, error: revenueError } = await supabase
            .from('campaigns')
            .select(`
              id,
              votes (
                amount
              )
            `)
            .eq('organizer_id', user.id)

          if (revenueError) {
            console.error(`Error fetching revenue for user ${user.id}:`, revenueError)
          }

          const totalRevenuePesewas = campaignStats?.reduce((sum: number, campaign: any) => {
            return sum + (campaign.votes?.reduce((voteSum: number, vote: any) => voteSum + (vote.amount || 0), 0) || 0)
          }, 0) || 0

          const totalRevenue = totalRevenuePesewas / 100 // Convert pesewas to cedis

          // Determine user role based on campaign count
          const userRole = (campaignCount || 0) > 0 ? 'organizer' : 'voter'

          // Determine account status (for now, all users are active)
          const accountStatus = 'active'

          return {
            ...user,
            role: userRole,
            account_status: accountStatus,
            campaign_count: campaignCount || 0,
            vote_count: voteCount || 0,
            payment_count: paymentCount || 0,
            total_revenue: totalRevenue,
            last_activity: user.updated_at
          }
        } catch (error) {
          console.error(`Error processing user ${user.id}:`, error)
          // Return user with default values if there's an error
          return {
            ...user,
            role: 'voter',
            account_status: 'active',
            campaign_count: 0,
            vote_count: 0,
            payment_count: 0,
            total_revenue: 0,
            last_activity: user.updated_at
          }
        }
      })
    )

    // Get total count for pagination
    let countQuery = supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { count: totalCount, error: countError } = await countQuery

    if (countError) {
      console.error('Error fetching user count:', countError)
      // Use the length of users array as fallback
      const fallbackCount = users.length
      return NextResponse.json({
        success: true,
        users: usersWithStats,
        pagination: {
          page,
          limit,
          total: fallbackCount,
          pages: Math.ceil(fallbackCount / limit)
        }
      }, { status: 200 })
    }

    return NextResponse.json({
      success: true,
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
