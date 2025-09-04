-- Update Database for Anonymous Voting
-- Run this in your Supabase SQL Editor to remove user constraints

-- First, drop the existing foreign key constraints
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey;
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_user_id_fkey;
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_organizer_id_fkey;

-- Make user_id columns nullable
ALTER TABLE payments ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE votes ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE campaigns ALTER COLUMN organizer_id DROP NOT NULL;

-- Add organizer_name column to campaigns for anonymous organizers
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS organizer_name TEXT;

-- Update existing campaigns to have organizer names
UPDATE campaigns 
SET organizer_name = 'Anonymous Organizer' 
WHERE organizer_name IS NULL;

-- Make organizer_name required for new campaigns
ALTER TABLE campaigns ALTER COLUMN organizer_name SET NOT NULL;

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
SELECT 'Database updated successfully for anonymous voting! User constraints removed.' as status;
