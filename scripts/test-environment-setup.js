// Test Environment Setup
// Run this with: node scripts/test-environment-setup.js

const { createClient } = require('@supabase/supabase-js')

console.log('🔍 Testing Supabase Environment Setup...\n')

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('📋 Environment Variables:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing')

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.log('\n❌ Missing required environment variables!')
  console.log('Please check your .env.local file and ensure all variables are set.')
  process.exit(1)
}

// Test Supabase client creation
try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
  
  console.log('\n✅ Supabase clients created successfully')
  
  // Test basic connection
  console.log('\n🔗 Testing connection...')
  
  // Test with regular client
  supabase.from('users').select('count').limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.log('❌ Regular client connection failed:', error.message)
      } else {
        console.log('✅ Regular client connection successful')
      }
    })
    .catch(err => {
      console.log('❌ Regular client connection error:', err.message)
    })
  
  // Test with admin client
  supabaseAdmin.from('users').select('count').limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.log('❌ Admin client connection failed:', error.message)
      } else {
        console.log('✅ Admin client connection successful')
      }
    })
    .catch(err => {
      console.log('❌ Admin client connection error:', err.message)
    })
    
} catch (error) {
  console.log('\n❌ Failed to create Supabase clients:', error.message)
  process.exit(1)
}

console.log('\n🎯 Environment setup test completed!')
console.log('If you see any ❌ errors above, please fix them before testing user creation.')
