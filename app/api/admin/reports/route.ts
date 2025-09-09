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

    // Get report parameters
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'overview'
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const format = searchParams.get('format') || 'json'

    // Build date filter
    let dateFilter = ''
    if (dateFrom && dateTo) {
      dateFilter = `created_at.gte.${dateFrom},created_at.lte.${dateTo}`
    } else if (dateFrom) {
      dateFilter = `created_at.gte.${dateFrom}`
    } else if (dateTo) {
      dateFilter = `created_at.lte.${dateTo}`
    }

    switch (reportType) {
      case 'overview':
        return await generateOverviewReport(dateFrom, dateTo)
      case 'revenue':
        return await generateRevenueReport(dateFrom, dateTo)
      case 'campaigns':
        return await generateCampaignsReport(dateFrom, dateTo)
      case 'users':
        return await generateUsersReport(dateFrom, dateTo)
      case 'payments':
        return await generatePaymentsReport(dateFrom, dateTo, format)
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateOverviewReport(dateFrom: string, dateTo: string) {
  try {
    // Get platform statistics
    let campaignsQuery = supabase
      .from('campaigns')
      .select('id')

    if (dateFrom) {
      campaignsQuery = campaignsQuery.gte('created_at', dateFrom)
    }
    if (dateTo) {
      campaignsQuery = campaignsQuery.lte('created_at', dateTo)
    }

    const { data: campaigns, error: campaignsError } = await campaignsQuery

    if (campaignsError) {
      throw new Error('Failed to fetch campaigns')
    }

    let usersQuery = supabase
      .from('users')
      .select('id')

    if (dateFrom) {
      usersQuery = usersQuery.gte('created_at', dateFrom)
    }
    if (dateTo) {
      usersQuery = usersQuery.lte('created_at', dateTo)
    }

    const { data: users, error: usersError } = await usersQuery

    if (usersError) {
      throw new Error('Failed to fetch users')
    }

    let paymentsQuery = supabase
      .from('payments')
      .select('amount, status, method')

    if (dateFrom) {
      paymentsQuery = paymentsQuery.gte('created_at', dateFrom)
    }
    if (dateTo) {
      paymentsQuery = paymentsQuery.lte('created_at', dateTo)
    }

    const { data: payments, error: paymentsError } = await paymentsQuery

    if (paymentsError) {
      throw new Error('Failed to fetch payments')
    }

    let votesQuery = supabase
      .from('votes')
      .select('id')

    if (dateFrom) {
      votesQuery = votesQuery.gte('created_at', dateFrom)
    }
    if (dateTo) {
      votesQuery = votesQuery.lte('created_at', dateTo)
    }

    const { data: votes, error: votesError } = await votesQuery

    if (votesError) {
      throw new Error('Failed to fetch votes')
    }

    // Calculate metrics
    const totalRevenue = payments?.filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + p.amount, 0) || 0
    const totalTransactions = payments?.length || 0
    const successfulTransactions = payments?.filter(p => p.status === 'SUCCESS').length || 0
    const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0

    // Payment method breakdown
    const methodBreakdown = {
      PAYSTACK: payments?.filter(p => p.method === 'PAYSTACK').length || 0,
      NALO_USSD: payments?.filter(p => p.method === 'NALO_USSD').length || 0
    }

    return NextResponse.json({
      success: true,
      report: {
        type: 'overview',
        period: { dateFrom, dateTo },
        metrics: {
          totalCampaigns: campaigns?.length || 0,
          totalUsers: users?.length || 0,
          totalVotes: votes?.length || 0,
          totalRevenue: totalRevenue,
          totalRevenueGHS: (totalRevenue / 100).toFixed(2),
          totalTransactions: totalTransactions,
          successfulTransactions: successfulTransactions,
          successRate: successRate.toFixed(1),
          methodBreakdown
        }
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Overview report error:', error)
    return NextResponse.json({ error: 'Failed to generate overview report' }, { status: 500 })
  }
}

async function generateRevenueReport(dateFrom: string, dateTo: string) {
  try {
    // Get daily revenue data
    let paymentsQuery = supabase
      .from('payments')
      .select('amount, status, created_at')
      .eq('status', 'SUCCESS')
      .order('created_at', { ascending: true })

    if (dateFrom) {
      paymentsQuery = paymentsQuery.gte('created_at', dateFrom)
    }
    if (dateTo) {
      paymentsQuery = paymentsQuery.lte('created_at', dateTo)
    }

    const { data: payments, error: paymentsError } = await paymentsQuery

    if (paymentsError) {
      throw new Error('Failed to fetch payments')
    }

    // Group by date
    const dailyRevenue = new Map()
    payments?.forEach(payment => {
      const date = new Date(payment.created_at).toISOString().split('T')[0]
      if (!dailyRevenue.has(date)) {
        dailyRevenue.set(date, { date, amount: 0, count: 0 })
      }
      const dayData = dailyRevenue.get(date)
      dayData.amount += payment.amount
      dayData.count += 1
    })

    const dailyData = Array.from(dailyRevenue.values()).map(day => ({
      ...day,
      amountGHS: (day.amount / 100).toFixed(2)
    }))

    // Calculate totals
    const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0
    const totalTransactions = payments?.length || 0
    const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    return NextResponse.json({
      success: true,
      report: {
        type: 'revenue',
        period: { dateFrom, dateTo },
        summary: {
          totalRevenue,
          totalRevenueGHS: (totalRevenue / 100).toFixed(2),
          totalTransactions,
          avgTransactionValue: Math.round(avgTransactionValue),
          avgTransactionValueGHS: (avgTransactionValue / 100).toFixed(2)
        },
        dailyData
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Revenue report error:', error)
    return NextResponse.json({ error: 'Failed to generate revenue report' }, { status: 500 })
  }
}

async function generateCampaignsReport(dateFrom: string, dateTo: string) {
  try {
    let campaignsQuery = supabase
      .from('campaigns')
      .select(`
        id,
        title,
        created_at,
        users!campaigns_organizer_id_fkey(
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (dateFrom) {
      campaignsQuery = campaignsQuery.gte('created_at', dateFrom)
    }
    if (dateTo) {
      campaignsQuery = campaignsQuery.lte('created_at', dateTo)
    }

    const { data: campaigns, error: campaignsError } = await campaignsQuery

    if (campaignsError) {
      throw new Error('Failed to fetch campaigns')
    }

    // Get campaign performance data
    const campaignsWithStats = await Promise.all(
      campaigns?.map(async (campaign) => {
        // Get payments for this campaign
        const { data: payments, error: paymentsError } = await supabase
          .from('payments')
          .select('amount, status')
          .eq('campaign_id', campaign.id)

        if (paymentsError) {
          console.error('Error fetching payments for campaign:', campaign.id, paymentsError)
          return {
            ...campaign,
            totalRevenue: 0,
            totalRevenueGHS: '0.00',
            totalPayments: 0,
            successfulPayments: 0,
            successRate: '0.0'
          }
        }

        const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0
        const totalPayments = payments?.length || 0
        const successfulPayments = payments?.filter(p => p.status === 'SUCCESS').length || 0
        const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0

        return {
          ...campaign,
          totalRevenue,
          totalRevenueGHS: (totalRevenue / 100).toFixed(2),
          totalPayments,
          successfulPayments,
          successRate: successRate.toFixed(1)
        }
      }) || []
    )

    // Sort by revenue
    campaignsWithStats.sort((a, b) => b.totalRevenue - a.totalRevenue)

    return NextResponse.json({
      success: true,
      report: {
        type: 'campaigns',
        period: { dateFrom, dateTo },
        campaigns: campaignsWithStats
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Campaigns report error:', error)
    return NextResponse.json({ error: 'Failed to generate campaigns report' }, { status: 500 })
  }
}

async function generateUsersReport(dateFrom: string, dateTo: string) {
  try {
    let usersQuery = supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (dateFrom) {
      usersQuery = usersQuery.gte('created_at', dateFrom)
    }
    if (dateTo) {
      usersQuery = usersQuery.lte('created_at', dateTo)
    }

    const { data: users, error: usersError } = await usersQuery

    if (usersError) {
      throw new Error('Failed to fetch users')
    }

    // Get user activity data
    const usersWithStats = await Promise.all(
      users?.map(async (user) => {
        // Get campaigns created by this user
        const { data: campaigns, error: campaignsError } = await supabase
          .from('campaigns')
          .select('id')
          .eq('organizer_id', user.id)

        if (campaignsError) {
          console.error('Error fetching campaigns for user:', user.id, campaignsError)
          return {
            ...user,
            campaignsCount: 0,
            totalRevenue: 0,
            totalRevenueGHS: '0.00',
            votesCount: 0
          }
        }

        // Get total revenue from user's campaigns
        const campaignIds = campaigns?.map(c => c.id) || []
        let totalRevenue = 0
        let votesCount = 0

        if (campaignIds.length > 0) {
          const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('amount, status')
            .in('campaign_id', campaignIds)
            .eq('status', 'SUCCESS')

          if (!paymentsError) {
            totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0
          }

          const { data: votes, error: votesError } = await supabase
            .from('votes')
            .select('id')
            .in('campaign_id', campaignIds)

          if (!votesError) {
            votesCount = votes?.length || 0
          }
        }

        return {
          ...user,
          campaignsCount: campaigns?.length || 0,
          totalRevenue,
          totalRevenueGHS: (totalRevenue / 100).toFixed(2),
          votesCount
        }
      }) || []
    )

    // Sort by revenue
    usersWithStats.sort((a, b) => b.totalRevenue - a.totalRevenue)

    return NextResponse.json({
      success: true,
      report: {
        type: 'users',
        period: { dateFrom, dateTo },
        users: usersWithStats
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Users report error:', error)
    return NextResponse.json({ error: 'Failed to generate users report' }, { status: 500 })
  }
}

async function generatePaymentsReport(dateFrom: string, dateTo: string, format: string) {
  try {
    let paymentsQuery = supabase
      .from('payments')
      .select(`
        id,
        amount,
        reference,
        status,
        method,
        voter_name,
        created_at,
      campaigns(
        title,
        users!campaigns_organizer_id_fkey(
          name
        )
      )
      `)
      .order('created_at', { ascending: false })

    if (dateFrom) {
      paymentsQuery = paymentsQuery.gte('created_at', dateFrom)
    }
    if (dateTo) {
      paymentsQuery = paymentsQuery.lte('created_at', dateTo)
    }

    const { data: payments, error: paymentsError } = await paymentsQuery

    if (paymentsError) {
      throw new Error('Failed to fetch payments')
    }

    const formattedPayments = payments?.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      amountGHS: (payment.amount / 100).toFixed(2),
      reference: payment.reference,
      status: payment.status,
      method: payment.method,
      voterName: payment.voter_name,
      campaignTitle: (payment.campaigns as any)?.title || 'Unknown',
      organizerName: (payment.campaigns as any)?.users?.name || 'Unknown',
      createdAt: payment.created_at
    })) || []

    if (format === 'csv') {
      // Generate CSV format
      const csvHeaders = 'ID,Amount (GHS),Reference,Status,Method,Voter,Campaign,Organizer,Created At\n'
      const csvRows = formattedPayments.map(p => 
        `${p.id},${p.amountGHS},${p.reference},${p.status},${p.method},${p.voterName},${p.campaignTitle},${p.organizerName},${p.createdAt}`
      ).join('\n')
      
      return new NextResponse(csvHeaders + csvRows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="payments-report.csv"'
        }
      })
    }

    return NextResponse.json({
      success: true,
      report: {
        type: 'payments',
        period: { dateFrom, dateTo },
        payments: formattedPayments
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Payments report error:', error)
    return NextResponse.json({ error: 'Failed to generate payments report' }, { status: 500 })
  }
}


