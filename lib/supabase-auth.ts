import { createClient } from '@supabase/supabase-js'

// Lazy initialization to avoid build-time errors
let _supabase: any = null
let _supabaseAdmin: any = null

function getSupabaseClient() {
  if (_supabase) return _supabase
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time, return a mock client to avoid errors
    if (process.env.NODE_ENV === 'production' && !process.env.NETLIFY) {
      throw new Error('Missing Supabase environment variables')
    }
    
    // For build time, return a mock client
    _supabase = {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signIn: () => Promise.resolve({ data: null, error: null }),
        signUp: () => Promise.resolve({ data: null, error: null }),
        signOut: () => Promise.resolve({ error: null })
      },
      from: () => ({
        select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
        delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) })
      })
    }
    return _supabase
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
  return _supabase
}

function getSupabaseAdminClient() {
  if (_supabaseAdmin) return _supabaseAdmin
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    // During build time, return a mock client to avoid errors
    if (process.env.NODE_ENV === 'production' && !process.env.NETLIFY) {
      throw new Error('Missing Supabase environment variables')
    }
    
    // For build time, return a mock client
    _supabaseAdmin = {
      auth: {
        admin: {
          createUser: () => Promise.resolve({ data: { user: null }, error: null }),
          listUsers: () => Promise.resolve({ data: { users: [] }, error: null })
        }
      },
      from: () => ({
        select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
        delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) })
      })
    }
    return _supabaseAdmin
  }

  _supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  return _supabaseAdmin
}

// Export clients with lazy initialization
export const supabase = getSupabaseClient()
export const supabaseAdmin = getSupabaseAdminClient()
