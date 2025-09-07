import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('Publish campaign request for ID:', id)

    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid authorization header')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    console.log('Token extracted:', token ? 'Present' : 'Missing')

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.log('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User authenticated:', user.id)

    // Check if campaign exists and belongs to user
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('organizer_id', user.id)
      .single()

    if (campaignError || !campaign) {
      console.log('Campaign not found or access denied:', campaignError)
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    console.log('Campaign found:', campaign.title, 'Status:', campaign.status)

    // Check if campaign is already published
    if (campaign.status === 'ACTIVE') {
      return NextResponse.json({ error: 'Campaign is already published' }, { status: 400 })
    }

    // Validate campaign has required data for publishing
    if (!campaign.title || !campaign.description) {
      return NextResponse.json({ 
        error: 'Campaign must have a title and description before publishing' 
      }, { status: 400 })
    }

    // Check if campaign has categories and nominees
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        nominees (
          id,
          name
        )
      `)
      .eq('campaign_id', id)

    if (categoriesError) {
      console.log('Error fetching categories:', categoriesError)
      return NextResponse.json({ error: 'Failed to validate campaign data' }, { status: 500 })
    }

    if (!categories || categories.length === 0) {
      return NextResponse.json({ 
        error: 'Campaign must have at least one category before publishing' 
      }, { status: 400 })
    }

    // Check if all categories have nominees
    for (const category of categories) {
      if (!category.nominees || category.nominees.length === 0) {
        return NextResponse.json({ 
          error: `Category "${category.name}" must have at least one nominee before publishing` 
        }, { status: 400 })
      }
    }

    // Update campaign status to ACTIVE
    const { data: updatedCampaign, error: updateError } = await supabase
      .from('campaigns')
      .update({ 
        status: 'ACTIVE',
        published_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organizer_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.log('Error updating campaign:', updateError)
      return NextResponse.json({ error: 'Failed to publish campaign' }, { status: 500 })
    }

    console.log('Campaign published successfully:', updatedCampaign.title)

    return NextResponse.json({
      success: true,
      message: 'Campaign published successfully',
      data: updatedCampaign
    })

  } catch (error) {
    console.error('Error in publish campaign API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
