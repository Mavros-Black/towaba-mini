-- Fix Negative Vote Counts in Nominees Table
-- Run this in your Supabase SQL Editor

-- First, let's see the current state of nominees with negative votes
SELECT id, name, votes_count, campaign_id 
FROM nominees 
WHERE votes_count < 0 
ORDER BY votes_count ASC;

-- Reset all negative vote counts to 0
UPDATE nominees 
SET votes_count = 0 
WHERE votes_count < 0;

-- Verify the fix
SELECT id, name, votes_count, campaign_id 
FROM nominees 
ORDER BY votes_count ASC;

-- Also, let's check if there are any orphaned votes or payments
SELECT 'Orphaned votes (no payment):' as check_type, COUNT(*) as count
FROM votes v
LEFT JOIN payments p ON v.payment_id = p.id
WHERE p.id IS NULL AND v.payment_id IS NOT NULL

UNION ALL

SELECT 'Votes with pending payments:' as check_type, COUNT(*) as count
FROM votes v
JOIN payments p ON v.payment_id = p.id
WHERE p.status = 'PENDING'

UNION ALL

SELECT 'Total nominees:' as check_type, COUNT(*) as count
FROM nominees

UNION ALL

SELECT 'Total votes:' as check_type, COUNT(*) as count
FROM votes

UNION ALL

SELECT 'Total payments:' as check_type, COUNT(*) as count
FROM payments;

-- Success message
SELECT 'Negative vote counts have been reset to 0. Check the results above for verification.' as status;
