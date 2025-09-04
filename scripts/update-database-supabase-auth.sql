-- Update Database for Supabase Authentication + Anonymous Voting
-- Run this in your Supabase SQL Editor

-- First, enable the auth schema if not already enabled
-- This should be enabled by default in Supabase

-- Update the users table to work with Supabase Auth
-- Remove the password column since Supabase handles authentication
ALTER TABLE users DROP COLUMN IF EXISTS password;

-- Make sure the users table has the right structure for Supabase Auth
-- The id should be UUID and match the auth.users.id
ALTER TABLE users ALTER COLUMN id TYPE UUID USING id::UUID;

-- Drop the existing foreign key constraints for payments and votes
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_user_id_fkey;

-- Keep the campaigns organizer_id constraint (organizers must be registered)
-- This ensures only real users can create campaigns

-- Make user_id columns nullable for payments and votes (anonymous voting)
ALTER TABLE payments ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE votes ALTER COLUMN user_id DROP NOT NULL;

-- Add voter_name column to votes for anonymous voting
ALTER TABLE votes ADD COLUMN IF NOT EXISTS voter_name TEXT;

-- Make voter_name required for new votes
ALTER TABLE votes ALTER COLUMN voter_name SET NOT NULL;

-- Update existing votes to have default voter names
UPDATE votes 
SET voter_name = 'Anonymous Voter' 
WHERE voter_name IS NULL;

-- Add voter_name column to payments for anonymous voting
ALTER TABLE payments ADD COLUMN IF NOT EXISTS voter_name TEXT;

-- Make voter_name required for new payments
ALTER TABLE payments ALTER COLUMN voter_name SET NOT NULL;

-- Update existing payments to have default voter names
UPDATE payments 
SET voter_name = 'Anonymous Voter' 
WHERE voter_name IS NULL;

-- Create a trigger to automatically create user profiles when auth.users are created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Success message
SELECT 'Database updated successfully for Supabase Auth! Organizers must register, but voters can vote anonymously.' as status;
