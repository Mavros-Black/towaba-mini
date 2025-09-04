import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists in auth.users
    const { data: usersList, error: authCheckError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authCheckError) {
      console.error('Error checking existing user:', authCheckError)
      return NextResponse.json(
        { error: 'Failed to check existing user: ' + authCheckError.message },
        { status: 500 }
      )
    }
    
    const existingUser = usersList.users.find(user => user.email === email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create new user using Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name: name,
        role: 'organizer'
      },
      email_confirm: true // Auto-confirm email for organizers
    })

    if (authError) {
      console.error('Auth user creation error:', authError)
      return NextResponse.json(
        { error: 'Failed to create user: ' + authError.message },
        { status: 500 }
      )
    }

    // The trigger should automatically create the public.users record
    // Let's verify it was created
    const { data: publicUser, error: publicUserError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (publicUserError) {
      console.error('Public user creation error:', publicUserError)
      // If the trigger failed, create the record manually
      const { data: manualUser, error: manualError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: email,
          name: name
        })
        .select()
        .single()

      if (manualError) {
        console.error('Manual user creation error:', manualError)
        return NextResponse.json(
          { error: 'Failed to create user profile: ' + manualError.message },
          { status: 500 }
        )
      }
    }

    console.log('Organizer created successfully:', authData.user)

    return NextResponse.json({
      success: true,
      message: 'Organizer account created successfully',
      data: {
        id: authData.user.id,
        name: name,
        email: email
      }
    })

  } catch (error) {
    console.error('Organizer registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create organizer account: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
