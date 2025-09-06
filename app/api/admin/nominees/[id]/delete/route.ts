import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: nomineeId } = await params
    const { reason } = await request.json()

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { error: 'Reason is required and must be at least 10 characters long' },
        { status: 400 }
      )
    }

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

    // Check if admin has delete permission
    const permissions = adminRole.permissions as any
    if (!permissions?.delete_nominees && adminRole.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Access denied: Insufficient permissions to delete nominees' },
        { status: 403 }
      )
    }

    // Get client IP and user agent for audit trail
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Call the admin delete function
    const { data: result, error: deleteError } = await supabase
      .rpc('admin_delete_nominee', {
        admin_uuid: user.id,
        nominee_uuid: nomineeId,
        reason: reason.trim(),
        ip_address: ipAddress,
        user_agent: userAgent
      })

    if (deleteError) {
      console.error('Admin delete nominee error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete nominee: ' + deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Nominee deleted successfully by admin override',
      data: result
    })

  } catch (error) {
    console.error('Admin delete nominee error:', error)
    return NextResponse.json(
      { error: 'Failed to delete nominee' },
      { status: 500 }
    )
  }
}
