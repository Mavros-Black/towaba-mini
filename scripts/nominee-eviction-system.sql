-- Nominee Eviction System
-- Allows nominees to be "evicted" (hidden) without losing voting data
-- This preserves vote integrity while allowing campaign management

-- 1. Add eviction fields to nominees table
ALTER TABLE nominees 
ADD COLUMN IF NOT EXISTS is_evicted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS evicted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS evicted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS eviction_reason TEXT;

-- 2. Create eviction log table for audit trail
CREATE TABLE IF NOT EXISTS nominee_evictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nominee_id UUID NOT NULL REFERENCES nominees(id) ON DELETE CASCADE,
    evicted_by UUID NOT NULL REFERENCES auth.users(id),
    reason TEXT NOT NULL,
    vote_count_at_eviction INTEGER NOT NULL,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create function to evict a nominee
CREATE OR REPLACE FUNCTION evict_nominee(
    nominee_uuid UUID,
    evictor_uuid UUID,
    reason TEXT
)
RETURNS JSON AS $$
DECLARE
    nominee_record RECORD;
    vote_count INTEGER;
    result JSON;
BEGIN
    -- Get nominee information
    SELECT n.*, c.title as campaign_title INTO nominee_record
    FROM nominees n
    JOIN campaigns c ON n.campaign_id = c.id
    WHERE n.id = nominee_uuid;
    
    IF nominee_record IS NULL THEN
        RAISE EXCEPTION 'Nominee not found';
    END IF;
    
    -- Check if already evicted
    IF nominee_record.is_evicted THEN
        RAISE EXCEPTION 'Nominee is already evicted';
    END IF;
    
    -- Count current votes
    SELECT COUNT(*) INTO vote_count
    FROM votes
    WHERE nominee_id = nominee_uuid AND status = 'SUCCESS';
    
    -- Evict the nominee (soft delete)
    UPDATE nominees 
    SET 
        is_evicted = TRUE,
        evicted_at = NOW(),
        evicted_by = evictor_uuid,
        eviction_reason = reason
    WHERE id = nominee_uuid;
    
    -- Log the eviction
    INSERT INTO nominee_evictions (
        nominee_id, evicted_by, reason, vote_count_at_eviction, campaign_id
    ) VALUES (
        nominee_uuid, evictor_uuid, reason, vote_count, nominee_record.campaign_id
    );
    
    result := json_build_object(
        'success', true,
        'nominee_id', nominee_uuid,
        'nominee_name', nominee_record.name,
        'campaign_title', nominee_record.campaign_title,
        'votes_preserved', vote_count,
        'evicted_at', NOW(),
        'message', 'Nominee evicted successfully - votes preserved'
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 4. Create function to reinstate a nominee
CREATE OR REPLACE FUNCTION reinstate_nominee(
    nominee_uuid UUID,
    reinstator_uuid UUID,
    reason TEXT
)
RETURNS JSON AS $$
DECLARE
    nominee_record RECORD;
    vote_count INTEGER;
    result JSON;
BEGIN
    -- Get nominee information
    SELECT n.*, c.title as campaign_title INTO nominee_record
    FROM nominees n
    JOIN campaigns c ON n.campaign_id = c.id
    WHERE n.id = nominee_uuid;
    
    IF nominee_record IS NULL THEN
        RAISE EXCEPTION 'Nominee not found';
    END IF;
    
    -- Check if nominee is evicted
    IF NOT nominee_record.is_evicted THEN
        RAISE EXCEPTION 'Nominee is not evicted';
    END IF;
    
    -- Count current votes (should be preserved)
    SELECT COUNT(*) INTO vote_count
    FROM votes
    WHERE nominee_id = nominee_uuid AND status = 'SUCCESS';
    
    -- Reinstate the nominee
    UPDATE nominees 
    SET 
        is_evicted = FALSE,
        evicted_at = NULL,
        evicted_by = NULL,
        eviction_reason = NULL
    WHERE id = nominee_uuid;
    
    -- Log the reinstatement
    INSERT INTO nominee_evictions (
        nominee_id, evicted_by, reason, vote_count_at_eviction, campaign_id
    ) VALUES (
        nominee_uuid, reinstator_uuid, reason, vote_count, nominee_record.campaign_id
    );
    
    result := json_build_object(
        'success', true,
        'nominee_id', nominee_uuid,
        'nominee_name', nominee_record.name,
        'campaign_title', nominee_record.campaign_title,
        'votes_preserved', vote_count,
        'reinstated_at', NOW(),
        'message', 'Nominee reinstated successfully'
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 5. Update the protection function to allow eviction instead of deletion
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

-- 6. Create function to get evicted nominees
CREATE OR REPLACE FUNCTION get_evicted_nominees(campaign_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', n.id,
            'name', n.name,
            'bio', n.bio,
            'image', n.image,
            'votes_count', n.votes_count,
            'evicted_at', n.evicted_at,
            'eviction_reason', n.eviction_reason,
            'evicted_by_email', evictor.email,
            'category_name', c.name
        )
    ) INTO result
    FROM nominees n
    JOIN categories cat ON n.category_id = cat.id
    LEFT JOIN auth.users evictor ON n.evicted_by = evictor.id
    WHERE n.campaign_id = campaign_uuid 
    AND n.is_evicted = TRUE
    ORDER BY n.evicted_at DESC;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- 7. Create function to get active nominees (non-evicted)
CREATE OR REPLACE FUNCTION get_active_nominees(campaign_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', n.id,
            'name', n.name,
            'bio', n.bio,
            'image', n.image,
            'votes_count', n.votes_count,
            'category_name', c.name
        )
    ) INTO result
    FROM nominees n
    JOIN categories c ON n.category_id = c.id
    WHERE n.campaign_id = campaign_uuid 
    AND n.is_evicted = FALSE
    ORDER BY n.votes_count DESC, n.name;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- 8. Update the campaign protection to allow eviction
CREATE OR REPLACE FUNCTION prevent_nominee_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF nominee_has_votes(OLD.id) THEN
    RAISE EXCEPTION 'Cannot delete nominee "%" - it has votes. Use eviction instead to preserve voting data.', OLD.name;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_nominees_is_evicted ON nominees(is_evicted);
CREATE INDEX IF NOT EXISTS idx_nominees_evicted_at ON nominees(evicted_at);
CREATE INDEX IF NOT EXISTS idx_nominee_evictions_nominee_id ON nominee_evictions(nominee_id);
CREATE INDEX IF NOT EXISTS idx_nominee_evictions_campaign_id ON nominee_evictions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_nominee_evictions_created_at ON nominee_evictions(created_at);

-- 10. Add comments for documentation
COMMENT ON COLUMN nominees.is_evicted IS 'Whether the nominee has been evicted (hidden) from the campaign';
COMMENT ON COLUMN nominees.evicted_at IS 'When the nominee was evicted';
COMMENT ON COLUMN nominees.evicted_by IS 'User who evicted the nominee';
COMMENT ON COLUMN nominees.eviction_reason IS 'Reason for eviction';
COMMENT ON TABLE nominee_evictions IS 'Audit log of nominee evictions and reinstatements';
COMMENT ON FUNCTION evict_nominee IS 'Evicts a nominee (soft delete) while preserving votes';
COMMENT ON FUNCTION reinstate_nominee IS 'Reinstates an evicted nominee';
COMMENT ON FUNCTION get_evicted_nominees IS 'Gets all evicted nominees for a campaign';
COMMENT ON FUNCTION get_active_nominees IS 'Gets all active (non-evicted) nominees for a campaign';

-- 11. Show current eviction status
SELECT 
    'Eviction Status Summary' as check_type,
    COUNT(*) as total_nominees,
    COUNT(CASE WHEN is_evicted = TRUE THEN 1 END) as evicted_nominees,
    COUNT(CASE WHEN is_evicted = FALSE THEN 1 END) as active_nominees,
    SUM(CASE WHEN is_evicted = TRUE THEN votes_count ELSE 0 END) as votes_in_evicted_nominees
FROM nominees;

-- 12. Show evicted nominees with their vote counts
SELECT 
    n.name as nominee_name,
    c.name as category_name,
    camp.title as campaign_title,
    n.votes_count,
    n.evicted_at,
    n.eviction_reason,
    evictor.email as evicted_by_email
FROM nominees n
JOIN categories c ON n.category_id = c.id
JOIN campaigns camp ON n.campaign_id = camp.id
LEFT JOIN auth.users evictor ON n.evicted_by = evictor.id
WHERE n.is_evicted = TRUE
ORDER BY n.evicted_at DESC;
