import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

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

    // Check if user is admin
    const { data: adminRole, error: adminError } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (adminError || !adminRole) {
      return NextResponse.json(
        { error: 'Access denied: Admin privileges required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get admin actions history
    const { data: actions, error: actionsError } = await supabase
      .rpc('get_admin_actions', {
        admin_uuid: user.id,
        limit_count: limit,
        offset_count: offset
      })

    if (actionsError) {
      console.error('Error fetching admin actions:', actionsError)
      return NextResponse.json(
        { error: 'Failed to fetch admin actions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      actions: actions || [],
      pagination: {
        limit,
        offset,
        hasMore: (actions || []).length === limit
      }
    })

  } catch (error) {
    console.error('Admin actions fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin actions' },
      { status: 500 }
    )
  }
}
