import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function POST(request: NextRequest) {
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

    if (tableError) {
      // Table doesn't exist, create it
      const { error: createTableError } = await supabase.rpc('create_admin_roles_table')
      
      if (createTableError) {
        console.error('Error creating admin_roles table:', createTableError)
        return NextResponse.json(
          { error: 'Failed to create admin roles table. Please run the admin setup SQL script first.' },
          { status: 500 }
        )
      }
    }

    // Check if user is already an admin
    const { data: existingAdmin, error: adminCheckError } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (adminCheckError && adminCheckError.code !== 'PGRST116') {
      console.error('Error checking admin status:', adminCheckError)
      return NextResponse.json(
        { error: 'Failed to check admin status' },
        { status: 500 }
      )
    }

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'User is already an admin',
        admin: existingAdmin
      })
    }

    // Create admin role for the user
    const { data: newAdmin, error: createAdminError } = await supabase
      .from('admin_roles')
      .insert({
        user_id: user.id,
        role: 'super_admin',
        permissions: {
          delete_campaigns: true,
          delete_nominees: true,
          modify_votes: true,
          view_audit_logs: true,
          manage_users: true
        },
        granted_by: user.id,
        is_active: true
      })
      .select()
      .single()

    if (createAdminError) {
      console.error('Error creating admin role:', createAdminError)
      return NextResponse.json(
        { error: 'Failed to create admin role' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Admin role created successfully',
      admin: newAdmin
    })

  } catch (error) {
    console.error('Admin setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}