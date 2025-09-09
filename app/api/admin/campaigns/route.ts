import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function GET(request: NextRequest) {
  try {
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

    // Check if user is admin
    const { data: adminRole, error: adminError } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (adminError || !adminRole) {
      return NextResponse.json(
        { error: 'Access denied: Admin privileges required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Build the query
    let query = supabase
      .from('campaigns')
      .select(`
        id,
        title,
        description,
        cover_image,
        organizer_id,
        status,
        start_date,
        end_date,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: campaigns, error: campaignsError } = await query

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError)
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      )
    }

    // Get vote and revenue data for each campaign
    const campaignsWithStats = await Promise.all(
      (campaigns || []).map(async (campaign: any) => {
        // Get organizer information
        let organizer = null
        if (campaign.organizer_id) {
          const { data: organizerData } = await supabase
            .from('users')
            .select('name, email')
            .eq('id', campaign.organizer_id)
            .single()
          organizer = organizerData
        }

        // Get vote count and revenue
        const { data: voteStats } = await supabase
          .from('votes')
          .select('amount')
          .eq('campaign_id', campaign.id)
          .eq('status', 'SUCCESS')

        // Get nominee and category counts
        const { count: nomineeCount } = await supabase
          .from('nominees')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id)

        const { count: categoryCount } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id)

        const totalVotes = voteStats?.length || 0
        const totalRevenuePesewas = voteStats?.reduce((sum: number, vote: any) => sum + (vote.amount || 0), 0) || 0
        const totalRevenue = totalRevenuePesewas / 100 // Convert pesewas to cedis

        return {
          id: campaign.id,
          title: campaign.title,
          description: campaign.description,
          status: campaign.status || 'DRAFT',
          organizer_name: organizer?.name || 'No Organizer',
          organizer_email: organizer?.email || 'No Email',
          created_at: campaign.created_at,
          updated_at: campaign.updated_at,
          start_date: campaign.start_date,
          end_date: campaign.end_date,
          total_votes: totalVotes,
          total_revenue: totalRevenue,
          nominee_count: nomineeCount || 0,
          category_count: categoryCount || 0,
          is_featured: false, // Default to false since column doesn't exist
          vote_count: totalVotes,
          revenue: totalRevenue
        }
      })
    )

    return NextResponse.json({
      success: true,
      campaigns: campaignsWithStats,
      pagination: {
        limit,
        offset,
        hasMore: campaignsWithStats.length === limit
      }
    })

  } catch (error) {
    console.error('Admin campaigns fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}
