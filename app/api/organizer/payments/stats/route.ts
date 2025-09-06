import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

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

    // Get organizer's campaigns
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('organizer_id', user.id)

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError)
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
    }

    const campaignIds = campaigns?.map((c: any) => c.id) || []

    if (campaignIds.length === 0) {
      return NextResponse.json({
        totalEarnings: 0,
        totalPlatformFees: 0,
        totalTransactions: 0,
        pendingPayouts: 0,
        processedPayouts: 0,
        commissionRate: 15,
        monthlyGrowth: 0,
        availableBalance: 0
      })
    }

    // Get successful votes/transactions for organizer's campaigns only
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('amount, status, created_at')
      .in('campaign_id', campaignIds)
      .eq('status', 'SUCCESS')

    if (votesError) {
      console.error('Error fetching votes:', votesError)
      return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 })
    }

    // Calculate stats from successful transactions only
    const totalRevenue = votes?.reduce((sum: number, v: any) => sum + (v.amount || 0), 0) || 0
    const totalEarnings = Math.floor(totalRevenue * 0.85) // 85% to organizer
    const totalPlatformFees = Math.floor(totalRevenue * 0.15) // 15% to platform
    const totalTransactions = votes?.length || 0
    const successfulTransactions = votes?.length || 0 // All votes here are successful

    // Get payout requests
    const { data: payouts, error: payoutsError } = await supabase
      .from('payout_requests')
      .select('amount, status')
      .eq('organizer_id', user.id)

    if (payoutsError) {
      console.error('Error fetching payouts:', payoutsError)
    }

    const pendingPayouts = payouts?.filter((p: any) => p.status === 'PENDING').reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0
    const processedPayouts = payouts?.filter((p: any) => p.status === 'PROCESSED').reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0
    const availableBalance = totalEarnings - processedPayouts - pendingPayouts

    // Calculate monthly growth (simplified)
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const currentMonthTransactions = votes?.filter((v: any) => {
      const date = new Date(v.created_at)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    }) || []

    const lastMonthTransactions = votes?.filter((v: any) => {
      const date = new Date(v.created_at)
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
    }) || []

    const currentMonthRevenue = currentMonthTransactions.reduce((sum: number, v: any) => sum + (v.amount || 0), 0)
    const lastMonthRevenue = lastMonthTransactions.reduce((sum: number, v: any) => sum + (v.amount || 0), 0)
    const monthlyGrowth = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

    return NextResponse.json({
      totalEarnings,
      totalPlatformFees,
      totalTransactions,
      pendingPayouts,
      processedPayouts,
      commissionRate: 15,
      monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
      availableBalance: Math.max(0, availableBalance)
    })

  } catch (error) {
    console.error('Error in payments stats API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
