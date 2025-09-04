-- Campaign Protection Rules
-- Prevents deletion/modification of campaigns, categories, and nominees that have votes
-- This protects data integrity and prevents accidental loss of voting data

-- 1. Create a function to check if a campaign has votes
CREATE OR REPLACE FUNCTION campaign_has_votes(campaign_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM votes 
    WHERE campaign_id = campaign_uuid 
    AND status = 'SUCCESS'
  );
END;
$$ LANGUAGE plpgsql;

-- 2. Create a function to check if a category has votes
CREATE OR REPLACE FUNCTION category_has_votes(category_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM votes v
    JOIN nominees n ON v.nominee_id = n.id
    WHERE n.category_id = category_uuid 
    AND v.status = 'SUCCESS'
  );
END;
$$ LANGUAGE plpgsql;

-- 3. Create a function to check if a nominee has votes
CREATE OR REPLACE FUNCTION nominee_has_votes(nominee_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM votes 
    WHERE nominee_id = nominee_uuid 
    AND status = 'SUCCESS'
  );
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger function to prevent campaign deletion if it has votes
CREATE OR REPLACE FUNCTION prevent_campaign_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF campaign_has_votes(OLD.id) THEN
    RAISE EXCEPTION 'Cannot delete campaign "%" - it has % votes. Campaigns with votes cannot be deleted.', 
      OLD.title, 
      (SELECT COUNT(*) FROM votes WHERE campaign_id = OLD.id AND status = 'SUCCESS');
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger function to prevent category deletion if it has votes
CREATE OR REPLACE FUNCTION prevent_category_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF category_has_votes(OLD.id) THEN
    RAISE EXCEPTION 'Cannot delete category "%" - it has votes. Categories with votes cannot be deleted.', OLD.name;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger function to prevent nominee deletion if it has votes
CREATE OR REPLACE FUNCTION prevent_nominee_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF nominee_has_votes(OLD.id) THEN
    RAISE EXCEPTION 'Cannot delete nominee "%" - it has votes. Nominees with votes cannot be deleted.', OLD.name;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger function to prevent major campaign structure changes
CREATE OR REPLACE FUNCTION prevent_campaign_structure_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- If campaign has votes, prevent changing campaign type
  IF campaign_has_votes(NEW.id) AND OLD.campaign_type != NEW.campaign_type THEN
    RAISE EXCEPTION 'Cannot change campaign type from "%" to "%" - campaign has votes. Campaign structure cannot be changed once voting begins.', 
      OLD.campaign_type, NEW.campaign_type;
  END IF;
  
  -- If campaign has votes, prevent changing from public to private
  IF campaign_has_votes(NEW.id) AND OLD.is_public = true AND NEW.is_public = false THEN
    RAISE EXCEPTION 'Cannot make campaign private - it has votes. Campaign visibility cannot be changed once voting begins.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create the triggers
DROP TRIGGER IF EXISTS prevent_campaign_deletion_trigger ON campaigns;
CREATE TRIGGER prevent_campaign_deletion_trigger
  BEFORE DELETE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION prevent_campaign_deletion();

DROP TRIGGER IF EXISTS prevent_category_deletion_trigger ON categories;
CREATE TRIGGER prevent_category_deletion_trigger
  BEFORE DELETE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION prevent_category_deletion();

DROP TRIGGER IF EXISTS prevent_nominee_deletion_trigger ON nominees;
CREATE TRIGGER prevent_nominee_deletion_trigger
  BEFORE DELETE ON nominees
  FOR EACH ROW
  EXECUTE FUNCTION prevent_nominee_deletion();

DROP TRIGGER IF EXISTS prevent_campaign_structure_changes_trigger ON campaigns;
CREATE TRIGGER prevent_campaign_structure_changes_trigger
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION prevent_campaign_structure_changes();

-- 9. Create helper functions for the API to check protection status
CREATE OR REPLACE FUNCTION get_campaign_protection_status(campaign_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  vote_count INTEGER;
  has_votes BOOLEAN;
BEGIN
  SELECT COUNT(*), COUNT(*) > 0 INTO vote_count, has_votes
  FROM votes 
  WHERE campaign_id = campaign_uuid 
  AND status = 'SUCCESS';
  
  result := json_build_object(
    'campaign_id', campaign_uuid,
    'has_votes', has_votes,
    'vote_count', vote_count,
    'can_delete', NOT has_votes,
    'can_change_structure', NOT has_votes,
    'can_make_private', NOT has_votes,
    'protection_reason', CASE 
      WHEN has_votes THEN 'Campaign has ' || vote_count || ' votes'
      ELSE 'No votes - safe to modify'
    END
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to get nominee protection status
CREATE OR REPLACE FUNCTION get_nominee_protection_status(nominee_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  vote_count INTEGER;
  has_votes BOOLEAN;
BEGIN
  SELECT COUNT(*), COUNT(*) > 0 INTO vote_count, has_votes
  FROM votes 
  WHERE nominee_id = nominee_uuid 
  AND status = 'SUCCESS';
  
  result := json_build_object(
    'nominee_id', nominee_uuid,
    'has_votes', has_votes,
    'vote_count', vote_count,
    'can_delete', NOT has_votes,
    'protection_reason', CASE 
      WHEN has_votes THEN 'Nominee has ' || vote_count || ' votes'
      ELSE 'No votes - safe to delete'
    END
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 11. Add comments for documentation
COMMENT ON FUNCTION campaign_has_votes IS 'Checks if a campaign has any successful votes';
COMMENT ON FUNCTION category_has_votes IS 'Checks if a category has any successful votes';
COMMENT ON FUNCTION nominee_has_votes IS 'Checks if a nominee has any successful votes';
COMMENT ON FUNCTION prevent_campaign_deletion IS 'Prevents deletion of campaigns with votes';
COMMENT ON FUNCTION prevent_category_deletion IS 'Prevents deletion of categories with votes';
COMMENT ON FUNCTION prevent_nominee_deletion IS 'Prevents deletion of nominees with votes';
COMMENT ON FUNCTION prevent_campaign_structure_changes IS 'Prevents major structural changes to campaigns with votes';
COMMENT ON FUNCTION get_campaign_protection_status IS 'Returns protection status for API use';
COMMENT ON FUNCTION get_nominee_protection_status IS 'Returns nominee protection status for API use';

-- 12. Test the protection (optional - remove after testing)
-- Uncomment these lines to test the protection:
/*
-- This should fail if there are votes:
-- DELETE FROM campaigns WHERE id = 'some-campaign-id';

-- This should show protection status:
-- SELECT get_campaign_protection_status('some-campaign-id');
*/

-- 13. Show current protection status for all campaigns
SELECT 
  c.id,
  c.title,
  c.status,
  COALESCE(vote_counts.vote_count, 0) as total_votes,
  CASE 
    WHEN COALESCE(vote_counts.vote_count, 0) > 0 THEN 'PROTECTED'
    ELSE 'UNPROTECTED'
  END as protection_status
FROM campaigns c
LEFT JOIN (
  SELECT 
    campaign_id,
    COUNT(*) as vote_count
  FROM votes 
  WHERE status = 'SUCCESS'
  GROUP BY campaign_id
) vote_counts ON c.id = vote_counts.campaign_id
ORDER BY vote_counts.vote_count DESC NULLS LAST;
