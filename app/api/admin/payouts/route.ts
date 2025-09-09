import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
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

    // Get pagination parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const offset = (page - 1) * limit

    // Get organizer earnings data
    let query = supabase
      .from('campaigns')
      .select(`
        id,
        title,
        organizer_id,
        users!campaigns_organizer_id_fkey(
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`title.ilike.%${search}%,users.name.ilike.%${search}%,users.email.ilike.%${search}%`)
    }

    const { data: campaigns, error: campaignsError } = await query

    if (campaignsError) {
      console.error('Campaigns fetch error:', campaignsError)
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
    }

    // Get total count
    let countQuery = supabase
      .from('campaigns')
      .select('id', { count: 'exact', head: true })

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,users.name.ilike.%${search}%,users.email.ilike.%${search}%`)
    }

    const { count: totalCount, error: countError } = await countQuery

    if (countError) {
      console.error('Count error:', countError)
      return NextResponse.json({ error: 'Failed to get campaigns count' }, { status: 500 })
    }

    // Calculate earnings for each campaign
    const campaignsWithEarnings = await Promise.all(
      campaigns?.map(async (campaign) => {
        // Get successful payments for this campaign
        const { data: payments, error: paymentsError } = await supabase
          .from('payments')
          .select('amount, created_at')
          .eq('campaign_id', campaign.id)
          .eq('status', 'SUCCESS')

        if (paymentsError) {
          console.error('Payments fetch error for campaign:', campaign.id, paymentsError)
          return {
            ...campaign,
            totalRevenue: 0,
            totalRevenueGHS: '0.00',
            paymentCount: 0,
            lastPaymentDate: null,
            pendingPayout: 0,
            pendingPayoutGHS: '0.00'
          }
        }

        const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
        const lastPaymentDate = payments?.length > 0 
          ? payments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : null

        // Calculate platform commission (assuming 10% commission)
        const platformCommission = 0.10 // 10%
        const organizerEarnings = totalRevenue * (1 - platformCommission)
        const platformFee = totalRevenue * platformCommission

        return {
          ...campaign,
          totalRevenue,
          totalRevenueGHS: (totalRevenue / 100).toFixed(2),
          paymentCount: payments?.length || 0,
          lastPaymentDate,
          organizerEarnings,
          organizerEarningsGHS: (organizerEarnings / 100).toFixed(2),
          platformFee,
          platformFeeGHS: (platformFee / 100).toFixed(2),
          pendingPayout: organizerEarnings, // For now, all earnings are pending payout
          pendingPayoutGHS: (organizerEarnings / 100).toFixed(2)
        }
      }) || []
    )

    // Filter by status if provided
    let filteredCampaigns = campaignsWithEarnings
    if (status === 'pending') {
      filteredCampaigns = campaignsWithEarnings.filter(c => c.pendingPayout > 0)
    } else if (status === 'paid') {
      filteredCampaigns = campaignsWithEarnings.filter(c => c.pendingPayout === 0)
    }

    return NextResponse.json({
      success: true,
      campaigns: filteredCampaigns,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Payouts API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json()
    const { campaignIds, payoutMethod, notes } = body

    if (!campaignIds || !Array.isArray(campaignIds) || campaignIds.length === 0) {
      return NextResponse.json({ error: 'Campaign IDs are required' }, { status: 400 })
    }

    if (!payoutMethod) {
      return NextResponse.json({ error: 'Payout method is required' }, { status: 400 })
    }

    // Process payouts for each campaign
    const payoutResults = []
    
    for (const campaignId of campaignIds) {
      try {
        // Get campaign and organizer details
        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .select(`
            id,
            title,
            organizer_id,
            users!campaigns_organizer_id_fkey(
              id,
              name,
              email
            )
          `)
          .eq('id', campaignId)
          .single()

        if (campaignError || !campaign) {
          payoutResults.push({
            campaignId,
            success: false,
            error: 'Campaign not found'
          })
          continue
        }

        // Calculate organizer earnings
        const { data: payments, error: paymentsError } = await supabase
          .from('payments')
          .select('amount')
          .eq('campaign_id', campaignId)
          .eq('status', 'SUCCESS')

        if (paymentsError) {
          payoutResults.push({
            campaignId,
            success: false,
            error: 'Failed to fetch payments'
          })
          continue
        }

        const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
        const platformCommission = 0.10 // 10%
        const organizerEarnings = totalRevenue * (1 - platformCommission)

        if (organizerEarnings <= 0) {
          payoutResults.push({
            campaignId,
            success: false,
            error: 'No earnings to payout'
          })
          continue
        }

        // Create payout record (you might want to create a payouts table)
        const payoutRecord = {
          campaign_id: campaignId,
          organizer_id: campaign.organizer_id,
          amount: Math.round(organizerEarnings),
          method: payoutMethod,
          status: 'PROCESSING',
          processed_by: user.id,
          notes: notes || '',
          created_at: new Date().toISOString()
        }

        // For now, we'll just log the payout
        // In a real system, you'd integrate with a payment processor
        console.log('Processing payout:', payoutRecord)

        payoutResults.push({
          campaignId,
          success: true,
          amount: organizerEarnings,
          amountGHS: (organizerEarnings / 100).toFixed(2),
          organizer: campaign.users.name,
          campaign: campaign.title
        })

      } catch (error) {
        console.error('Error processing payout for campaign:', campaignId, error)
        payoutResults.push({
          campaignId,
          success: false,
          error: 'Internal error processing payout'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payout processing completed',
      results: payoutResults
    }, { status: 200 })

  } catch (error) {
    console.error('Payout processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
