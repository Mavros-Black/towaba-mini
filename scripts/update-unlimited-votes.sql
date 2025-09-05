-- Update all existing campaigns to have unlimited votes (999999)
UPDATE campaigns 
SET max_votes_per_user = 999999 
WHERE max_votes_per_user < 999999;

-- Show the updated campaigns
SELECT 
    id,
    title,
    max_votes_per_user,
    created_at
FROM campaigns 
ORDER BY created_at DESC;
