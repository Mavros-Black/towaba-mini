import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const updateData = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prepare update object with only provided fields
    const updateFields: any = {
      updated_at: new Date().toISOString()
    }

    // Add fields if they exist in the request
    if (updateData.title !== undefined) updateFields.title = updateData.title
    if (updateData.description !== undefined) updateFields.description = updateData.description
    if (updateData.status !== undefined) {
      if (!['DRAFT', 'PENDING', 'ACTIVE', 'COMPLETED', 'REJECTED', 'SUSPENDED'].includes(updateData.status)) {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
      }
      updateFields.status = updateData.status
    }
    if (updateData.start_date !== undefined) updateFields.start_date = updateData.start_date
    if (updateData.end_date !== undefined) updateFields.end_date = updateData.end_date

    // Update the campaign
    const { data, error } = await supabase
      .from('campaigns')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating campaign:', error)
      return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Campaign updated successfully',
      campaign: data 
    }, { status: 200 })

  } catch (error) {
    console.error('Campaign update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 })
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete the campaign
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting campaign:', error)
      return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Campaign deleted successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Campaign delete API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
