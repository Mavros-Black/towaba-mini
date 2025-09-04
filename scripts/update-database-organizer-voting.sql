-- Update Database for Organizer Accounts + Anonymous Public Voting
-- Run this in your Supabase SQL Editor

-- Keep the users table for organizers (they must register)
-- But make user_id optional for payments and votes (anonymous voting)

-- First, drop the existing foreign key constraints for payments and votes
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

-- Success message
SELECT 'Database updated successfully! Organizers must register, but voters can vote anonymously.' as status;
