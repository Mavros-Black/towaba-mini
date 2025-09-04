-- Test script to see what columns actually exist in the campaigns table
-- Run this in Supabase SQL Editor to see the exact table structure

-- Show all columns in campaigns table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'campaigns'
ORDER BY ordinal_position;

-- Show a sample row to see actual data
SELECT * FROM campaigns LIMIT 1;

-- Check if specific columns exist
SELECT 
  'amount_per_vote' as column_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'campaigns' AND column_name = 'amount_per_vote'
  ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
  'start_date' as column_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'campaigns' AND column_name = 'start_date'
  ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
  'is_public' as column_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'campaigns' AND column_name = 'is_public'
  ) THEN 'EXISTS' ELSE 'MISSING' END as status;

