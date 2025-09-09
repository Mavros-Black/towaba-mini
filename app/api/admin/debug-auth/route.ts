import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      authHeader: authHeader ? 'Present' : 'Missing',
      authHeaderValue: authHeader ? authHeader.substring(0, 20) + '...' : null,
      userAgent: request.headers.get('user-agent'),
      method: request.method,
      url: request.url
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'No valid auth header',
        debug: debugInfo
      }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token',
        details: authError?.message,
        debug: debugInfo
      }, { status: 401 })
    }

    // Check admin role
    const { data: adminRole, error: adminError } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      adminRole: adminRole || null,
      adminError: adminError?.message || null,
      debug: debugInfo
    }, { status: 200 })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
