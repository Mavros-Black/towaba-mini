-- Test User Creation System
-- Run this after fixing the user creation system

-- 1. Test the trigger function
SELECT 'Testing trigger function...' as status;

-- 2. Check if the trigger exists
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 3. Check if the function exists
SELECT 
    routine_name, 
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 4. Test the user_exists function
SELECT public.user_exists('test@example.com') as user_exists_test;

-- 5. Check current users count
SELECT 
    'public.users' as table_name, 
    COUNT(*) as user_count 
FROM users
UNION ALL
SELECT 
    'auth.users' as table_name, 
    COUNT(*) as user_count 
FROM auth.users;

-- 6. Show users table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 7. Test permissions
SELECT 
    table_name, 
    privilege_type
FROM information_schema.table_privileges 
WHERE grantee = 'authenticated' 
    AND table_name = 'users';

-- Success message
SELECT 'User creation system test completed!' as status;
