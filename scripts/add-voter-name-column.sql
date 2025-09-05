-- Add voter_name and voter_phone columns to votes table if they don't exist
-- Run this in your Supabase SQL Editor

-- Add voter_name column to votes table
ALTER TABLE votes ADD COLUMN IF NOT EXISTS voter_name TEXT;

-- Add voter_phone column to votes table
ALTER TABLE votes ADD COLUMN IF NOT EXISTS voter_phone TEXT;

-- Make voter_name required for new votes (but allow existing NULL values)
-- We'll update existing votes first
UPDATE votes 
SET voter_name = 'Anonymous Voter' 
WHERE voter_name IS NULL;

-- Update existing votes to have default voter phone
UPDATE votes 
SET voter_phone = 'Unknown' 
WHERE voter_phone IS NULL;

-- Now make them NOT NULL
ALTER TABLE votes ALTER COLUMN voter_name SET NOT NULL;
ALTER TABLE votes ALTER COLUMN voter_phone SET NOT NULL;

-- Add voter_name column to payments table if it doesn't exist
ALTER TABLE payments ADD COLUMN IF NOT EXISTS voter_name TEXT;

-- Update existing payments to have default voter names
UPDATE payments 
SET voter_name = 'Anonymous Voter' 
WHERE voter_name IS NULL;

-- Make voter_name required for new payments
ALTER TABLE payments ALTER COLUMN voter_name SET NOT NULL;

-- Success message
SELECT 'voter_name and voter_phone columns added successfully to votes table, and voter_name to payments table!' as status;
