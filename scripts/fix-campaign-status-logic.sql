-- Fix campaign status logic to be date-based
-- This script implements proper campaign status management

-- First, let's create a function to determine campaign status based on dates
CREATE OR REPLACE FUNCTION get_campaign_status(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  current_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) RETURNS VARCHAR(50) AS $$
BEGIN
  -- If no start date is set, campaign is DRAFT
  IF start_date IS NULL THEN
    RETURN 'DRAFT';
  END IF;
  
  -- If current time is before start date, campaign is SCHEDULED
  IF current_time < start_date THEN
    RETURN 'SCHEDULED';
  END IF;
  
  -- If end date is set and current time is after end date, campaign is ENDED
  IF end_date IS NOT NULL AND current_time > end_date THEN
    RETURN 'ENDED';
  END IF;
  
  -- If current time is between start and end date (or no end date), campaign is ACTIVE
  RETURN 'ACTIVE';
END;
$$ LANGUAGE plpgsql;

-- Create a function to update campaign status based on dates
CREATE OR REPLACE FUNCTION update_campaign_status() RETURNS TRIGGER AS $$
BEGIN
  -- Update the status based on current dates
  NEW.status = get_campaign_status(NEW.start_date, NEW.end_date);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update status when campaign dates change
DROP TRIGGER IF EXISTS update_campaign_status_trigger ON campaigns;
CREATE TRIGGER update_campaign_status_trigger
  BEFORE INSERT OR UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_status();

-- Update all existing campaigns with correct status based on their dates
UPDATE campaigns 
SET status = get_campaign_status(start_date, end_date)
WHERE status IS NOT NULL;

-- Add some helpful comments
COMMENT ON FUNCTION get_campaign_status IS 'Determines campaign status based on start/end dates';
COMMENT ON FUNCTION update_campaign_status IS 'Trigger function to automatically update campaign status';
COMMENT ON TRIGGER update_campaign_status_trigger ON campaigns IS 'Automatically updates campaign status when dates change';

-- Show the updated status distribution
SELECT 
  status,
  COUNT(*) as count,
  CASE 
    WHEN status = 'DRAFT' THEN 'Campaign not yet scheduled'
    WHEN status = 'SCHEDULED' THEN 'Campaign scheduled for future'
    WHEN status = 'ACTIVE' THEN 'Campaign currently running'
    WHEN status = 'ENDED' THEN 'Campaign has ended'
    ELSE 'Unknown status'
  END as description
FROM campaigns 
GROUP BY status 
ORDER BY 
  CASE status 
    WHEN 'DRAFT' THEN 1
    WHEN 'SCHEDULED' THEN 2
    WHEN 'ACTIVE' THEN 3
    WHEN 'ENDED' THEN 4
    ELSE 5
  END;

-- Show campaigns with their dates and calculated status
SELECT 
  id,
  title,
  start_date,
  end_date,
  status,
  get_campaign_status(start_date, end_date) as calculated_status,
  CASE 
    WHEN get_campaign_status(start_date, end_date) != status THEN 'MISMATCH'
    ELSE 'OK'
  END as status_check
FROM campaigns 
ORDER BY created_at DESC
LIMIT 10;
