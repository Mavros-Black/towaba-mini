-- Complete Payout Requests Fix for Supabase Auth
-- This script completely fixes the payout requests system
-- Run this in your Supabase SQL Editor

-- Step 1: Check current state
SELECT '=== CHECKING CURRENT STATE ===' as step;

-- Check if payout_requests table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'payout_requests'
) as payout_requests_exists;

-- Check if public.users table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'users'
) as public_users_exists;

-- Check if auth.users table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'auth' 
   AND table_name = 'users'
) as auth_users_exists;

-- Step 2: Drop existing payout_requests table if it exists
SELECT '=== DROPPING EXISTING TABLE ===' as step;
DROP TABLE IF EXISTS public.payout_requests CASCADE;

-- Step 3: Create the correct payout_requests table
SELECT '=== CREATING PAYOUT_REQUESTS TABLE ===' as step;
CREATE TABLE public.payout_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Amount in pesewas
    request_type VARCHAR(50) NOT NULL, -- 'DAILY', 'WEEKLY', 'END_OF_PROGRAM'
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'PROCESSED'
    bank_details JSONB, -- Bank account details
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create indexes for better performance
SELECT '=== CREATING INDEXES ===' as step;
CREATE INDEX IF NOT EXISTS idx_payout_requests_organizer_id ON payout_requests(organizer_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_requested_at ON payout_requests(requested_at);

-- Step 5: Enable Row Level Security
SELECT '=== ENABLING RLS ===' as step;
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
SELECT '=== CREATING RLS POLICIES ===' as step;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own payout requests" ON payout_requests;
DROP POLICY IF EXISTS "Users can create their own payout requests" ON payout_requests;
DROP POLICY IF EXISTS "Users can update their own payout requests" ON payout_requests;

-- Create new policies
CREATE POLICY "Users can view their own payout requests" ON payout_requests
    FOR SELECT
    USING (auth.uid() = organizer_id);

CREATE POLICY "Users can create their own payout requests" ON payout_requests
    FOR INSERT
    WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update their own payout requests" ON payout_requests
    FOR UPDATE
    USING (auth.uid() = organizer_id)
    WITH CHECK (auth.uid() = organizer_id);

-- Step 7: Create trigger function for updated_at
SELECT '=== CREATING TRIGGER FUNCTION ===' as step;
CREATE OR REPLACE FUNCTION update_payout_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create trigger
SELECT '=== CREATING TRIGGER ===' as step;
DROP TRIGGER IF EXISTS trigger_update_payout_requests_updated_at ON payout_requests;
CREATE TRIGGER trigger_update_payout_requests_updated_at
    BEFORE UPDATE ON payout_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_payout_requests_updated_at();

-- Step 9: Verify the setup
SELECT '=== VERIFICATION ===' as step;

-- Check table structure
SELECT 'Table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'payout_requests'
ORDER BY ordinal_position;

-- Check foreign key constraints
SELECT 'Foreign key constraints:' as info;
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

-- Check RLS policies
SELECT 'RLS policies:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'payout_requests';

-- Check triggers
SELECT 'Triggers:' as info;
SELECT trigger_name, event_manipulation, action_timing, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'payout_requests';

-- Test the table
SELECT 'Testing table access:' as info;
SELECT COUNT(*) as row_count FROM payout_requests;

SELECT '=== PAYOUT REQUESTS TABLE FIXED SUCCESSFULLY! ===' as status;
