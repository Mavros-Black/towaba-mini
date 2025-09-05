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
        organizer_id
      `)
      .eq('is_public', true)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database query failed:', error)
      
      // Fallback to mock data if database fails
      const mockCampaigns = [
        {
          id: '1',
          title: 'Sample Campaign',
          description: 'This is a sample campaign for testing',
          image_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount_per_vote: 100,
          is_public: true,
          status: 'active',
          created_at: new Date().toISOString(),
          organizer: { name: 'Sample Organizer', email: 'sample@example.com' },
          categories: ['General'],
          nominees: [],
          total_votes: 0
        }
      ]
      
      return NextResponse.json({
        campaigns: mockCampaigns,
        total: mockCampaigns.length,
        note: 'Using mock data due to database error'
      })
    }

    console.log('Real campaigns fetched:', campaigns?.length || 0)
    console.log('First campaign sample:', campaigns?.[0])

    // Transform database data to match frontend expectations
    const transformedCampaigns = (campaigns || []).map((campaign: any) => ({
      id: campaign.id,
      title: campaign.title || 'Untitled Campaign',
      description: campaign.description || 'No description available',
      image_url: campaign.cover_image || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop',
      start_date: campaign.start_date || new Date().toISOString(),
      end_date: campaign.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount_per_vote: campaign.amount_per_vote || 100,
      is_public: campaign.is_public,
      status: campaign.status?.toLowerCase() || 'active',
      created_at: campaign.created_at || new Date().toISOString(),
      organizer: { name: 'Organizer', email: 'organizer@example.com' }, // Placeholder for now
      categories: [], // Will add categories next
      nominees: [], // Will add nominees next
      total_votes: 0 // Will calculate vote counts next
    }))

    return NextResponse.json({
      campaigns: transformedCampaigns,
      total: transformedCampaigns.length,
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
