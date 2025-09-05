-- Create payout_requests table for organizer payout management
CREATE TABLE IF NOT EXISTS payout_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Amount in cents (e.g., 1000 = ₵10.00)
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('DAILY', 'WEEKLY', 'END_OF_PROGRAM')),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'PROCESSED', 'REJECTED')),
    bank_details JSONB, -- Store bank account information
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payout_requests_organizer_id ON payout_requests(organizer_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_requested_at ON payout_requests(requested_at);

-- Enable Row Level Security
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Organizers can view their own payout requests" ON payout_requests
    FOR SELECT USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can create their own payout requests" ON payout_requests
    FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their own pending payout requests" ON payout_requests
    FOR UPDATE USING (auth.uid() = organizer_id AND status = 'PENDING');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payout_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_payout_requests_updated_at
    BEFORE UPDATE ON payout_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_payout_requests_updated_at();

-- Add comments for documentation
COMMENT ON TABLE payout_requests IS 'Stores payout requests from organizers';
COMMENT ON COLUMN payout_requests.amount IS 'Amount in cents (e.g., 1000 = ₵10.00)';
COMMENT ON COLUMN payout_requests.request_type IS 'Type of payout: DAILY, WEEKLY, or END_OF_PROGRAM';
COMMENT ON COLUMN payout_requests.status IS 'Current status of the payout request';
COMMENT ON COLUMN payout_requests.bank_details IS 'JSON object containing bank account information';
