import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function POST(request: NextRequest) {
  try {
    const { fromNomineeId, toNomineeId, reason } = await request.json()

    if (!fromNomineeId || !toNomineeId || !reason) {
      return NextResponse.json(
        { error: 'fromNomineeId, toNomineeId, and reason are required' },
        { status: 400 }
      )
    }

    if (reason.trim().length < 10) {
      return NextResponse.json(
        { error: 'Reason must be at least 10 characters long' },
        { status: 400 }
      )
    }

    if (fromNomineeId === toNomineeId) {
      return NextResponse.json(
        { error: 'Cannot transfer votes to the same nominee' },
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

    // Check if admin has modify permission
    const permissions = adminRole.permissions as any
    if (!permissions?.modify_votes && adminRole.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Access denied: Insufficient permissions to modify votes' },
        { status: 403 }
      )
    }

    // Get client IP and user agent for audit trail
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Call the admin transfer function
    const { data: result, error: transferError } = await supabase
      .rpc('admin_transfer_votes', {
        admin_uuid: user.id,
        from_nominee_uuid: fromNomineeId,
        to_nominee_uuid: toNomineeId,
        reason: reason.trim(),
        ip_address: ipAddress,
        user_agent: userAgent
      })

    if (transferError) {
      console.error('Admin transfer votes error:', transferError)
      return NextResponse.json(
        { error: 'Failed to transfer votes: ' + transferError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Votes transferred successfully by admin override',
      data: result
    })

  } catch (error) {
    console.error('Admin transfer votes error:', error)
    return NextResponse.json(
      { error: 'Failed to transfer votes' },
      { status: 500 }
    )
  }
}
