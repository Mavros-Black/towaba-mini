-- Fix Payout Requests Table for Supabase Auth
-- This script fixes the foreign key reference issue in payout_requests table
-- Run this in your Supabase SQL Editor

-- First, check if payout_requests table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'payout_requests'
) as table_exists;

-- Drop the existing payout_requests table if it exists (to fix the foreign key issue)
DROP TABLE IF EXISTS public.payout_requests CASCADE;

-- Create the payout_requests table with correct foreign key reference
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payout_requests_organizer_id ON payout_requests(organizer_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_requested_at ON payout_requests(requested_at);

-- Enable RLS
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own payout requests" ON payout_requests;
DROP POLICY IF EXISTS "Users can create their own payout requests" ON payout_requests;
DROP POLICY IF EXISTS "Users can update their own payout requests" ON payout_requests;

-- Create RLS policies
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

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_payout_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_payout_requests_updated_at ON payout_requests;
CREATE TRIGGER trigger_update_payout_requests_updated_at
    BEFORE UPDATE ON payout_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_payout_requests_updated_at();

-- Verify the table structure
SELECT '=== PAYOUT_REQUESTS TABLE STRUCTURE ===' as section;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'payout_requests'
ORDER BY ordinal_position;

-- Verify the policies were created
SELECT '=== RLS POLICIES ===' as section;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'payout_requests';

-- Test the table by checking if we can query it
SELECT '=== TABLE VERIFICATION ===' as section;
SELECT COUNT(*) as row_count FROM payout_requests;

SELECT 'Payout requests table fixed successfully!' as status;
