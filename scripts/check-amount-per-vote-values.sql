-- Check Amount Per Vote Values
-- This script helps diagnose why campaign statistics show 100 GHS per vote

-- 1. Check all campaigns and their amount_per_vote values
SELECT '=== ALL CAMPAIGNS WITH AMOUNT PER VOTE ===' as section;
SELECT 
    id,
    title,
    amount_per_vote,
    require_payment,
    CASE 
        WHEN amount_per_vote IS NULL THEN 'NULL'
        WHEN amount_per_vote = 0 THEN 'ZERO'
        WHEN amount_per_vote < 100 THEN 'Less than 1 GHS (likely in GHS)'
        WHEN amount_per_vote = 100 THEN '1 GHS (100 pesewas)'
        WHEN amount_per_vote = 1000 THEN '10 GHS (1000 pesewas)'
        WHEN amount_per_vote = 10000 THEN '100 GHS (10000 pesewas)'
        WHEN amount_per_vote > 10000 THEN 'More than 100 GHS'
        ELSE 'Other value'
    END as interpretation,
    (amount_per_vote / 100) as display_value_ghs
FROM campaigns 
WHERE amount_per_vote IS NOT NULL
ORDER BY amount_per_vote DESC;

-- 2. Check campaigns that might be showing 100 GHS
SELECT '=== CAMPAIGNS SHOWING 100 GHS ===' as section;
SELECT 
    id,
    title,
    amount_per_vote,
    (amount_per_vote / 100) as display_value_ghs
FROM campaigns 
WHERE amount_per_vote = 10000  -- This would display as 100.00 GHS
ORDER BY created_at DESC;

-- 3. Check campaigns with very high amounts
SELECT '=== CAMPAIGNS WITH HIGH AMOUNTS ===' as section;
SELECT 
    id,
    title,
    amount_per_vote,
    (amount_per_vote / 100) as display_value_ghs
FROM campaigns 
WHERE amount_per_vote > 1000  -- More than 10 GHS
ORDER BY amount_per_vote DESC;

-- 4. Check recent campaigns
SELECT '=== RECENT CAMPAIGNS ===' as section;
SELECT 
    id,
    title,
    amount_per_vote,
    require_payment,
    (amount_per_vote / 100) as display_value_ghs,
    created_at
FROM campaigns 
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check if there are any campaigns with amount_per_vote = 10000
SELECT '=== CAMPAIGNS WITH 10000 PESEWAS (100 GHS) ===' as section;
SELECT 
    COUNT(*) as count,
    'campaigns with amount_per_vote = 10000' as description
FROM campaigns 
WHERE amount_per_vote = 10000;

-- 6. Show summary statistics
SELECT '=== SUMMARY STATISTICS ===' as section;
SELECT 
    COUNT(*) as total_campaigns,
    COUNT(CASE WHEN amount_per_vote IS NULL THEN 1 END) as null_amounts,
    COUNT(CASE WHEN amount_per_vote = 0 THEN 1 END) as zero_amounts,
    COUNT(CASE WHEN amount_per_vote = 100 THEN 1 END) as one_ghs_campaigns,
    COUNT(CASE WHEN amount_per_vote = 1000 THEN 1 END) as ten_ghs_campaigns,
    COUNT(CASE WHEN amount_per_vote = 10000 THEN 1 END) as hundred_ghs_campaigns,
    MIN(amount_per_vote) as min_amount,
    MAX(amount_per_vote) as max_amount,
    AVG(amount_per_vote) as avg_amount
FROM campaigns 
WHERE amount_per_vote IS NOT NULL;
