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

    // Check if this user is in admin_roles table
    const { data: adminRole, error: adminError } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    return NextResponse.json({
      success: true,
      currentUser: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email
      },
      adminStatus: {
        isAdmin: !adminError && !!adminRole,
        adminRole: adminRole || null,
        error: adminError?.message || null
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Current user check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
