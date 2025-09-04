-- Prevent Negative Vote Counts in the Future
-- Run this in your Supabase SQL Editor after fixing the current negative values

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS update_nominee_vote_count ON votes;
DROP FUNCTION IF EXISTS update_vote_count();

-- Create an improved vote count function that prevents negative values
CREATE OR REPLACE FUNCTION update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE nominees 
        SET votes_count = GREATEST(0, votes_count + NEW.amount) 
        WHERE id = NEW.nominee_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE nominees 
        SET votes_count = GREATEST(0, votes_count - OLD.amount) 
        WHERE id = OLD.nominee_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle amount changes
        IF OLD.amount != NEW.amount THEN
            UPDATE nominees 
            SET votes_count = GREATEST(0, votes_count - OLD.amount) 
            WHERE id = OLD.nominee_id;
            
            UPDATE nominees 
            SET votes_count = GREATEST(0, votes_count + NEW.amount) 
            WHERE id = NEW.nominee_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Recreate the trigger
CREATE TRIGGER update_nominee_vote_count
    AFTER INSERT OR UPDATE OR DELETE ON votes
    FOR EACH ROW EXECUTE FUNCTION update_vote_count();

-- Also create a function to manually recalculate vote counts if needed
CREATE OR REPLACE FUNCTION recalculate_vote_counts()
RETURNS void AS $$
BEGIN
    -- Reset all vote counts to 0 first
    UPDATE nominees SET votes_count = 0;
    
    -- Recalculate based on actual successful votes
    UPDATE nominees 
    SET votes_count = COALESCE(
        (SELECT SUM(v.amount) 
         FROM votes v 
         JOIN payments p ON v.payment_id = p.id 
         WHERE v.nominee_id = nominees.id 
         AND p.status = 'SUCCESS'
         AND v.status = 'SUCCESS'), 0
    );
END;
$$ language 'plpgsql';

-- Success message
SELECT 'Vote count triggers updated to prevent negative values. Use recalculate_vote_counts() function if you need to manually recalculate.' as status;
