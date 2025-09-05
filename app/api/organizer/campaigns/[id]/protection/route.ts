import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

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

    // Verify the campaign belongs to the authenticated user
    const { data: campaign, error: campaignCheckError } = await supabase
      .from('campaigns')
      .select('id, title, organizer_id, campaign_type, is_public')
      .eq('id', campaignId)
      .single()

    if (campaignCheckError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.organizer_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only check protection status for your own campaigns' },
        { status: 403 }
      )
    }

    // Check vote counts
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('id, nominee_id, status')
      .eq('campaign_id', campaignId)
      .eq('status', 'SUCCESS')

    if (votesError) {
      console.error('Error checking votes:', votesError)
      return NextResponse.json(
        { error: 'Failed to check campaign votes' },
        { status: 500 }
      )
    }

    const voteCount = votes?.length || 0
    const hasVotes = voteCount > 0

    // Get nominee protection status
    const { data: nominees, error: nomineesError } = await supabase
      .from('nominees')
      .select(`
        id,
        name,
        votes_count,
        category_id,
        categories!inner(name)
      `)
      .eq('campaign_id', campaignId)

    if (nomineesError) {
      console.error('Error checking nominees:', nomineesError)
      return NextResponse.json(
        { error: 'Failed to check campaign nominees' },
        { status: 500 }
      )
    }

    // Check which nominees have votes
    const nomineesWithVotes = nominees?.filter((nominee: any) => {
      const nomineeVotes = votes?.filter((vote: any) => vote.nominee_id === nominee.id) || []
      return nomineeVotes.length > 0
    }) || []

    // Get category protection status
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        nominees!inner(id)
      `)
      .eq('campaign_id', campaignId)

    if (categoriesError) {
      console.error('Error checking categories:', categoriesError)
      return NextResponse.json(
        { error: 'Failed to check campaign categories' },
        { status: 500 }
      )
    }

    // Check which categories have votes
    const categoriesWithVotes = categories?.filter((category: any) => {
      const categoryNominees = nominees?.filter((nominee: any) => nominee.category_id === category.id) || []
      const categoryVotes = votes?.filter((vote: any) => 
        categoryNominees.some((nominee: any) => nominee.id === vote.nominee_id)
      ) || []
      return categoryVotes.length > 0
    }) || []

    const protectionStatus = {
      campaign: {
        id: campaignId,
        title: campaign.title,
        hasVotes,
        voteCount,
        canDelete: !hasVotes,
        canChangeStructure: !hasVotes,
        canMakePrivate: !hasVotes,
        protectionReason: hasVotes 
          ? `Campaign has ${voteCount} votes` 
          : 'No votes - safe to modify'
      },
      nominees: nominees?.map((nominee: any) => {
        const nomineeVotes = votes?.filter((vote: any) => vote.nominee_id === nominee.id) || []
        const hasNomineeVotes = nomineeVotes.length > 0
        
        return {
          id: nominee.id,
          name: nominee.name,
          categoryName: nominee.categories?.[0]?.name || 'Unknown',
          hasVotes: hasNomineeVotes,
          voteCount: nomineeVotes.length,
          canDelete: !hasNomineeVotes,
          protectionReason: hasNomineeVotes 
            ? `Nominee has ${nomineeVotes.length} votes` 
            : 'No votes - safe to delete'
        }
      }) || [],
      categories: categories?.map((category: any) => {
        const categoryNominees = nominees?.filter((nominee: any) => nominee.category_id === category.id) || []
        const categoryVotes = votes?.filter((vote: any) => 
          categoryNominees.some((nominee: any) => nominee.id === vote.nominee_id)
        ) || []
        const hasCategoryVotes = categoryVotes.length > 0
        
        return {
          id: category.id,
          name: category.name,
          hasVotes: hasCategoryVotes,
          voteCount: categoryVotes.length,
          canDelete: !hasCategoryVotes,
          protectionReason: hasCategoryVotes 
            ? `Category has ${categoryVotes.length} votes` 
            : 'No votes - safe to delete'
        }
      }) || [],
      summary: {
        totalVotes: voteCount,
        protectedNominees: nomineesWithVotes.length,
        protectedCategories: categoriesWithVotes.length,
        isFullyProtected: hasVotes,
        canModifyStructure: !hasVotes
      }
    }

    return NextResponse.json({
      success: true,
      protection: protectionStatus
    })

  } catch (error) {
    console.error('Protection status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check protection status' },
      { status: 500 }
    )
  }
}
