-- Verify and fix vote counts to ensure they match the amount paid
-- Run this in your Supabase SQL Editor

-- First, let's see the current state
SELECT 
  'Current Vote Counts' as check_type,
  n.id,
  n.name,
  n.votes_count as current_display_count,
  COUNT(v.id) as total_vote_records,
  COUNT(CASE WHEN v.status = 'SUCCESS' THEN 1 END) as successful_vote_records,
  COALESCE(SUM(CASE WHEN v.status = 'SUCCESS' THEN v.amount ELSE 0 END), 0) as total_amount_paid_pesewas,
  COALESCE(SUM(CASE WHEN v.status = 'SUCCESS' THEN v.amount ELSE 0 END) / 100, 0) as should_display_votes
FROM nominees n
LEFT JOIN votes v ON n.id = v.nominee_id
GROUP BY n.id, n.name, n.votes_count
ORDER BY n.votes_count DESC;

-- Now let's fix the vote counts to match the amount paid
UPDATE nominees 
SET votes_count = (
  SELECT COALESCE(SUM(v.amount / 100), 0)
  FROM votes v
  WHERE v.nominee_id = nominees.id 
  AND v.status = 'SUCCESS'
);

-- Show the corrected state
SELECT 
  'Corrected Vote Counts' as check_type,
  n.id,
  n.name,
  n.votes_count as corrected_display_count,
  COUNT(v.id) as total_vote_records,
  COUNT(CASE WHEN v.status = 'SUCCESS' THEN 1 END) as successful_vote_records,
  COALESCE(SUM(CASE WHEN v.status = 'SUCCESS' THEN v.amount ELSE 0 END), 0) as total_amount_paid_pesewas,
  COALESCE(SUM(CASE WHEN v.status = 'SUCCESS' THEN v.amount ELSE 0 END) / 100, 0) as calculated_votes
FROM nominees n
LEFT JOIN votes v ON n.id = v.nominee_id
GROUP BY n.id, n.name, n.votes_count
ORDER BY n.votes_count DESC;

-- Success message
SELECT 'Vote counts have been corrected to match the amount paid!' as status;
