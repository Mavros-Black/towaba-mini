import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test the connection by querying the campaigns table
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*')
      .limit(3)
    
    if (campaignsError) {
      return NextResponse.json({
        success: false,
        message: 'Failed to query campaigns table',
        error: campaignsError.message,
        code: campaignsError.code
      }, { status: 500 })
    }

    // Test querying nominees
    const { data: nominees, error: nomineesError } = await supabase
      .from('nominees')
      .select('*')
      .limit(3)
    
    if (nomineesError) {
      return NextResponse.json({
        success: false,
        message: 'Failed to query nominees table',
        error: nomineesError.message,
        code: nomineesError.code
      }, { status: 500 })
    }

    // Test querying categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(3)
    
    if (categoriesError) {
      return NextResponse.json({
        success: false,
        message: 'Failed to query categories table',
        error: categoriesError.message,
        code: categoriesError.code
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection and database queries successful!',
      data: {
        campaigns: campaigns?.length || 0,
        nominees: nominees?.length || 0,
        categories: categories?.length || 0,
        sampleCampaign: campaigns?.[0],
        sampleNominee: nominees?.[0],
        sampleCategory: categories?.[0]
      },
      connection: 'Working with real tables!'
    })
    
  } catch (error) {
    console.error('Supabase test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Supabase connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
