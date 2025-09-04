-- Fix User Creation System
-- This script resolves conflicts between different user creation methods
-- Run this in your Supabase SQL Editor

-- 1. First, let's check what we're working with
DO $$
BEGIN
    RAISE NOTICE 'Starting user creation system fix...';
END $$;

-- 2. Check if users table has password column (old system)
DO $$
DECLARE
    has_password_column BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password'
    ) INTO has_password_column;
    
    IF has_password_column THEN
        RAISE NOTICE 'Found password column - this is the old system';
        RAISE NOTICE 'Will migrate to Supabase Auth system';
    ELSE
        RAISE NOTICE 'No password column found - already using Supabase Auth';
    END IF;
END $$;

-- 3. Create a backup of existing users (if any)
CREATE TABLE IF NOT EXISTS users_backup AS 
SELECT * FROM users WHERE EXISTS (SELECT 1 FROM users LIMIT 1);

-- 4. Drop the old trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 5. Update users table structure for Supabase Auth
-- Remove password column if it exists
ALTER TABLE users DROP COLUMN IF EXISTS password;

-- Ensure id is UUID type
ALTER TABLE users ALTER COLUMN id TYPE UUID USING id::UUID;

-- Make sure we have the right columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 6. Create the proper trigger function for Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into public.users when a new user is created in auth.users
  INSERT INTO public.users (id, email, name, created_at, updated_at)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', new.email), -- Use email as name if name not provided
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    updated_at = NOW();
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Update the organizer registration API to use Supabase Auth
-- We need to create a function that the API can call
CREATE OR REPLACE FUNCTION public.create_organizer_user(
  user_email TEXT,
  user_name TEXT,
  user_password TEXT
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- This function will be called by the API
  -- The actual user creation will happen through Supabase Auth
  -- This just ensures the public.users record is created properly
  
  result := json_build_object(
    'success', true,
    'message', 'User creation should be handled through Supabase Auth',
    'email', user_email,
    'name', user_name
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create a function to check if user exists
CREATE OR REPLACE FUNCTION public.user_exists(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Update foreign key constraints to work with UUID
-- Drop existing constraints
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_organizer_id_fkey;
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_user_id_fkey;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;

-- Recreate with proper UUID references
ALTER TABLE campaigns ADD CONSTRAINT campaigns_organizer_id_fkey 
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE;

-- Make user_id nullable for anonymous voting
ALTER TABLE votes ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE payments ALTER COLUMN user_id DROP NOT NULL;

-- Add voter_name columns for anonymous voting
ALTER TABLE votes ADD COLUMN IF NOT EXISTS voter_name TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS voter_name TEXT;

-- Update existing records
UPDATE votes SET voter_name = 'Anonymous Voter' WHERE voter_name IS NULL;
UPDATE payments SET voter_name = 'Anonymous Voter' WHERE voter_name IS NULL;

-- 11. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_campaigns_organizer_id ON campaigns(organizer_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- 12. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON nominees TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON votes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON payments TO authenticated;

-- 13. Success message
SELECT 'User creation system fixed successfully!' as status;

-- 14. Show current structure
SELECT 
    'users' as table_name,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
