import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'
import { generateUniqueUSSDCode } from '@/lib/ussd-codes'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Campaign creation request body:', body)
    
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

    if (campaignType === 'categorized' && (!categories || categories.length === 0)) {
      return NextResponse.json(
        { error: 'Categories are required for categorized campaigns' },
        { status: 400 }
      )
    }

    if (campaignType === 'simple' && (!directNominees || directNominees.length === 0)) {
      return NextResponse.json(
        { error: 'Nominees are required for simple campaigns' },
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

    const organizerId = user.id

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

    console.log('Campaign status determined:', {
      autoPublish,
      startDate,
      endDate,
      status: campaignStatus
    })

    // Create campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        title,
        description: description || null,
        cover_image: coverImage || null,
        start_date: startDate,
        end_date: endDate,
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
        organizer_id: user.id,
        status: campaignStatus
      })
      .select()
      .single()

    if (campaignError) {
      console.error('Campaign creation error:', campaignError)
      return NextResponse.json(
        { error: 'Failed to create campaign: ' + campaignError.message },
        { status: 500 }
      )
    }

    // Create categories and nominees based on campaign type
    if (campaignType === 'categorized') {
      // Create categories and nominees
      for (const categoryData of categories) {
        // Create category
        const { data: category, error: categoryError } = await supabase
          .from('categories')
          .insert({
            name: categoryData.name,
            campaign_id: campaign.id,
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

        // Create nominees for this category
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
              campaign_id: campaign.id,
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
      // For simple campaigns, we'll create a default "General" category
      const { data: defaultCategory, error: categoryError } = await supabase
        .from('categories')
        .insert({
          name: 'General',
          campaign_id: campaign.id,
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

      // Create nominees with the default category
      for (const nomineeData of directNominees) {
        // Generate unique USSD code for this nominee
        const ussdCode = await generateUniqueUSSDCode()
        
        const { error: nomineeError } = await supabase
          .from('nominees')
          .insert({
            name: nomineeData.name,
            bio: nomineeData.bio || null,
            image: nomineeData.image || null,
            category_id: defaultCategory.id, // Use default category
            campaign_id: campaign.id,
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

    console.log('Campaign created successfully:', campaign.id)

    return NextResponse.json({
      success: true,
      message: 'Campaign created successfully',
      data: {
        id: campaign.id,
        title: campaign.title,
        status: campaign.status
      }
    })

  } catch (error) {
    console.error('Campaign creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
      )
  }
}

export async function GET(request: NextRequest) {
  try {
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

    // Fetch campaigns for the authenticated organizer
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('organizer_id', user.id)
      .order('created_at', { ascending: false })


    if (error) {
      console.error('Error fetching campaigns:', error)
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      )
    }

    // Fetch counts for each campaign
    const campaignsWithCounts = await Promise.all(
      campaigns?.map(async (campaign: any) => {
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
          ...campaign,
          _count: {
            categories: categoriesCount || 0,
            nominees: nomineesCount || 0
          }
        }
      }) || []
    )

    return NextResponse.json({
      campaigns: campaignsWithCounts,
      total: campaignsWithCounts.length
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
