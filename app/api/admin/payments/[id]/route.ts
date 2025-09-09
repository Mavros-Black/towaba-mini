import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Authentication check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No valid auth header found' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 })
    }

    // Check admin role
    const { data: adminRole, error: adminError } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (adminError || !adminRole) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get payment details with related data
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        reference,
        status,
        method,
        voter_name,
        metadata,
        created_at,
        updated_at,
        campaigns!inner(
          id,
          title,
          organizer_id,
          users!campaigns_organizer_id_fkey(
            id,
            name,
            email
          )
        ),
        votes(
          id,
          nominee_id,
          amount,
          status,
          created_at,
          nominees(
            id,
            name,
            categories(
              id,
              name
            )
          )
        )
      `)
      .eq('id', id)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Format the response
    const formattedPayment = {
      id: payment.id,
      amount: payment.amount,
      amountGHS: (payment.amount / 100).toFixed(2),
      reference: payment.reference,
      status: payment.status,
      method: payment.method,
      voterName: payment.voter_name,
      metadata: payment.metadata,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
      campaign: {
        id: payment.campaigns.id,
        title: payment.campaigns.title,
        organizer: {
          id: payment.campaigns.users.id,
          name: payment.campaigns.users.name,
          email: payment.campaigns.users.email
        }
      },
      votes: payment.votes?.map(vote => ({
        id: vote.id,
        amount: vote.amount,
        amountGHS: (vote.amount / 100).toFixed(2),
        status: vote.status,
        createdAt: vote.created_at,
        nominee: {
          id: vote.nominees.id,
          name: vote.nominees.name,
          category: {
            id: vote.nominees.categories.id,
            name: vote.nominees.categories.name
          }
        }
      })) || []
    }

    return NextResponse.json({
      success: true,
      payment: formattedPayment
    }, { status: 200 })

  } catch (error) {
    console.error('Payment details API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, notes, action } = body

    // Authentication check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No valid auth header found' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 })
    }

    // Check admin role
    const { data: adminRole, error: adminError } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (adminError || !adminRole) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get current payment
    const { data: currentPayment, error: currentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single()

    if (currentError || !currentPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Handle different actions
    if (action === 'verify') {
      // Verify payment - mark as successful
      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'SUCCESS',
          updated_at: new Date().toISOString(),
          metadata: {
            ...currentPayment.metadata,
            adminVerified: true,
            verifiedBy: user.id,
            verifiedAt: new Date().toISOString(),
            adminNotes: notes || ''
          }
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        console.error('Payment update error:', updateError)
        return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
      }

      // Update related votes to SUCCESS
      const { error: votesError } = await supabase
        .from('votes')
        .update({
          status: 'SUCCESS',
          updated_at: new Date().toISOString()
        })
        .eq('payment_id', id)

      if (votesError) {
        console.error('Votes update error:', votesError)
        // Don't fail the request, just log the error
      }

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        payment: updatedPayment
      }, { status: 200 })

    } else if (action === 'reject') {
      // Reject payment - mark as failed
      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'FAILED',
          updated_at: new Date().toISOString(),
          metadata: {
            ...currentPayment.metadata,
            adminRejected: true,
            rejectedBy: user.id,
            rejectedAt: new Date().toISOString(),
            adminNotes: notes || ''
          }
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        console.error('Payment update error:', updateError)
        return NextResponse.json({ error: 'Failed to reject payment' }, { status: 500 })
      }

      // Update related votes to FAILED
      const { error: votesError } = await supabase
        .from('votes')
        .update({
          status: 'FAILED',
          updated_at: new Date().toISOString()
        })
        .eq('payment_id', id)

      if (votesError) {
        console.error('Votes update error:', votesError)
        // Don't fail the request, just log the error
      }

      return NextResponse.json({
        success: true,
        message: 'Payment rejected successfully',
        payment: updatedPayment
      }, { status: 200 })

    } else if (action === 'refund') {
      // Process refund
      if (currentPayment.status !== 'SUCCESS') {
        return NextResponse.json({ error: 'Can only refund successful payments' }, { status: 400 })
      }

      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'REFUNDED',
          updated_at: new Date().toISOString(),
          metadata: {
            ...currentPayment.metadata,
            refunded: true,
            refundedBy: user.id,
            refundedAt: new Date().toISOString(),
            refundNotes: notes || ''
          }
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        console.error('Payment update error:', updateError)
        return NextResponse.json({ error: 'Failed to process refund' }, { status: 500 })
      }

      // Update related votes to REFUNDED
      const { error: votesError } = await supabase
        .from('votes')
        .update({
          status: 'REFUNDED',
          updated_at: new Date().toISOString()
        })
        .eq('payment_id', id)

      if (votesError) {
        console.error('Votes update error:', votesError)
        // Don't fail the request, just log the error
      }

      return NextResponse.json({
        success: true,
        message: 'Refund processed successfully',
        payment: updatedPayment
      }, { status: 200 })

    } else if (action === 'update_status') {
      // Update payment status
      if (!status || !['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }

      const { data: updatedPayment, error: updateError } = await supabase
        .from('payments')
        .update({
          status,
          updated_at: new Date().toISOString(),
          metadata: {
            ...currentPayment.metadata,
            statusUpdatedBy: user.id,
            statusUpdatedAt: new Date().toISOString(),
            adminNotes: notes || ''
          }
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        console.error('Payment update error:', updateError)
        return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 })
      }

      // Update related votes status
      const { error: votesError } = await supabase
        .from('votes')
        .update({
          status: status === 'SUCCESS' ? 'SUCCESS' : status === 'FAILED' ? 'FAILED' : 'PENDING',
          updated_at: new Date().toISOString()
        })
        .eq('payment_id', id)

      if (votesError) {
        console.error('Votes update error:', votesError)
        // Don't fail the request, just log the error
      }

      return NextResponse.json({
        success: true,
        message: 'Payment status updated successfully',
        payment: updatedPayment
      }, { status: 200 })

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Payment update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
