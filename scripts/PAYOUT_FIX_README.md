# Payout Requests Fix

## Problem
The payout request creation was failing with the error: "Failed to create payout request"

## Root Cause
The `payout_requests` table was referencing `public.users(id)` in its foreign key constraint, but the current database setup uses Supabase Auth where users are stored in `auth.users`, not `public.users`.

## Solution
The fix involves updating the foreign key reference from `public.users(id)` to `auth.users(id)`.

## Files to Run

### 1. Complete Fix (Recommended)
Run `complete-payout-fix.sql` - This script:
- Drops the existing `payout_requests` table
- Creates a new table with correct foreign key reference to `auth.users(id)`
- Sets up proper RLS policies
- Creates necessary indexes and triggers
- Verifies the setup

### 2. Test the Fix
Run `test-payout-creation.sql` - This script:
- Checks if users exist in both `auth.users` and `public.users`
- Tests inserting a payout request
- Verifies the table structure

## How to Apply the Fix

1. Open your Supabase SQL Editor
2. Run the `complete-payout-fix.sql` script
3. Verify the output shows "PAYOUT REQUESTS TABLE FIXED SUCCESSFULLY!"
4. Optionally run `test-payout-creation.sql` to verify everything works

## What This Fixes

- ✅ Payout request creation will now work
- ✅ Foreign key constraints are properly set up
- ✅ RLS policies allow users to manage their own payout requests
- ✅ Proper indexing for performance
- ✅ Automatic timestamp updates

## API Endpoint
The fix resolves issues with the `/api/organizer/payouts` POST endpoint.

## Verification
After running the fix, you should be able to:
1. Create payout requests through the API
2. View payout requests for authenticated users
3. Update payout request status

The error "Failed to create payout request" should no longer occur.
