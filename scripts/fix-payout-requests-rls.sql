-- Fix Row Level Security policies for payout_requests table
-- This script enables RLS and creates policies for authenticated users

-- Enable RLS on payout_requests table
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own payout requests" ON payout_requests;
DROP POLICY IF EXISTS "Users can create their own payout requests" ON payout_requests;
DROP POLICY IF EXISTS "Users can update their own payout requests" ON payout_requests;

-- Create policy for users to view their own payout requests
CREATE POLICY "Users can view their own payout requests" ON payout_requests
    FOR SELECT
    USING (auth.uid() = organizer_id);

-- Create policy for users to create their own payout requests
CREATE POLICY "Users can create their own payout requests" ON payout_requests
    FOR INSERT
    WITH CHECK (auth.uid() = organizer_id);

-- Create policy for users to update their own payout requests (for status updates)
CREATE POLICY "Users can update their own payout requests" ON payout_requests
    FOR UPDATE
    USING (auth.uid() = organizer_id)
    WITH CHECK (auth.uid() = organizer_id);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'payout_requests';


