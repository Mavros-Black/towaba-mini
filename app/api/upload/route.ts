import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase-auth'

export async function POST(request: NextRequest) {
  try {
    console.log('Upload request started')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'uploads'

    console.log('Upload request details:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      folder
    })

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${fileExtension}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log('Attempting to upload to Supabase Storage...')
    
    // Upload to Supabase Storage using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin.storage
      .from('campaign-images')
      .upload(`${folder}/${fileName}`, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
              return NextResponse.json(
          {
            error: 'Failed to upload file to Supabase Storage',
            details: error.message,
            code: 'unknown'
          },
          { status: 500 }
        )
    }

    console.log('File uploaded successfully to Supabase:', data)

    // Get public URL using admin client
    const { data: urlData } = supabaseAdmin.storage
      .from('campaign-images')
      .getPublicUrl(`${folder}/${fileName}`)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: `${folder}/${fileName}`,
      fileName: fileName
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
