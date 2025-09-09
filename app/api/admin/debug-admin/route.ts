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

    // Check if admin_roles table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('admin_roles')
      .select('*')
      .limit(1)

    if (tableError) {
      return NextResponse.json({
        debug: {
          user_id: user.id,
          user_email: user.email,
          table_exists: false,
          table_error: tableError.message
        }
      })
    }

    // Check if user has admin role
    const { data: adminRole, error: adminError } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    // Get all admin roles for debugging
    const { data: allAdmins, error: allAdminsError } = await supabase
      .from('admin_roles')
      .select('*')

    return NextResponse.json({
      debug: {
        user_id: user.id,
        user_email: user.email,
        table_exists: true,
        has_admin_role: !!adminRole,
        admin_role: adminRole,
        admin_error: adminError?.message,
        all_admins: allAdmins,
        all_admins_error: allAdminsError?.message
      }
    })

  } catch (error) {
    console.error('Debug admin error:', error)
    return NextResponse.json(
      { error: 'Debug failed', details: error.message },
      { status: 500 }
    )
  }
}
