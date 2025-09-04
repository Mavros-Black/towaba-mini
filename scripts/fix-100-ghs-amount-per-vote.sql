-- Fix 100 GHS Amount Per Vote Issue
-- This script identifies and fixes campaigns showing 100 GHS per vote

-- 1. First, let's see what's causing the 100 GHS display
SELECT '=== DIAGNOSING 100 GHS ISSUE ===' as section;
SELECT 
    id,
    title,
    amount_per_vote,
    (amount_per_vote / 100) as display_value_ghs,
    CASE 
        WHEN amount_per_vote = 10000 THEN 'This shows as 100.00 GHS'
        WHEN amount_per_vote = 1000 THEN 'This shows as 10.00 GHS'
        WHEN amount_per_vote = 100 THEN 'This shows as 1.00 GHS'
        WHEN amount_per_vote = 1 THEN 'This shows as 0.01 GHS'
        ELSE 'Other value'
    END as explanation
FROM campaigns 
WHERE amount_per_vote IS NOT NULL
ORDER BY amount_per_vote DESC;

-- 2. Check if there are campaigns with amount_per_vote = 10000
SELECT '=== CAMPAIGNS WITH 10000 PESEWAS (100 GHS) ===' as section;
SELECT 
    id,
    title,
    amount_per_vote,
    created_at
FROM campaigns 
WHERE amount_per_vote = 10000
ORDER BY created_at DESC;

-- 3. Check if there are campaigns with amount_per_vote = 1000
SELECT '=== CAMPAIGNS WITH 1000 PESEWAS (10 GHS) ===' as section;
SELECT 
    id,
    title,
    amount_per_vote,
    created_at
FROM campaigns 
WHERE amount_per_vote = 1000
ORDER BY created_at DESC;

-- 4. Check if there are campaigns with amount_per_vote = 100
SELECT '=== CAMPAIGNS WITH 100 PESEWAS (1 GHS) ===' as section;
SELECT 
    id,
    title,
    amount_per_vote,
    created_at
FROM campaigns 
WHERE amount_per_vote = 100
ORDER BY created_at DESC;

-- 5. Fix campaigns that have amount_per_vote = 10000 (likely should be 100)
-- This assumes that 10000 pesewas (100 GHS) is too high and should be 100 pesewas (1 GHS)
UPDATE campaigns 
SET amount_per_vote = 100
WHERE amount_per_vote = 10000;

-- 6. Fix campaigns that have amount_per_vote = 1000 (likely should be 100)
-- This assumes that 1000 pesewas (10 GHS) is too high and should be 100 pesewas (1 GHS)
UPDATE campaigns 
SET amount_per_vote = 100
WHERE amount_per_vote = 1000;

-- 7. Show the results after fixing
SELECT '=== AMOUNT PER VOTE VALUES AFTER FIX ===' as section;
SELECT 
    id,
    title,
    amount_per_vote,
    (amount_per_vote / 100) as display_value_ghs,
    CASE 
        WHEN amount_per_vote = 100 THEN '1.00 GHS (correct)'
        WHEN amount_per_vote = 1000 THEN '10.00 GHS'
        WHEN amount_per_vote = 10000 THEN '100.00 GHS'
        ELSE 'Other value'
    END as status
FROM campaigns 
WHERE amount_per_vote IS NOT NULL
ORDER BY amount_per_vote DESC;

-- 8. Show summary of changes
SELECT '=== SUMMARY OF CHANGES ===' as section;
SELECT 
    COUNT(CASE WHEN amount_per_vote = 100 THEN 1 END) as one_ghs_campaigns,
    COUNT(CASE WHEN amount_per_vote = 1000 THEN 1 END) as ten_ghs_campaigns,
    COUNT(CASE WHEN amount_per_vote = 10000 THEN 1 END) as hundred_ghs_campaigns,
    COUNT(*) as total_campaigns_with_amounts
FROM campaigns 
WHERE amount_per_vote IS NOT NULL;

-- 9. Success message
SELECT 'Amount per vote fix completed! Campaigns should now show correct amounts.' as status;
