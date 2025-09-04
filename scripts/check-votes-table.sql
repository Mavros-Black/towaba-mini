-- Check votes table structure and data
-- Run this in your Supabase SQL Editor to debug vote counting issues

-- Check if votes table exists and its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'votes'
ORDER BY ordinal_position;

-- Check total number of votes in the table
SELECT COUNT(*) as total_votes FROM votes;

-- Check votes by status
SELECT 
  status,
  COUNT(*) as count
FROM votes
GROUP BY status
ORDER BY status;

-- Check votes by campaign (if any exist)
SELECT 
  campaign_id,
  COUNT(*) as vote_count,
  COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) as successful_votes
FROM votes
GROUP BY campaign_id
ORDER BY vote_count DESC;

-- Check if there are any votes with SUCCESS status
SELECT COUNT(*) as successful_votes_count
FROM votes
WHERE status = 'SUCCESS';

-- Check nominees table votes_count field
SELECT 
  id,
  name,
  votes_count,
  campaign_id
FROM nominees
WHERE votes_count > 0
ORDER BY votes_count DESC
LIMIT 10;

-- Check if there's a mismatch between votes table and nominees.votes_count
SELECT 
  n.id as nominee_id,
  n.name,
  n.votes_count as nominee_votes_count,
  COUNT(v.id) as actual_votes_count
FROM nominees n
LEFT JOIN votes v ON n.id = v.nominee_id AND v.status = 'SUCCESS'
GROUP BY n.id, n.name, n.votes_count
HAVING n.votes_count != COUNT(v.id)
ORDER BY ABS(n.votes_count - COUNT(v.id)) DESC
LIMIT 10;
