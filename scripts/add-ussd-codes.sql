-- Add USSD code column to nominees table
-- This script adds the ussd_code column to the nominees table

-- Add the ussd_code column
ALTER TABLE nominees 
ADD COLUMN ussd_code VARCHAR(4) UNIQUE;

-- Create an index for faster lookups
CREATE INDEX idx_nominees_ussd_code ON nominees(ussd_code);

-- Add a comment to the column
COMMENT ON COLUMN nominees.ussd_code IS 'Unique 4-digit USSD code for direct voting via mobile';

-- Update existing nominees with USSD codes (if any exist)
-- This will generate random 4-digit codes for existing nominees
DO $$
DECLARE
    nominee_record RECORD;
    new_code VARCHAR(4);
    code_exists BOOLEAN;
BEGIN
    -- Loop through all nominees that don't have USSD codes
    FOR nominee_record IN 
        SELECT id FROM nominees WHERE ussd_code IS NULL
    LOOP
        -- Generate a unique code
        LOOP
            -- Generate random 4-digit code (1000-9999)
            new_code := LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0');
            
            -- Check if code already exists
            SELECT EXISTS(SELECT 1 FROM nominees WHERE ussd_code = new_code) INTO code_exists;
            
            -- If code doesn't exist, use it
            IF NOT code_exists THEN
                EXIT;
            END IF;
        END LOOP;
        
        -- Update the nominee with the new code
        UPDATE nominees 
        SET ussd_code = new_code 
        WHERE id = nominee_record.id;
        
        RAISE NOTICE 'Assigned USSD code % to nominee %', new_code, nominee_record.id;
    END LOOP;
END $$;

-- Verify the changes
SELECT 
    COUNT(*) as total_nominees,
    COUNT(ussd_code) as nominees_with_codes,
    COUNT(*) - COUNT(ussd_code) as nominees_without_codes
FROM nominees;

-- Show sample of updated nominees
SELECT 
    id,
    name,
    ussd_code,
    created_at
FROM nominees 
WHERE ussd_code IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
