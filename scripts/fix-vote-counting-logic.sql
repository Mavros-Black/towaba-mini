-- Fix vote counting logic to only count successful votes
-- This prevents pending votes from being counted before payment verification

-- First, let's see the current trigger function
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'update_vote_count';

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS update_nominee_vote_count ON votes;
DROP TRIGGER IF EXISTS update_vote_count_trigger ON votes;
DROP FUNCTION IF EXISTS update_vote_count() CASCADE;

-- Create a new function that only counts successful votes
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

-- Create the trigger
CREATE TRIGGER update_nominee_vote_count
  AFTER INSERT OR UPDATE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_vote_count();

-- Now let's recalculate all vote counts correctly
-- First, reset all nominee vote counts to 0
UPDATE nominees SET votes_count = 0;

-- Then recalculate based on only SUCCESS votes
UPDATE nominees 
SET votes_count = (
  SELECT COALESCE(SUM(v.amount / 100), 0)
  FROM votes v
  WHERE v.nominee_id = nominees.id 
  AND v.status = 'SUCCESS'
);

-- Show the corrected vote counts
SELECT 
  n.id,
  n.name,
  n.votes_count as corrected_vote_count,
  COUNT(v.id) as total_votes,
  COUNT(CASE WHEN v.status = 'SUCCESS' THEN 1 END) as successful_votes,
  COUNT(CASE WHEN v.status = 'PENDING' THEN 1 END) as pending_votes
FROM nominees n
LEFT JOIN votes v ON n.id = v.nominee_id
GROUP BY n.id, n.name, n.votes_count
ORDER BY n.votes_count DESC;
