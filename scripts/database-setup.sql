-- Database Setup for Towaba Voting App
-- Run this in your Supabase SQL Editor

-- Create custom types for enums
CREATE TYPE vote_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
CREATE TYPE payment_method AS ENUM ('PAYSTACK', 'NALO_USSD');

-- Create users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nominees table
CREATE TABLE nominees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    bio TEXT,
    image TEXT,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    votes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- stored in kobo/pesewas
    reference TEXT UNIQUE NOT NULL,
    status payment_status DEFAULT 'PENDING',
    method payment_method NOT NULL,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    metadata JSONB, -- for payment details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nominee_id UUID NOT NULL REFERENCES nominees(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- stored in kobo/pesewas
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    status vote_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_campaigns_organizer_id ON campaigns(organizer_id);
CREATE INDEX idx_categories_campaign_id ON categories(campaign_id);
CREATE INDEX idx_nominees_category_id ON nominees(category_id);
CREATE INDEX idx_nominees_campaign_id ON nominees(campaign_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_nominee_id ON votes(nominee_id);
CREATE INDEX idx_votes_campaign_id ON votes(campaign_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_campaign_id ON payments(campaign_id);
CREATE INDEX idx_payments_reference ON payments(reference);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nominees_updated_at BEFORE UPDATE ON nominees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update vote count
CREATE OR REPLACE FUNCTION update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Convert pesewas to votes: 100 pesewas = 1 vote
        UPDATE nominees SET votes_count = votes_count + FLOOR(NEW.amount / 100)
        WHERE id = NEW.nominee_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Convert pesewas to votes: 100 pesewas = 1 vote
        UPDATE nominees SET votes_count = votes_count - FLOOR(OLD.amount / 100)
        WHERE id = OLD.nominee_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Convert pesewas to votes: 100 pesewas = 1 vote
        UPDATE nominees SET votes_count = votes_count - FLOOR(OLD.amount / 100)
        WHERE id = OLD.nominee_id;
        UPDATE nominees SET votes_count = votes_count + FLOOR(NEW.amount / 100)
        WHERE id = NEW.nominee_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for vote count updates
CREATE TRIGGER update_nominee_vote_count
    AFTER INSERT OR UPDATE OR DELETE ON votes
    FOR EACH ROW EXECUTE FUNCTION update_vote_count();

-- Insert some sample data
INSERT INTO users (id, email, name, password) VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'admin@example.com', 'Admin User', 'hashed_password_here'),
    ('550e8400-e29b-41d4-a716-446655440001', 'organizer@example.com', 'Event Organizer', 'hashed_password_here'),
    ('550e8400-e29b-41d4-a716-446655440002', 'voter@example.com', 'Voter User', 'hashed_password_here');

INSERT INTO campaigns (id, title, description, cover_image, organizer_id) VALUES 
    ('550e8400-e29b-41d4-a716-446655440010', 'Ghana Music Awards 2024', 'The biggest music awards ceremony in Ghana', 'https://example.com/cover1.jpg', '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO categories (id, name, campaign_id) VALUES 
    ('550e8400-e29b-41d4-a716-446655440020', 'Best Artist of the Year', '550e8400-e29b-41d4-a716-446655440010'),
    ('550e8400-e29b-41d4-a716-446655440021', 'Best Song of the Year', '550e8400-e29b-41d4-a716-446655440010'),
    ('550e8400-e29b-41d4-a716-446655440022', 'Best New Artist', '550e8400-e29b-41d4-a716-446655440010');

INSERT INTO nominees (id, name, bio, image, category_id, campaign_id) VALUES 
    ('550e8400-e29b-41d4-a716-446655440030', 'Sarkodie', 'Ghanaian rapper and entrepreneur', 'https://example.com/sarkodie.jpg', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440010'),
    ('550e8400-e29b-41d4-a716-446655440031', 'Shatta Wale', 'Ghanaian dancehall artist', 'https://example.com/shatta.jpg', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440010'),
    ('550e8400-e29b-41d4-a716-446655440032', 'Stonebwoy', 'Ghanaian reggae and dancehall artist', 'https://example.com/stonebwoy.jpg', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440010');

-- Success message
SELECT 'Database setup completed successfully! All tables, functions, and sample data have been created.' as status;
