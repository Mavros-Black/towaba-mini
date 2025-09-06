-- Run this script in your Supabase SQL Editor to set up payout requests

-- First, check if the table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'payout_requests'
);

-- If the table doesn't exist, create it
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organizer_id uuid NOT NULL,
    amount bigint NOT NULL,
    request_type text NOT NULL, -- e.g., 'DAILY', 'WEEKLY', 'END_OF_PROGRAM'
    status text DEFAULT 'PENDING'::text NOT NULL, -- e.g., 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'
    bank_details jsonb, -- Store bank account details as JSONB
    requested_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone,
    notes text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payout_requests_pkey PRIMARY KEY (id),
    CONSTRAINT payout_requests_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_payout_requests_organizer_id ON public.payout_requests USING btree (organizer_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON public.payout_requests USING btree (status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_requested_at ON public.payout_requests USING btree (requested_at DESC);

-- Enable Row Level Security
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Organizers can view their own payout requests" ON public.payout_requests;
DROP POLICY IF EXISTS "Organizers can create their own payout requests" ON public.payout_requests;
DROP POLICY IF EXISTS "Organizers can update their own payout requests" ON public.payout_requests;

-- Create policies for payout_requests
CREATE POLICY "Organizers can view their own payout requests"
ON public.payout_requests FOR SELECT
USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can create their own payout requests"
ON public.payout_requests FOR INSERT
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their own payout requests"
ON public.payout_requests FOR UPDATE
USING (auth.uid() = organizer_id);

-- Set up trigger for updated_at (if the function exists)
CREATE OR REPLACE FUNCTION moddatetime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS handle_updated_at ON public.payout_requests;
CREATE TRIGGER handle_updated_at 
    BEFORE UPDATE ON public.payout_requests
    FOR EACH ROW EXECUTE FUNCTION moddatetime();

-- Verify the setup
SELECT 'Payout requests table setup completed successfully!' as status;
