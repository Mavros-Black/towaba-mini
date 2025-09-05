import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'
import { generateUniqueUSSDCode } from '@/lib/ussd-codes'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id

    console.log('Fetching campaign with ID:', campaignId)
    
    // First, let's check what columns actually exist in the campaigns table
    const { data: columns, error: columnsError } = await supabase
      .from('campaigns')
      .select('*')
      .limit(1)
    
    if (columnsError) {
      console.error('Error checking table structure:', columnsError)
    } else {
      console.log('Available columns in campaigns table:', Object.keys(columns?.[0] || {}))
      console.log('Sample campaign data:', columns?.[0])
    }
    
    // Fetch campaign with categories and nominees
    const { data: campaign, error: campaignError } = await supabase
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
        allow_anonymous_voting,
        max_votes_per_user,
        campaign_type,
        require_payment,
        payment_methods,
        auto_publish,
        allow_editing,
        show_vote_counts,
        show_voter_names,
        status,
        created_at,
        organizer_id,
        categories:categories(
          id,
          name,
          nominees:nominees(
            id,
            name,
            bio,
            image,
            votes_count
          )
        )
      `)
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      console.error('Campaign fetch error:', campaignError)
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    console.log('Campaign fetched successfully:', {
      id: campaign.id,
      title: campaign.title,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      amount_per_vote: campaign.amount_per_vote,
      is_public: campaign.is_public,
      categoriesCount: campaign.categories?.length || 0,
      firstCategory: campaign.categories?.[0]
    })

    return NextResponse.json({
      success: true,
      campaign
    })

  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    const body = await request.json()
    const { 
      title, 
      description, 
      coverImage, 
      startDate,
      endDate,
      amountPerVote,
      isPublic,
      allowAnonymousVoting,
      maxVotesPerUser,
      campaignType, 
      requirePayment,
      paymentMethods,
      autoPublish,
      allowEditing,
      showVoteCounts,
      showVoterNames,
      categories, 
      directNominees 
    } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

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
    const { data: existingCampaign, error: campaignCheckError } = await supabase
      .from('campaigns')
      .select('id, organizer_id')
      .eq('id', campaignId)
      .single()

    if (campaignCheckError || !existingCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (existingCampaign.organizer_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own campaigns' },
        { status: 403 }
      )
    }

    // Check if campaign has votes - if so, prevent major structural changes
    const { data: votes, error: votesCheckError } = await supabase
      .from('votes')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('status', 'SUCCESS')

    if (votesCheckError) {
      console.error('Error checking votes:', votesCheckError)
      return NextResponse.json(
        { error: 'Failed to check campaign votes' },
        { status: 500 }
      )
    }

    const hasVotes = votes && votes.length > 0

    // If campaign has votes, prevent certain changes
    if (hasVotes) {
      // Prevent campaign type changes
      if ((existingCampaign as any).campaign_type !== campaignType) {
        return NextResponse.json(
          { 
            error: `Cannot change campaign type from "${(existingCampaign as any).campaign_type}" to "${campaignType}" - campaign has ${votes.length} votes. Campaign structure cannot be changed once voting begins.`,
            voteCount: votes.length,
            canChangeStructure: false
          },
          { status: 400 }
        )
      }

      // Prevent making campaign private if it was public
      if ((existingCampaign as any).is_public === true && !isPublic) {
        return NextResponse.json(
          { 
            error: `Cannot make campaign private - it has ${votes.length} votes. Campaign visibility cannot be changed once voting begins.`,
            voteCount: votes.length,
            canMakePrivate: false
          },
          { status: 400 }
        )
      }
    }

    // Determine campaign status based on dates and autoPublish setting
    let campaignStatus = 'DRAFT'
    
    if (autoPublish && startDate) {
      const now = new Date()
      const start = new Date(startDate)
      
      if (now >= start) {
        // If start date has passed, campaign can be ACTIVE
        if (endDate) {
          const end = new Date(endDate)
          campaignStatus = now > end ? 'ENDED' : 'ACTIVE'
        } else {
          campaignStatus = 'ACTIVE'
        }
      } else {
        // If start date is in the future, campaign is SCHEDULED
        campaignStatus = 'SCHEDULED'
      }
    } else if (autoPublish && !startDate) {
      // If autoPublish is true but no start date, set to DRAFT
      campaignStatus = 'DRAFT'
    }

    console.log('Campaign status determined for update:', {
      autoPublish,
      startDate,
      endDate,
      status: campaignStatus
    })

    // Update campaign
    const { data: updatedCampaign, error: campaignUpdateError } = await supabase
      .from('campaigns')
      .update({
        title,
        description: description || null,
        cover_image: coverImage || null,
        start_date: startDate || null,
        end_date: endDate || null,
        amount_per_vote: amountPerVote ? Math.round(amountPerVote * 100) : null, // Convert GHS to pesewas
        is_public: isPublic,
        allow_anonymous_voting: allowAnonymousVoting,
        max_votes_per_user: maxVotesPerUser,
        campaign_type: campaignType,
        require_payment: requirePayment,
        payment_methods: paymentMethods,
        auto_publish: autoPublish,
        allow_editing: allowEditing,
        show_vote_counts: showVoteCounts,
        show_voter_names: showVoterNames,
        status: campaignStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)
      .select()
      .single()

    if (campaignUpdateError) {
      console.error('Campaign update error:', campaignUpdateError)
      return NextResponse.json(
        { error: 'Failed to update campaign: ' + campaignUpdateError.message },
        { status: 500 }
      )
    }

    // Delete existing categories and nominees
    const { error: deleteNomineesError } = await supabase
      .from('nominees')
      .delete()
      .eq('campaign_id', campaignId)

    if (deleteNomineesError) {
      console.error('Error deleting existing nominees:', deleteNomineesError)
      return NextResponse.json(
        { error: 'Failed to delete existing nominees: ' + deleteNomineesError.message },
        { status: 500 }
      )
    }

    const { error: deleteCategoriesError } = await supabase
      .from('categories')
      .delete()
      .eq('campaign_id', campaignId)

    if (deleteCategoriesError) {
      console.error('Error deleting existing categories:', deleteCategoriesError)
      return NextResponse.json(
        { error: 'Failed to delete existing categories: ' + deleteCategoriesError.message },
        { status: 500 }
      )
    }

    // Create new categories and nominees based on campaign type
    if (campaignType === 'categorized') {
      for (const categoryData of categories) {
        const { data: category, error: categoryError } = await supabase
          .from('categories')
          .insert({
            name: categoryData.name,
            campaign_id: campaignId,
          })
          .select()
          .single()

        if (categoryError) {
          console.error('Category creation error:', categoryError)
          return NextResponse.json(
            { error: 'Failed to create category: ' + categoryError.message },
            { status: 500 }
          )
        }

        for (const nomineeData of categoryData.nominees) {
          // Generate unique USSD code for this nominee
          const ussdCode = await generateUniqueUSSDCode()
          
          const { error: nomineeError } = await supabase
            .from('nominees')
            .insert({
              name: nomineeData.name,
              bio: nomineeData.bio || null,
              image: nomineeData.image || null,
              category_id: category.id,
              campaign_id: campaignId,
              votes_count: 0,
              ussd_code: ussdCode,
            })

          if (nomineeError) {
            console.error('Nominee creation error:', nomineeError)
            return NextResponse.json(
              { error: 'Failed to create nominee: ' + nomineeError.message },
              { status: 500 }
            )
          }
        }
      }
    } else {
      // Create direct nominees for simple campaigns
      const { data: defaultCategory, error: categoryError } = await supabase
        .from('categories')
        .insert({
          name: 'General',
          campaign_id: campaignId,
        })
        .select()
        .single()

      if (categoryError) {
        console.error('Default category creation error:', categoryError)
        return NextResponse.json(
          { error: 'Failed to create default category: ' + categoryError.message },
          { status: 500 }
        )
      }

      for (const nomineeData of directNominees) {
        // Generate unique USSD code for this nominee
        const ussdCode = await generateUniqueUSSDCode()
        
        const { error: nomineeError } = await supabase
          .from('nominees')
          .insert({
            name: nomineeData.name,
            bio: nomineeData.bio || null,
            image: nomineeData.image || null,
            category_id: defaultCategory.id,
            campaign_id: campaignId,
            votes_count: 0,
            ussd_code: ussdCode,
          })

        if (nomineeError) {
          console.error('Nominee creation error:', nomineeError)
          return NextResponse.json(
            { error: 'Failed to create nominee: ' + nomineeError.message },
            { status: 500 }
          )
        }
      }
    }

    console.log('Campaign updated successfully:', campaignId)

    return NextResponse.json({
      success: true,
      message: 'Campaign updated successfully',
      campaign: updatedCampaign
    })

  } catch (error) {
    console.error('Campaign update error:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
      .select('id, organizer_id')
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
        { error: 'You can only delete your own campaigns' },
        { status: 403 }
      )
    }

    // Check if campaign has votes - if so, prevent deletion
    const { data: votes, error: votesCheckError } = await supabase
      .from('votes')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('status', 'SUCCESS')

    if (votesCheckError) {
      console.error('Error checking votes:', votesCheckError)
      return NextResponse.json(
        { error: 'Failed to check campaign votes' },
        { status: 500 }
      )
    }

    if (votes && votes.length > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete campaign - it has ${votes.length} votes. Campaigns with votes cannot be deleted to protect voting data integrity.`,
          voteCount: votes.length,
          canDelete: false
        },
        { status: 400 }
      )
    }

    // Delete related records in the correct order to avoid foreign key constraint violations
    // Order: votes -> payments -> nominees -> categories -> campaign

    // 1. Delete votes for all nominees in this campaign
    const { error: votesDeleteError } = await supabase
      .from('votes')
      .delete()
      .in('campaign_id', [campaignId])

    if (votesDeleteError) {
      console.error('Error deleting votes:', votesDeleteError)
      return NextResponse.json(
        { error: 'Failed to delete campaign votes: ' + votesDeleteError.message },
        { status: 500 }
      )
    }

    // 2. Delete payments for this campaign
    const { error: paymentsDeleteError } = await supabase
      .from('payments')
      .delete()
      .eq('campaign_id', campaignId)

    if (paymentsDeleteError) {
      console.error('Error deleting payments:', paymentsDeleteError)
      return NextResponse.json(
        { error: 'Failed to delete campaign payments: ' + paymentsDeleteError.message },
        { status: 500 }
      )
    }

    // 3. Delete nominees for this campaign
    const { error: nomineesDeleteError } = await supabase
      .from('nominees')
      .delete()
      .eq('campaign_id', campaignId)

    if (nomineesDeleteError) {
      console.error('Error deleting nominees:', nomineesDeleteError)
      return NextResponse.json(
        { error: 'Failed to delete campaign nominees: ' + nomineesDeleteError.message },
        { status: 500 }
      )
    }

    // 4. Delete categories for this campaign
    const { error: categoriesDeleteError } = await supabase
      .from('categories')
      .delete()
      .eq('campaign_id', campaignId)

    if (categoriesDeleteError) {
      console.error('Error deleting categories:', categoriesDeleteError)
      return NextResponse.json(
        { error: 'Failed to delete campaign categories: ' + categoriesDeleteError.message },
        { status: 500 }
      )
    }

    // 5. Finally, delete the campaign itself
    const { error: campaignDeleteError } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId)

    if (campaignDeleteError) {
      console.error('Error deleting campaign:', campaignDeleteError)
      return NextResponse.json(
        { error: 'Failed to delete campaign: ' + campaignDeleteError.message },
        { status: 500 }
      )
    }

    console.log('Campaign and all related data deleted successfully:', campaignId)

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully',
      deletedCampaignId: campaignId
    })

  } catch (error) {
    console.error('Campaign deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
