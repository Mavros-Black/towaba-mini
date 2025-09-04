-- Safe Vote Counting Fix - This version doesn't reset existing data
-- Use this instead of the previous fix-vote-counting-logic.sql

-- First, let's check the current state without making changes
SELECT 
  'Current State Check' as check_type,
  (SELECT COUNT(*) FROM votes) as total_votes,
  (SELECT COUNT(*) FROM votes WHERE status = 'SUCCESS') as successful_votes,
  (SELECT SUM(votes_count) FROM nominees) as total_nominee_votes
FROM (SELECT 1) as dummy;

-- Check if the trigger function exists and what it does
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'update_vote_count';

-- Only drop and recreate if we need to fix the function
-- This is safer than the previous approach

-- Create or replace the function (this won't affect existing data)
CREATE OR REPLACE FUNCTION update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT operations (new votes)
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'SUCCESS' THEN
      UPDATE nominees 
      SET votes_count = COALESCE(votes_count, 0) + (NEW.amount / 100)
      WHERE id = NEW.nominee_id;
      
      RAISE NOTICE 'INSERT: Vote count incremented for nominee %: +% votes (amount: % pesewas)', 
        NEW.nominee_id, (NEW.amount / 100), NEW.amount;
    END IF;
  END IF;
  
  -- Handle UPDATE operations (status changes)
  IF TG_OP = 'UPDATE' THEN
    -- If status changed from non-SUCCESS to SUCCESS, increment
    IF OLD.status != 'SUCCESS' AND NEW.status = 'SUCCESS' THEN
      UPDATE nominees 
      SET votes_count = COALESCE(votes_count, 0) + (NEW.amount / 100)
      WHERE id = NEW.nominee_id;
      
      RAISE NOTICE 'UPDATE: Vote count incremented for nominee %: +% votes (amount: % pesewas)', 
        NEW.nominee_id, (NEW.amount / 100), NEW.amount;
    END IF;
    
    -- If status changed from SUCCESS to non-SUCCESS, decrement
    IF OLD.status = 'SUCCESS' AND NEW.status != 'SUCCESS' THEN
      UPDATE nominees 
      SET votes_count = GREATEST(COALESCE(votes_count, 0) - (OLD.amount / 100), 0)
      WHERE id = OLD.nominee_id;
      
      RAISE NOTICE 'UPDATE: Vote count decremented for nominee %: -% votes (amount: % pesewas)', 
        OLD.nominee_id, (OLD.amount / 100), OLD.amount;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_nominee_vote_count ON votes;
DROP TRIGGER IF EXISTS update_vote_count_trigger ON votes;

-- Create the trigger
CREATE TRIGGER update_nominee_vote_count
  AFTER INSERT OR UPDATE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_vote_count();

-- Now, instead of resetting all vote counts, let's just fix any mismatches
-- This is much safer - it only updates nominees where the count is wrong

-- First, let's see which nominees have incorrect vote counts
SELECT 
  n.id,
  n.name,
  n.votes_count as current_count,
  COALESCE(SUM(v.amount / 100), 0) as correct_count,
  (n.votes_count - COALESCE(SUM(v.amount / 100), 0)) as difference
FROM nominees n
LEFT JOIN votes v ON n.id = v.nominee_id AND v.status = 'SUCCESS'
GROUP BY n.id, n.name, n.votes_count
HAVING n.votes_count != COALESCE(SUM(v.amount / 100), 0)
ORDER BY ABS(n.votes_count - COALESCE(SUM(v.amount / 100), 0)) DESC;

-- Only update nominees where the count is actually wrong
-- This preserves any correct counts
UPDATE nominees 
SET votes_count = (
  SELECT COALESCE(SUM(v.amount / 100), 0)
  FROM votes v
  WHERE v.nominee_id = nominees.id 
  AND v.status = 'SUCCESS'
)
WHERE nominees.votes_count != (
  SELECT COALESCE(SUM(v.amount / 100), 0)
  FROM votes v
  WHERE v.nominee_id = nominees.id 
  AND v.status = 'SUCCESS'
);

-- Show the final corrected state
SELECT 
  'Final Corrected State' as check_type,
  (SELECT COUNT(*) FROM votes) as total_votes,
  (SELECT COUNT(*) FROM votes WHERE status = 'SUCCESS') as successful_votes,
  (SELECT SUM(votes_count) FROM nominees) as total_nominee_votes,
  (SELECT COUNT(*) FROM nominees WHERE votes_count > 0) as nominees_with_votes;

-- Show nominees with their corrected vote counts
SELECT 
  n.id,
  n.name,
  n.votes_count as final_vote_count,
  COUNT(v.id) as total_votes_for_nominee,
  COUNT(CASE WHEN v.status = 'SUCCESS' THEN 1 END) as successful_votes_for_nominee
FROM nominees n
LEFT JOIN votes v ON n.id = v.nominee_id
GROUP BY n.id, n.name, n.votes_count
HAVING n.votes_count > 0 OR COUNT(v.id) > 0
ORDER BY n.votes_count DESC;
