import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function GET() {
  try {
    console.log('Public campaigns API called')
    
    // First, let's see what columns actually exist in the campaigns table
    console.log('Checking campaigns table structure...')
    
    // Try to fetch real campaigns from database - only ACTIVE and PUBLIC campaigns
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        id,
        title,
        description,
        cover_image,
        start_date,
        end_date,
        amount_per_vote,
        is_public,
        status,
        created_at,
        organizer_id,
        users!campaigns_organizer_id_fkey (
          name
        )
      `)
      .eq('is_public', true)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database query failed:', error)
      return NextResponse.json(
        { error: 'Failed to fetch campaigns from database' },
        { status: 500 }
      )
    }

    console.log('Real campaigns fetched:', campaigns?.length || 0)
    console.log('First campaign sample:', campaigns?.[0])

    // Fetch counts for each campaign
    const campaignsWithCounts = await Promise.all(
      (campaigns || []).map(async (campaign: any) => {
        // Get categories count
        const { count: categoriesCount } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id)

        // Get nominees count
        const { count: nomineesCount } = await supabase
          .from('nominees')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id)

        return {
          id: campaign.id,
          title: campaign.title || 'Untitled Campaign',
          description: campaign.description || 'No description available',
          cover_image: campaign.cover_image || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop',
          start_date: campaign.start_date || new Date().toISOString(),
          end_date: campaign.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount_per_vote: campaign.amount_per_vote || 100,
          is_public: campaign.is_public,
          status: campaign.status?.toLowerCase() || 'active',
          created_at: campaign.created_at || new Date().toISOString(),
          organizer: campaign.users || { name: 'Unknown Organizer' },
          _count: {
            categories: categoriesCount || 0,
            nominees: nomineesCount || 0
          }
        }
      })
    )

    return NextResponse.json({
      campaigns: campaignsWithCounts,
      total: campaignsWithCounts.length,
      note: 'Real data from database'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
