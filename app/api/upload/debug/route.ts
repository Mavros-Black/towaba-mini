import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase-auth'

export async function POST(request: NextRequest) {
  try {
    console.log('Debug upload started')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'test'

    console.log('File received:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      folder
    })

    if (!file) {
      return NextResponse.json({
        error: 'No file provided',
        step: 'file_validation'
      }, { status: 400 })
    }

    // Test 1: File validation
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({
        error: 'Only image files are allowed',
        step: 'file_type_validation',
        fileType: file.type
      }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({
        error: 'File size must be less than 5MB',
        step: 'file_size_validation',
        fileSize: file.size
      }, { status: 400 })
    }

    console.log('File validation passed')

    // Test 2: Check storage bucket using admin client
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()
    
    if (bucketsError) {
      return NextResponse.json({
        error: 'Failed to list storage buckets',
        step: 'bucket_listing',
        details: bucketsError.message
      }, { status: 500 })
    }

    console.log('Available buckets:', buckets.map(b => b.id))

    const campaignImagesBucket = buckets.find(bucket => bucket.id === 'campaign-images')
    
    if (!campaignImagesBucket) {
      return NextResponse.json({
        error: 'campaign-images bucket not found',
        step: 'bucket_check',
        availableBuckets: buckets.map(b => b.id),
        message: 'Run the storage setup script in Supabase SQL Editor'
      }, { status: 404 })
    }

    console.log('Storage bucket found:', campaignImagesBucket)

    // Test 3: Generate filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${fileExtension}`

    console.log('Generated filename:', fileName)

    // Test 4: Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log('File converted to buffer, size:', buffer.length)

    // Test 5: Upload to Supabase Storage using admin client
    const { data, error } = await supabaseAdmin.storage
      .from('campaign-images')
      .upload(`${folder}/${fileName}`, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({
        error: 'Failed to upload file to storage',
        step: 'file_upload',
        details: error.message
      }, { status: 500 })
    }

    console.log('File uploaded successfully:', data)

    // Test 6: Get public URL using admin client
    const { data: urlData } = await supabaseAdmin.storage
      .from('campaign-images')
      .getPublicUrl(`${folder}/${fileName}`)

    console.log('Public URL generated:', urlData.publicUrl)

    return NextResponse.json({
      success: true,
      step: 'complete',
      url: urlData.publicUrl,
      path: `${folder}/${fileName}`,
      fileName: fileName,
      debug: {
        fileSize: file.size,
        fileType: file.type,
        bucket: campaignImagesBucket.id,
        uploadPath: `${folder}/${fileName}`
      }
    })

  } catch (error) {
    console.error('Debug upload error:', error)
    return NextResponse.json({
      error: 'Debug upload failed',
      step: 'exception',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
