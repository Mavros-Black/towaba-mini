-- Fix campaign price from 200 cedis to 2 cedis
-- This updates the amount_per_vote from 20000 pesewas to 200 pesewas

UPDATE campaigns 
SET amount_per_vote = 200 
WHERE amount_per_vote = 20000;

-- Verify the change
SELECT id, title, amount_per_vote, 
       (amount_per_vote / 100.0) as amount_in_cedis
FROM campaigns 
WHERE amount_per_vote = 200;
