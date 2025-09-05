-- Fix all campaign amounts to be consistent (1 GHS = 100 pesewas)
-- This script will standardize all campaigns to 1 GHS per vote

-- First, let's see what we have currently
SELECT 
    id,
    title,
    amount_per_vote,
    CASE 
        WHEN amount_per_vote = 100 THEN '1 GHS (Correct)'
        WHEN amount_per_vote = 10000 THEN '100 GHS (Wrong - too high)'
        WHEN amount_per_vote = 1 THEN '0.01 GHS (Wrong - too low)'
        ELSE CONCAT((amount_per_vote / 100.0)::text, ' GHS (Other)')
    END as amount_display,
    created_at
FROM campaigns 
ORDER BY created_at DESC;

-- Update all campaigns to 1 GHS (100 pesewas)
UPDATE campaigns 
SET amount_per_vote = 100 
WHERE amount_per_vote != 100;

-- Show the results after update
SELECT 
    id,
    title,
    amount_per_vote,
    '1 GHS (Fixed)' as amount_display,
    updated_at
FROM campaigns 
ORDER BY updated_at DESC;
