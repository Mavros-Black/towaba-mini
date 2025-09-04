-- Add essential missing columns to campaigns table
-- Run this script step by step to avoid any issues

-- Step 1: Add amount_per_vote column
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS amount_per_vote INTEGER DEFAULT 100;

-- Step 2: Add start_date column
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE;

-- Step 3: Add end_date column
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;

-- Step 4: Add is_public column
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Step 5: Add allow_anonymous_voting column
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS allow_anonymous_voting BOOLEAN DEFAULT true;

-- Step 6: Add max_votes_per_user column
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS max_votes_per_user INTEGER DEFAULT 10;

-- Step 7: Add campaign_type column
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS campaign_type VARCHAR(50) DEFAULT 'categorized';

-- Step 8: Add require_payment column
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS require_payment BOOLEAN DEFAULT true;

-- Step 9: Add payment_methods column
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '["PAYSTACK"]';

-- Step 10: Add auto_publish column
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS auto_publish BOOLEAN DEFAULT false;

-- Step 11: Add allow_editing column
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS allow_editing BOOLEAN DEFAULT true;

-- Step 12: Add show_vote_counts column
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS show_vote_counts BOOLEAN DEFAULT true;

-- Step 13: Add show_voter_names column
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS show_voter_names BOOLEAN DEFAULT true;

-- Step 14: Add status column
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'DRAFT';

-- Verify all columns were added
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'campaigns'
ORDER BY ordinal_position;

