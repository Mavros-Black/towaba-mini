-- Test Payout Creation
-- This script tests if the payout requests table is working correctly
-- Run this in your Supabase SQL Editor

-- First, check if we have any users in auth.users
SELECT '=== CHECKING AUTH USERS ===' as step;
SELECT COUNT(*) as auth_users_count FROM auth.users;

-- Check if we have any users in public.users (if it exists)
SELECT '=== CHECKING PUBLIC USERS ===' as step;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public')
        THEN (SELECT COUNT(*)::text FROM public.users)
        ELSE 'Table does not exist'
    END as public_users_count;

-- Test inserting a payout request (this will fail if there are no users)
SELECT '=== TESTING PAYOUT INSERT ===' as step;

-- Try to insert a test payout request
-- Note: This will only work if there's at least one user in auth.users
DO $$
DECLARE
    test_user_id UUID;
    test_payout_id UUID;
BEGIN
    -- Get the first user from auth.users
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Try to insert a test payout request
        INSERT INTO payout_requests (
            organizer_id,
            amount,
            request_type,
            status,
            bank_details
        ) VALUES (
            test_user_id,
            10000, -- 100 GHS in pesewas
            'TEST',
            'PENDING',
            '{"account_number": "1234567890", "bank_name": "Test Bank"}'::jsonb
        ) RETURNING id INTO test_payout_id;
        
        RAISE NOTICE 'Test payout request created successfully with ID: %', test_payout_id;
        
        -- Clean up the test record
        DELETE FROM payout_requests WHERE id = test_payout_id;
        RAISE NOTICE 'Test payout request cleaned up';
        
    ELSE
        RAISE NOTICE 'No users found in auth.users - cannot test payout creation';
    END IF;
END $$;

-- Check the current state of payout_requests table
SELECT '=== CURRENT PAYOUT REQUESTS ===' as step;
SELECT COUNT(*) as current_payout_requests FROM payout_requests;

-- Show table structure one more time
SELECT '=== FINAL TABLE STRUCTURE ===' as step;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'payout_requests'
ORDER BY ordinal_position;

SELECT '=== TEST COMPLETED ===' as status;
