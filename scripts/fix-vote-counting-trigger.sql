-- Fix the vote counting trigger to ensure it works correctly
-- Run this in your Supabase SQL Editor

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS update_nominee_vote_count ON votes;
DROP FUNCTION IF EXISTS update_vote_count() CASCADE;

-- Create the corrected function
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

-- Now recalculate all vote counts correctly
UPDATE nominees 
SET votes_count = (
  SELECT COALESCE(SUM(v.amount / 100), 0)
  FROM votes v
  WHERE v.nominee_id = nominees.id 
  AND v.status = 'SUCCESS'
);

-- Show the final result
SELECT 
  'Final Vote Counts' as check_type,
  n.id,
  n.name,
  n.votes_count as display_votes,
  COUNT(v.id) as total_vote_records,
  COUNT(CASE WHEN v.status = 'SUCCESS' THEN 1 END) as successful_vote_records,
  COALESCE(SUM(CASE WHEN v.status = 'SUCCESS' THEN v.amount ELSE 0 END), 0) as total_amount_paid_pesewas,
  COALESCE(SUM(CASE WHEN v.status = 'SUCCESS' THEN v.amount ELSE 0 END) / 100, 0) as calculated_votes
FROM nominees n
LEFT JOIN votes v ON n.id = v.nominee_id
GROUP BY n.id, n.name, n.votes_count
ORDER BY n.votes_count DESC;

-- Success message
SELECT 'Vote counting trigger has been fixed and vote counts recalculated!' as status;
