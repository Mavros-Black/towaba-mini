-- Fix Amount Per Vote Conversion
-- This script fixes campaigns that have amount_per_vote stored incorrectly

-- 1. Check current amount_per_vote values
SELECT '=== CURRENT AMOUNT PER VOTE VALUES ===' as section;
SELECT 
    id,
    title,
    amount_per_vote,
    CASE 
        WHEN amount_per_vote IS NULL THEN 'NULL'
        WHEN amount_per_vote < 100 THEN 'Likely in GHS (needs conversion)'
        WHEN amount_per_vote >= 100 THEN 'Likely in pesewas (correct)'
        ELSE 'Unknown'
    END as status
FROM campaigns 
WHERE amount_per_vote IS NOT NULL
ORDER BY amount_per_vote;

-- 2. Count campaigns that need fixing
SELECT '=== CAMPAIGNS NEEDING FIX ===' as section;
SELECT 
    COUNT(*) as total_campaigns,
    COUNT(CASE WHEN amount_per_vote IS NULL THEN 1 END) as null_amounts,
    COUNT(CASE WHEN amount_per_vote < 100 AND amount_per_vote > 0 THEN 1 END) as needs_conversion,
    COUNT(CASE WHEN amount_per_vote >= 100 THEN 1 END) as already_correct
FROM campaigns;

-- 3. Fix campaigns that have amount_per_vote < 100 (convert GHS to pesewas)
-- This assumes that values < 100 are in GHS and need to be converted to pesewas
UPDATE campaigns 
SET amount_per_vote = amount_per_vote * 100
WHERE amount_per_vote < 100 
    AND amount_per_vote > 0;

-- 4. Show the results after fixing
SELECT '=== AMOUNT PER VOTE VALUES AFTER FIX ===' as section;
SELECT 
    id,
    title,
    amount_per_vote,
    CASE 
        WHEN amount_per_vote IS NULL THEN 'NULL'
        WHEN amount_per_vote < 100 THEN 'Still needs attention'
        WHEN amount_per_vote >= 100 THEN 'Correct (in pesewas)'
        ELSE 'Unknown'
    END as status
FROM campaigns 
WHERE amount_per_vote IS NOT NULL
ORDER BY amount_per_vote;

-- 5. Show final count
SELECT '=== FINAL COUNT ===' as section;
SELECT 
    COUNT(*) as total_campaigns,
    COUNT(CASE WHEN amount_per_vote IS NULL THEN 1 END) as null_amounts,
    COUNT(CASE WHEN amount_per_vote < 100 AND amount_per_vote > 0 THEN 1 END) as still_needs_conversion,
    COUNT(CASE WHEN amount_per_vote >= 100 THEN 1 END) as correctly_converted
FROM campaigns;

-- 6. Success message
SELECT 'Amount per vote conversion fix completed!' as status;
