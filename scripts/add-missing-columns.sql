-- Add missing reference column to votes table
-- This fixes the error: "column votes.reference does not exist"

ALTER TABLE votes
ADD COLUMN IF NOT EXISTS reference VARCHAR(255);

-- Verify the column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'votes'
AND column_name = 'reference';

-- Update existing votes with a default reference if needed
UPDATE votes
SET reference = CONCAT('VOTE-', id)
WHERE reference IS NULL;

COMMENT ON COLUMN votes.reference IS 'Payment reference for the vote transaction';

-- Add missing columns to campaigns table
-- This fixes the error: "column campaigns.amount_per_vote does not exist"

-- Add amount_per_vote column
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS amount_per_vote INTEGER DEFAULT 100;

-- Add start_date column
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE;

-- Add end_date column
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;

-- Add is_public column
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Add allow_anonymous_voting column
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS allow_anonymous_voting BOOLEAN DEFAULT true;

-- Add max_votes_per_user column
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS max_votes_per_user INTEGER DEFAULT 10;

-- Add campaign_type column
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS campaign_type VARCHAR(50) DEFAULT 'categorized';

-- Add require_payment column
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS require_payment BOOLEAN DEFAULT true;

-- Add payment_methods column (as JSONB for array storage)
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '["PAYSTACK"]';

-- Add auto_publish column
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS auto_publish BOOLEAN DEFAULT false;

-- Add allow_editing column
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS allow_editing BOOLEAN DEFAULT true;

-- Add show_vote_counts column
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS show_vote_counts BOOLEAN DEFAULT true;

-- Add show_voter_names column
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS show_voter_names BOOLEAN DEFAULT true;

-- Add status column
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'DRAFT';

-- Verify all columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'campaigns'
ORDER BY ordinal_position;

-- Update existing campaigns with default values
UPDATE campaigns
SET 
  amount_per_vote = COALESCE(amount_per_vote, 100),
  is_public = COALESCE(is_public, true),
  allow_anonymous_voting = COALESCE(allow_anonymous_voting, true),
  max_votes_per_user = COALESCE(max_votes_per_user, 10),
  campaign_type = COALESCE(campaign_type, 'categorized'),
  require_payment = COALESCE(require_payment, true),
  payment_methods = COALESCE(payment_methods, '["PAYSTACK"]'),
  auto_publish = COALESCE(auto_publish, false),
  allow_editing = COALESCE(allow_editing, true),
  show_vote_counts = COALESCE(show_vote_counts, true),
  show_voter_names = COALESCE(show_voter_names, true),
  status = COALESCE(status, 'DRAFT')
WHERE 
  amount_per_vote IS NULL 
  OR is_public IS NULL 
  OR allow_anonymous_voting IS NULL 
  OR max_votes_per_user IS NULL 
  OR campaign_type IS NULL 
  OR require_payment IS NULL 
  OR payment_methods IS NULL 
  OR auto_publish IS NULL 
  OR allow_editing IS NULL 
  OR show_vote_counts IS NULL 
  OR show_voter_names IS NULL 
  OR status IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN campaigns.amount_per_vote IS 'Amount per vote in pesewas (100 = 1 GHS)';
COMMENT ON COLUMN campaigns.start_date IS 'Campaign start date and time';
COMMENT ON COLUMN campaigns.end_date IS 'Campaign end date and time';
COMMENT ON COLUMN campaigns.is_public IS 'Whether the campaign is publicly visible';
COMMENT ON COLUMN campaigns.allow_anonymous_voting IS 'Whether anonymous voting is allowed';
COMMENT ON COLUMN campaigns.max_votes_per_user IS 'Maximum votes allowed per user (0 = unlimited)';
COMMENT ON COLUMN campaigns.campaign_type IS 'Type of campaign: categorized or simple';
COMMENT ON COLUMN campaigns.require_payment IS 'Whether payment is required for voting';
COMMENT ON COLUMN campaigns.payment_methods IS 'Array of accepted payment methods';
COMMENT ON COLUMN campaigns.auto_publish IS 'Whether to publish campaign immediately after creation';
COMMENT ON COLUMN campaigns.allow_editing IS 'Whether campaign can be edited after creation';
COMMENT ON COLUMN campaigns.show_vote_counts IS 'Whether to display vote counts publicly';
COMMENT ON COLUMN campaigns.show_voter_names IS 'Whether to display voter names publicly';
COMMENT ON COLUMN campaigns.status IS 'Campaign status: DRAFT, ACTIVE, PAUSED, ENDED';

-- Display final table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'campaigns'
ORDER BY ordinal_position;
