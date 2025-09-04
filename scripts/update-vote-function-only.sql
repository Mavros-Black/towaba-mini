-- Update ONLY the vote counting function to fix GHS conversion
-- This script only updates the function without touching database structure
-- Note: System now works with GHS directly (1 vote = 1 GHS) instead of pesewas

-- Drop the existing trigger first (if it exists)
DROP TRIGGER IF EXISTS update_nominee_vote_count ON votes;

-- Drop the existing function (if it exists)
DROP FUNCTION IF EXISTS update_vote_count();

-- Create the corrected function to update vote count
CREATE OR REPLACE FUNCTION update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Convert pesewas to votes: 100 pesewas = 1 vote (1 GHS = 1 vote)
        UPDATE nominees SET votes_count = votes_count + FLOOR(NEW.amount / 100)
        WHERE id = NEW.nominee_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Convert pesewas to votes: 100 pesewas = 1 vote (1 GHS = 1 vote)
        UPDATE nominees SET votes_count = votes_count - FLOOR(OLD.amount / 100)
        WHERE id = OLD.nominee_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Convert pesewas to votes: 100 pesewas = 1 vote (1 GHS = 1 vote)
        UPDATE nominees SET votes_count = votes_count - FLOOR(OLD.amount / 100)
        WHERE id = OLD.nominee_id;
        UPDATE nominees SET votes_count = votes_count + FLOOR(NEW.amount / 100)
        WHERE id = NEW.nominee_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Recreate the trigger
CREATE TRIGGER update_nominee_vote_count
    AFTER INSERT OR UPDATE OR DELETE ON votes
    FOR EACH ROW EXECUTE FUNCTION update_vote_count();

-- Fix existing vote counts by recalculating them properly
-- This will correct any existing incorrect vote counts
UPDATE nominees 
SET votes_count = (
    SELECT COALESCE(SUM(FLOOR(v.amount / 100)), 0)
    FROM votes v 
    WHERE v.nominee_id = nominees.id 
    AND v.status = 'SUCCESS'
);

-- Success message
SELECT 'Vote counting function updated successfully! Existing vote counts have been corrected.' as status;
