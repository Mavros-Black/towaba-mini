-- =====================================================
-- VOTING PERIODS SYSTEM - DATABASE SCHEMA
-- =====================================================
-- This script creates the necessary tables and columns
-- to support weekly/monthly/custom vote resets with
-- complete data preservation

-- 1. Add voting period fields to campaigns table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS voting_period_type VARCHAR(20) DEFAULT 'continuous',
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP,
ADD COLUMN IF NOT EXISTS auto_reset_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reset_frequency VARCHAR(20) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS custom_reset_days INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS next_auto_reset TIMESTAMP;

-- 2. Add period tracking to votes table
ALTER TABLE votes 
ADD COLUMN IF NOT EXISTS voting_period_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS period_start_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS period_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS period_number INTEGER DEFAULT 1;

-- 3. Create voting_periods table for historical data
CREATE TABLE IF NOT EXISTS voting_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    period_number INTEGER NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    total_votes INTEGER DEFAULT 0,
    total_revenue BIGINT DEFAULT 0,
    total_voters INTEGER DEFAULT 0,
    winner_nominee_id UUID REFERENCES nominees(id),
    winner_votes INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'completed', -- 'active', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    
    -- Ensure unique period numbers per campaign
    UNIQUE(campaign_id, period_number)
);

-- 4. Create period_vote_summary table for nominee performance per period
CREATE TABLE IF NOT EXISTS period_vote_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id UUID REFERENCES voting_periods(id) ON DELETE CASCADE,
    nominee_id UUID REFERENCES nominees(id) ON DELETE CASCADE,
    total_votes INTEGER DEFAULT 0,
    total_revenue BIGINT DEFAULT 0,
    unique_voters INTEGER DEFAULT 0,
    rank INTEGER,
    percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT now(),
    
    -- Ensure one summary per nominee per period
    UNIQUE(period_id, nominee_id)
);

-- 5. Create period_reset_logs table for audit trail
CREATE TABLE IF NOT EXISTS period_reset_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    period_id UUID REFERENCES voting_periods(id) ON DELETE CASCADE,
    reset_type VARCHAR(20) NOT NULL, -- 'manual', 'auto_weekly', 'auto_monthly', 'auto_custom'
    reset_triggered_by UUID, -- organizer_id
    reset_triggered_at TIMESTAMP DEFAULT now(),
    previous_period_stats JSONB,
    new_period_stats JSONB,
    notes TEXT
);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_votes_period_id ON votes(voting_period_id);
CREATE INDEX IF NOT EXISTS idx_votes_period_dates ON votes(period_start_date, period_end_date);
CREATE INDEX IF NOT EXISTS idx_voting_periods_campaign ON voting_periods(campaign_id);
CREATE INDEX IF NOT EXISTS idx_voting_periods_dates ON voting_periods(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_period_summary_period ON period_vote_summary(period_id);
CREATE INDEX IF NOT EXISTS idx_period_summary_nominee ON period_vote_summary(nominee_id);
CREATE INDEX IF NOT EXISTS idx_reset_logs_campaign ON period_reset_logs(campaign_id);

-- 7. Add comments for documentation
COMMENT ON COLUMN campaigns.voting_period_type IS 'Type of voting: continuous, weekly, monthly, custom';
COMMENT ON COLUMN campaigns.reset_frequency IS 'Reset frequency: manual, weekly, monthly, custom';
COMMENT ON COLUMN campaigns.custom_reset_days IS 'Custom reset interval in days (for custom frequency)';
COMMENT ON COLUMN votes.voting_period_id IS 'Unique identifier for the voting period this vote belongs to';
COMMENT ON COLUMN votes.period_number IS 'Sequential period number (1, 2, 3, etc.)';

-- 8. Create function to get current period for a campaign
CREATE OR REPLACE FUNCTION get_current_period_id(campaign_uuid UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    period_id VARCHAR(50);
BEGIN
    SELECT 
        CASE 
            WHEN current_period_start IS NOT NULL 
            THEN campaign_uuid::text || '_period_' || EXTRACT(EPOCH FROM current_period_start)::bigint
            ELSE campaign_uuid::text || '_period_1'
        END
    INTO period_id
    FROM campaigns 
    WHERE id = campaign_uuid;
    
    RETURN period_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Create function to calculate period statistics
CREATE OR REPLACE FUNCTION calculate_period_stats(period_uuid UUID)
RETURNS TABLE(
    total_votes INTEGER,
    total_revenue BIGINT,
    total_voters INTEGER,
    winner_nominee_id UUID,
    winner_votes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_votes,
        COALESCE(SUM(amount), 0)::BIGINT as total_revenue,
        COUNT(DISTINCT voter_phone)::INTEGER as total_voters,
        (SELECT nominee_id 
         FROM votes 
         WHERE voting_period_id = period_uuid::text
         GROUP BY nominee_id 
         ORDER BY COUNT(*) DESC 
         LIMIT 1) as winner_nominee_id,
        (SELECT COUNT(*)::INTEGER
         FROM votes 
         WHERE voting_period_id = period_uuid::text
           AND nominee_id = (SELECT nominee_id 
                           FROM votes 
                           WHERE voting_period_id = period_uuid::text
                           GROUP BY nominee_id 
                           ORDER BY COUNT(*) DESC 
                           LIMIT 1)) as winner_votes;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger to update period stats when votes are added
CREATE OR REPLACE FUNCTION update_period_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the voting_periods table with latest stats
    UPDATE voting_periods 
    SET 
        total_votes = (SELECT COUNT(*) FROM votes WHERE voting_period_id = NEW.voting_period_id),
        total_revenue = (SELECT COALESCE(SUM(amount), 0) FROM votes WHERE voting_period_id = NEW.voting_period_id),
        total_voters = (SELECT COUNT(DISTINCT voter_phone) FROM votes WHERE voting_period_id = NEW.voting_period_id),
        updated_at = now()
    WHERE id = (SELECT id FROM voting_periods WHERE campaign_id = NEW.campaign_id AND status = 'active');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS trigger_update_period_stats ON votes;
CREATE TRIGGER trigger_update_period_stats
    AFTER INSERT ON votes
    FOR EACH ROW
    EXECUTE FUNCTION update_period_stats();

-- 11. Insert default period for existing campaigns
INSERT INTO voting_periods (campaign_id, period_number, start_date, end_date, status)
SELECT 
    id,
    1,
    created_at,
    CASE 
        WHEN end_date IS NOT NULL THEN end_date
        ELSE created_at + INTERVAL '30 days'
    END,
    CASE 
        WHEN status = 'ACTIVE' THEN 'active'
        ELSE 'completed'
    END
FROM campaigns
WHERE id NOT IN (SELECT DISTINCT campaign_id FROM voting_periods);

-- 12. Update existing votes with period information
UPDATE votes 
SET 
    voting_period_id = get_current_period_id(campaign_id),
    period_start_date = (SELECT created_at FROM campaigns WHERE id = votes.campaign_id),
    period_end_date = (SELECT 
        CASE 
            WHEN end_date IS NOT NULL THEN end_date
            ELSE created_at + INTERVAL '30 days'
        END 
        FROM campaigns WHERE id = votes.campaign_id),
    period_number = 1
WHERE voting_period_id IS NULL;

-- 13. Create view for easy period management
CREATE OR REPLACE VIEW campaign_periods_view AS
SELECT 
    c.id as campaign_id,
    c.title as campaign_title,
    c.voting_period_type,
    c.reset_frequency,
    c.auto_reset_enabled,
    c.current_period_start,
    c.current_period_end,
    c.next_auto_reset,
    vp.id as current_period_id,
    vp.period_number as current_period_number,
    vp.total_votes as current_votes,
    vp.total_revenue as current_revenue,
    vp.status as current_period_status,
    (SELECT COUNT(*) FROM voting_periods WHERE campaign_id = c.id AND status = 'completed') as completed_periods
FROM campaigns c
LEFT JOIN voting_periods vp ON c.id = vp.campaign_id AND vp.status = 'active';

-- Success message
SELECT 'Voting periods schema created successfully! 🎉' as message;
