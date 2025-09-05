import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase-auth'

export async function GET() {
  try {
    // Test storage bucket access using admin client
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()
    
    if (bucketsError) {
      return NextResponse.json({
        error: 'Failed to list buckets',
        details: bucketsError.message
      }, { status: 500 })
    }

    // Check if campaign-images bucket exists
    const campaignImagesBucket = buckets.find((bucket: any) => bucket.id === 'campaign-images')
    
    if (!campaignImagesBucket) {
      return NextResponse.json({
        error: 'campaign-images bucket not found',
        availableBuckets: buckets.map((b: any) => b.id),
        message: 'Run the setup-storage.sql script in Supabase SQL Editor'
      }, { status: 404 })
    }

    // Test bucket permissions using admin client
    const { data: testList, error: listError } = await supabaseAdmin.storage
      .from('campaign-images')
      .list('test', { limit: 1 })

    return NextResponse.json({
      success: true,
      bucket: campaignImagesBucket,
      permissions: listError ? 'Error listing files: ' + listError.message : 'Can list files',
      message: 'Storage bucket is accessible'
    })

  } catch (error) {
    console.error('Storage test error:', error)
    return NextResponse.json({
      error: 'Storage test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
