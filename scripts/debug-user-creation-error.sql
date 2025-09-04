-- Debug User Creation Error
-- Run this in your Supabase SQL Editor to identify the exact issue

-- 1. Check if users table exists and its current structure
SELECT '=== USERS TABLE STRUCTURE ===' as section;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Check if auth.users table exists (Supabase Auth)
SELECT '=== AUTH.USERS TABLE STRUCTURE ===' as section;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users' 
ORDER BY ordinal_position;

-- 3. Check for any constraints on users table
SELECT '=== USERS TABLE CONSTRAINTS ===' as section;
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
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
WHERE tc.table_name = 'users'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 4. Check if the trigger exists and is working
SELECT '=== TRIGGER STATUS ===' as section;
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing, 
    action_statement,
    trigger_schema
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 5. Check if the function exists
SELECT '=== FUNCTION STATUS ===' as section;
SELECT 
    routine_name, 
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 6. Check current data in both tables
SELECT '=== CURRENT DATA ===' as section;
SELECT 'public.users' as table_name, COUNT(*) as user_count FROM users
UNION ALL
SELECT 'auth.users' as table_name, COUNT(*) as user_count FROM auth.users;

-- 7. Check for any recent errors in the logs (if available)
SELECT '=== RECENT ACTIVITY ===' as section;
SELECT 
    'public.users' as table_name,
    created_at,
    email,
    name
FROM users 
ORDER BY created_at DESC 
LIMIT 5;

-- 8. Test if we can insert a test user manually
SELECT '=== MANUAL INSERT TEST ===' as section;
-- This will show if there are any constraint issues
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    test_email TEXT := 'test-' || extract(epoch from now()) || '@example.com';
BEGIN
    BEGIN
        INSERT INTO users (id, email, name) 
        VALUES (test_id, test_email, 'Test User');
        
        RAISE NOTICE 'Manual insert successful for email: %', test_email;
        
        -- Clean up
        DELETE FROM users WHERE id = test_id;
        RAISE NOTICE 'Test user cleaned up successfully';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Manual insert failed: %', SQLERRM;
    END;
END $$;

-- 9. Check permissions
SELECT '=== PERMISSIONS ===' as section;
SELECT 
    table_name, 
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_name = 'users' 
    AND grantee IN ('authenticated', 'anon', 'service_role')
ORDER BY grantee, privilege_type;

-- 10. Check for any RLS policies
SELECT '=== ROW LEVEL SECURITY ===' as section;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Success message
SELECT '=== DIAGNOSTIC COMPLETE ===' as section;
SELECT 'Please check the output above for any errors or issues' as message;
