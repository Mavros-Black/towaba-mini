-- Diagnose Payout 500 Error
-- This script helps identify what's causing the 500 error
-- Run this in your Supabase SQL Editor

-- Step 1: Check if payout_requests table exists and its structure
SELECT '=== PAYOUT_REQUESTS TABLE STATUS ===' as step;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payout_requests' AND table_schema = 'public')
        THEN 'EXISTS'
        ELSE 'DOES NOT EXIST'
    END as table_status;

-- If table exists, show its structure
SELECT '=== TABLE STRUCTURE ===' as step;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'payout_requests' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check foreign key constraints
SELECT '=== FOREIGN KEY CONSTRAINTS ===' as step;
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'payout_requests';

-- Step 2: Check if auth.users table exists and has data
SELECT '=== AUTH.USERS STATUS ===' as step;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'auth')
        THEN 'EXISTS'
        ELSE 'DOES NOT EXIST'
    END as auth_users_status;

-- Count users in auth.users
SELECT '=== AUTH USERS COUNT ===' as step;
SELECT COUNT(*) as auth_users_count FROM auth.users;

-- Step 3: Check if public.users table exists
SELECT '=== PUBLIC.USERS STATUS ===' as step;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public')
        THEN 'EXISTS'
        ELSE 'DOES NOT EXIST'
    END as public_users_status;

-- Step 4: Check RLS policies
SELECT '=== RLS POLICIES ===' as step;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'payout_requests';

-- Step 5: Test if we can query the table
SELECT '=== TABLE ACCESS TEST ===' as step;
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payout_requests' AND table_schema = 'public') THEN
        PERFORM COUNT(*) FROM payout_requests;
        RAISE NOTICE 'SUCCESS: Can query payout_requests table';
    ELSE
        RAISE NOTICE 'ERROR: payout_requests table does not exist';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Cannot query payout_requests table - %', SQLERRM;
END $$;

-- Step 6: Test foreign key constraint
SELECT '=== FOREIGN KEY TEST ===' as step;
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get first user from auth.users
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        BEGIN
            -- Try to insert a test record (will be rolled back)
            INSERT INTO payout_requests (
                organizer_id,
                amount,
                request_type,
                status
            ) VALUES (
                test_user_id,
                1000,
                'TEST',
                'PENDING'
            );
            
            -- If we get here, the insert worked
            RAISE NOTICE 'SUCCESS: Foreign key constraint works';
            
            -- Rollback the test insert
            ROLLBACK;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'ERROR: Foreign key constraint failed - %', SQLERRM;
                ROLLBACK;
        END;
    ELSE
        RAISE NOTICE 'WARNING: No users in auth.users to test foreign key';
    END IF;
END $$;

-- Step 7: Check for any error logs or issues
SELECT '=== DIAGNOSIS COMPLETE ===' as step;
SELECT 'Check the output above for any ERROR messages' as instruction;
