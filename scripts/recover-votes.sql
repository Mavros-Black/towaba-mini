-- Emergency Vote Recovery Script
-- This script helps recover votes that might have been lost due to the trigger changes

-- First, let's check what we have in the votes table
SELECT 
  'Votes Table Status' as check_type,
  COUNT(*) as total_votes,
  COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) as successful_votes,
  COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_votes,
  COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed_votes
FROM votes;

-- Check if there are any votes at all
SELECT 
  'Vote Records Check' as check_type,
  COUNT(*) as total_vote_records
FROM votes;

-- Check nominees table
SELECT 
  'Nominees Table Status' as check_type,
  COUNT(*) as total_nominees,
  SUM(votes_count) as total_votes_count,
  AVG(votes_count) as avg_votes_count
FROM nominees;

-- Check if there are votes but nominees have 0 vote counts
SELECT 
  'Mismatch Check' as check_type,
  COUNT(*) as nominees_with_zero_votes,
  (SELECT COUNT(*) FROM votes WHERE status = 'SUCCESS') as actual_successful_votes
FROM nominees 
WHERE votes_count = 0;

-- If votes exist but nominees have 0 counts, let's fix it
-- First, let's see what votes we have
SELECT 
  v.id,
  v.nominee_id,
  v.status,
  v.amount,
  v.created_at,
  n.name as nominee_name,
  n.votes_count as current_nominee_votes
FROM votes v
JOIN nominees n ON v.nominee_id = n.id
ORDER BY v.created_at DESC
LIMIT 20;

-- Check if there are any SUCCESS votes that should be counted
SELECT 
  'SUCCESS Votes Check' as check_type,
  COUNT(*) as success_votes_count,
  SUM(amount / 100) as total_vote_amount
FROM votes 
WHERE status = 'SUCCESS';

-- If we find SUCCESS votes, let's recalculate the nominee vote counts
-- This is the safe way to recover vote counts
UPDATE nominees 
SET votes_count = (
  SELECT COALESCE(SUM(v.amount / 100), 0)
  FROM votes v
  WHERE v.nominee_id = nominees.id 
  AND v.status = 'SUCCESS'
);

-- Show the recovered vote counts
SELECT 
  'Recovery Results' as check_type,
  n.id,
  n.name,
  n.votes_count as recovered_vote_count,
  COUNT(v.id) as total_votes_for_nominee,
  COUNT(CASE WHEN v.status = 'SUCCESS' THEN 1 END) as successful_votes_for_nominee
FROM nominees n
LEFT JOIN votes v ON n.id = v.nominee_id
GROUP BY n.id, n.name, n.votes_count
HAVING n.votes_count > 0 OR COUNT(v.id) > 0
ORDER BY n.votes_count DESC;

-- Final status check
SELECT 
  'Final Status' as check_type,
  (SELECT COUNT(*) FROM votes) as total_votes_in_table,
  (SELECT SUM(votes_count) FROM nominees) as total_votes_in_nominees,
  (SELECT COUNT(*) FROM votes WHERE status = 'SUCCESS') as successful_votes_count;
