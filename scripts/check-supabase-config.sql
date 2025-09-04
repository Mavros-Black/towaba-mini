-- Check Supabase Configuration
-- This script helps verify your Supabase setup

-- 1. Check if we can access the auth schema
SELECT '=== AUTH SCHEMA ACCESS ===' as section;
SELECT 
    schema_name,
    schema_owner
FROM information_schema.schemata 
WHERE schema_name = 'auth';

-- 2. Check auth.users table permissions
SELECT '=== AUTH.USERS PERMISSIONS ===' as section;
SELECT 
    table_name, 
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_schema = 'auth' 
    AND table_name = 'users'
    AND grantee IN ('authenticated', 'anon', 'service_role')
ORDER BY grantee, privilege_type;

-- 3. Check if we can read from auth.users
SELECT '=== AUTH.USERS ACCESS TEST ===' as section;
SELECT 
    COUNT(*) as total_auth_users,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users,
    COUNT(CASE WHEN email_confirmed_at IS NULL THEN 1 END) as unconfirmed_users
FROM auth.users;

-- 4. Check public.users table permissions
SELECT '=== PUBLIC.USERS PERMISSIONS ===' as section;
SELECT 
    table_name, 
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
    AND table_name = 'users'
    AND grantee IN ('authenticated', 'anon', 'service_role')
ORDER BY grantee, privilege_type;

-- 5. Test if we can insert into public.users
SELECT '=== PUBLIC.USERS INSERT TEST ===' as section;
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    test_email TEXT := 'test-insert-' || extract(epoch from now()) || '@example.com';
BEGIN
    BEGIN
        INSERT INTO public.users (id, email, name) 
        VALUES (test_id, test_email, 'Test Insert User');
        
        RAISE NOTICE 'Public users insert successful for email: %', test_email;
        
        -- Clean up
        DELETE FROM public.users WHERE id = test_id;
        RAISE NOTICE 'Test user cleaned up successfully';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Public users insert failed: %', SQLERRM;
    END;
END $$;

-- 6. Check if the trigger function has the right permissions
SELECT '=== TRIGGER FUNCTION PERMISSIONS ===' as section;
SELECT 
    routine_name,
    security_type,
    definer_rights
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 7. Check for any RLS policies that might be blocking inserts
SELECT '=== RLS POLICIES ===' as section;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'users';

-- 8. Check if there are any check constraints
SELECT '=== CHECK CONSTRAINTS ===' as section;
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%users%';

-- Success message
SELECT '=== CONFIGURATION CHECK COMPLETE ===' as section;
SELECT 'Review the output above for any permission or configuration issues' as message;
