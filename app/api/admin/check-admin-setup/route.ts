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
      .select('id')
      .limit(1)

    const tableExists = !tableError

    // Check if user is in admin_roles table
    let userIsAdmin = false
    let adminRole = null
    if (tableExists) {
      const { data: adminData, error: adminError } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (!adminError && adminData) {
        userIsAdmin = true
        adminRole = adminData
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email
      },
      adminSetup: {
        tableExists,
        userIsAdmin,
        adminRole,
        needsSetup: !tableExists || !userIsAdmin
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Admin setup check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
