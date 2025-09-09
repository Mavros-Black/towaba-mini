import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function GET(request: NextRequest) {
  try {
    // Check if admin_roles table exists
    const { data, error } = await supabase
      .from('admin_roles')
      .select('*')
      .limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        tableExists: false,
        error: error.message,
        code: error.code
      }, { status: 200 })
    }

    return NextResponse.json({
      success: true,
      tableExists: true,
      sampleData: data
    }, { status: 200 })

  } catch (error) {
    console.error('Admin table check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to check admin_roles table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
