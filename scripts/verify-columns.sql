-- Verify which columns exist in the campaigns table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'campaigns'
ORDER BY ordinal_position;

-- Check if specific columns exist
SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'campaigns' AND column_name = 'amount_per_vote'
  ) THEN 'EXISTS' ELSE 'MISSING' END as amount_per_vote_status;

SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'campaigns' AND column_name = 'start_date'
  ) THEN 'EXISTS' ELSE 'MISSING' END as start_date_status;

SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'campaigns' AND column_name = 'is_public'
  ) THEN 'EXISTS' ELSE 'MISSING' END as is_public_status;

