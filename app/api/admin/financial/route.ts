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

    // Get date range parameters
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''

    // Build date filter
    let dateFilter = ''
    if (dateFrom && dateTo) {
      dateFilter = `created_at.gte.${dateFrom},created_at.lte.${dateTo}`
    } else if (dateFrom) {
      dateFilter = `created_at.gte.${dateFrom}`
    } else if (dateTo) {
      dateFilter = `created_at.lte.${dateTo}`
    }

    // Get total revenue (successful payments only)
    let revenueQuery = supabase
      .from('payments')
      .select('amount')
      .eq('status', 'SUCCESS')

    if (dateFrom) {
      revenueQuery = revenueQuery.gte('created_at', dateFrom)
    }
    if (dateTo) {
      revenueQuery = revenueQuery.lte('created_at', dateTo)
    }

    const { data: totalRevenue, error: revenueError } = await revenueQuery

    if (revenueError) {
      console.error('Revenue fetch error:', revenueError)
      return NextResponse.json({ error: 'Failed to fetch revenue data' }, { status: 500 })
    }

    const totalRevenueAmount = totalRevenue?.reduce((sum, payment) => sum + payment.amount, 0) || 0

    // Get payment statistics by status
    let statsQuery = supabase
      .from('payments')
      .select('status, amount')

    if (dateFrom) {
      statsQuery = statsQuery.gte('created_at', dateFrom)
    }
    if (dateTo) {
      statsQuery = statsQuery.lte('created_at', dateTo)
    }

    const { data: paymentStats, error: statsError } = await statsQuery

    if (statsError) {
      console.error('Payment stats error:', statsError)
      return NextResponse.json({ error: 'Failed to fetch payment statistics' }, { status: 500 })
    }

    const stats = {
      total: paymentStats?.length || 0,
      successful: paymentStats?.filter(p => p.status === 'SUCCESS').length || 0,
      pending: paymentStats?.filter(p => p.status === 'PENDING').length || 0,
      failed: paymentStats?.filter(p => p.status === 'FAILED').length || 0
    }

    const successfulAmount = paymentStats?.filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + p.amount, 0) || 0
    const pendingAmount = paymentStats?.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0) || 0
    const failedAmount = paymentStats?.filter(p => p.status === 'FAILED').reduce((sum, p) => sum + p.amount, 0) || 0

    // Get payment method breakdown
    let methodQuery = supabase
      .from('payments')
      .select('method, amount, status')

    if (dateFrom) {
      methodQuery = methodQuery.gte('created_at', dateFrom)
    }
    if (dateTo) {
      methodQuery = methodQuery.lte('created_at', dateTo)
    }

    const { data: methodStats, error: methodError } = await methodQuery

    if (methodError) {
      console.error('Method stats error:', methodError)
      return NextResponse.json({ error: 'Failed to fetch method statistics' }, { status: 500 })
    }

    const methodBreakdown = {
      PAYSTACK: {
        count: methodStats?.filter(p => p.method === 'PAYSTACK').length || 0,
        amount: methodStats?.filter(p => p.method === 'PAYSTACK').reduce((sum, p) => sum + p.amount, 0) || 0,
        successful: methodStats?.filter(p => p.method === 'PAYSTACK' && p.status === 'SUCCESS').length || 0
      },
      NALO_USSD: {
        count: methodStats?.filter(p => p.method === 'NALO_USSD').length || 0,
        amount: methodStats?.filter(p => p.method === 'NALO_USSD').reduce((sum, p) => sum + p.amount, 0) || 0,
        successful: methodStats?.filter(p => p.method === 'NALO_USSD' && p.status === 'SUCCESS').length || 0
      }
    }

    // Get recent transactions (last 10)
    const { data: recentTransactions, error: recentError } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        reference,
        status,
        method,
        voter_name,
        created_at,
        campaigns!inner(
          title,
          users!campaigns_organizer_id_fkey(
            name
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (recentError) {
      console.error('Recent transactions error:', recentError)
      return NextResponse.json({ error: 'Failed to fetch recent transactions' }, { status: 500 })
    }

    // Get top campaigns by revenue
    let campaignsQuery = supabase
      .from('payments')
      .select(`
        amount,
        campaigns!inner(
          id,
          title,
          users!campaigns_organizer_id_fkey(
            name
          )
        )
      `)
      .eq('status', 'SUCCESS')

    if (dateFrom) {
      campaignsQuery = campaignsQuery.gte('created_at', dateFrom)
    }
    if (dateTo) {
      campaignsQuery = campaignsQuery.lte('created_at', dateTo)
    }

    const { data: topCampaigns, error: campaignsError } = await campaignsQuery

    if (campaignsError) {
      console.error('Top campaigns error:', campaignsError)
      return NextResponse.json({ error: 'Failed to fetch top campaigns' }, { status: 500 })
    }

    // Group by campaign and calculate totals
    const campaignRevenue = new Map()
    topCampaigns?.forEach(payment => {
      const campaignId = payment.campaigns.id
      const campaignTitle = payment.campaigns.title
      const organizerName = payment.campaigns.users.name
      
      if (!campaignRevenue.has(campaignId)) {
        campaignRevenue.set(campaignId, {
          id: campaignId,
          title: campaignTitle,
          organizer: organizerName,
          amount: 0,
          count: 0
        })
      }
      
      const campaign = campaignRevenue.get(campaignId)
      campaign.amount += payment.amount
      campaign.count += 1
    })

    const topCampaignsList = Array.from(campaignRevenue.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    // Calculate success rate
    const successRate = stats.total > 0 ? (stats.successful / stats.total) * 100 : 0

    // Calculate average transaction value
    const avgTransactionValue = stats.successful > 0 ? successfulAmount / stats.successful : 0

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalRevenue: totalRevenueAmount,
          totalRevenueGHS: (totalRevenueAmount / 100).toFixed(2),
          totalTransactions: stats.total,
          successRate: successRate.toFixed(1),
          avgTransactionValue: Math.round(avgTransactionValue),
          avgTransactionValueGHS: (avgTransactionValue / 100).toFixed(2)
        },
        statistics: {
          byStatus: {
            total: stats.total,
            successful: stats.successful,
            pending: stats.pending,
            failed: stats.failed,
            amounts: {
              successful: successfulAmount,
              successfulGHS: (successfulAmount / 100).toFixed(2),
              pending: pendingAmount,
              pendingGHS: (pendingAmount / 100).toFixed(2),
              failed: failedAmount,
              failedGHS: (failedAmount / 100).toFixed(2)
            }
          },
          byMethod: {
            PAYSTACK: {
              ...methodBreakdown.PAYSTACK,
              amountGHS: (methodBreakdown.PAYSTACK.amount / 100).toFixed(2),
              successRate: methodBreakdown.PAYSTACK.count > 0 ? 
                ((methodBreakdown.PAYSTACK.successful / methodBreakdown.PAYSTACK.count) * 100).toFixed(1) : '0.0'
            },
            NALO_USSD: {
              ...methodBreakdown.NALO_USSD,
              amountGHS: (methodBreakdown.NALO_USSD.amount / 100).toFixed(2),
              successRate: methodBreakdown.NALO_USSD.count > 0 ? 
                ((methodBreakdown.NALO_USSD.successful / methodBreakdown.NALO_USSD.count) * 100).toFixed(1) : '0.0'
            }
          }
        },
        recentTransactions: recentTransactions?.map(tx => ({
          id: tx.id,
          amount: tx.amount,
          amountGHS: (tx.amount / 100).toFixed(2),
          reference: tx.reference,
          status: tx.status,
          method: tx.method,
          voterName: tx.voter_name,
          campaignTitle: tx.campaigns.title,
          organizerName: tx.campaigns.users.name,
          createdAt: tx.created_at
        })) || [],
        topCampaigns: topCampaignsList.map(campaign => ({
          ...campaign,
          amountGHS: (campaign.amount / 100).toFixed(2)
        }))
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Financial API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
