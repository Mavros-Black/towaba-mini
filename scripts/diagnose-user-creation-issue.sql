-- Diagnose User Creation Issue
-- Run this in your Supabase SQL Editor to identify the problem

-- 1. Check if users table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Check if auth.users table exists (Supabase Auth)
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users' 
ORDER BY ordinal_position;

-- 3. Check if the trigger exists for auto-creating users
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing, 
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 4. Check if the handle_new_user function exists
SELECT 
    routine_name, 
    routine_type, 
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 5. Check current users in both tables
SELECT 'public.users' as table_name, COUNT(*) as user_count FROM users
UNION ALL
SELECT 'auth.users' as table_name, COUNT(*) as user_count FROM auth.users;

-- 6. Check for any foreign key constraints on users table
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
    AND (tc.table_name = 'users' OR ccu.table_name = 'users');

-- 7. Check for any errors in the logs (if available)
-- This will help identify what's failing during user creation
