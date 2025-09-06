import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params

    // Fetch campaign with organizer name
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        organizer:users!campaigns_organizer_id_fkey(name)
      `)
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Fetch categories with nominees
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select(`
        *,
        nominees:nominees(
          id,
          name,
          bio,
          image,
          votes_count
        )
      `)
      .eq('campaign_id', campaignId)
      .order('name')

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
      return NextResponse.json(
        { error: 'Failed to fetch campaign categories' },
        { status: 500 }
      )
    }

    // Transform the data to match the expected format
    const transformedCategories = categories?.map((category: any) => ({
      id: category.id,
      name: category.name,
      nominees: category.nominees || []
    })) || []

    return NextResponse.json({
      campaign: {
        ...campaign,
        categories: transformedCategories
      }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
