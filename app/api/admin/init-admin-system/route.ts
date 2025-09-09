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

    // Try to create the admin_roles table if it doesn't exist
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS admin_roles (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        permissions JSONB DEFAULT '{}',
        granted_by UUID REFERENCES auth.users(id),
        granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    })

    if (createTableError) {
      console.log('Table creation error (might already exist):', createTableError.message)
    }

    // First, try to delete any existing admin role for this user
    await supabase
      .from('admin_roles')
      .delete()
      .eq('user_id', user.id)

    // Then insert the new admin role
    const { data: newAdmin, error: insertError } = await supabase
      .from('admin_roles')
      .insert({
        user_id: user.id,
        role: 'super_admin',
        permissions: {
          delete_campaigns: true,
          delete_nominees: true,
          modify_votes: true,
          view_audit_logs: true,
          manage_users: true,
          manage_campaigns: true
        },
        granted_by: user.id,
        is_active: true
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating admin role:', insertError)
      return NextResponse.json(
        { error: 'Failed to create admin role: ' + insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Admin system initialized successfully',
      admin: newAdmin
    })

  } catch (error) {
    console.error('Admin system init error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize admin system', details: error.message },
      { status: 500 }
    )
  }
}
