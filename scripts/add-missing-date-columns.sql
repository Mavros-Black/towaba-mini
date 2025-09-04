-- Add missing date columns to campaigns table if they don't exist
-- This script is safe to run multiple times

-- Check if start_date column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'start_date'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN start_date TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added start_date column to campaigns table';
    ELSE
        RAISE NOTICE 'start_date column already exists in campaigns table';
    END IF;
END $$;

-- Check if end_date column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'end_date'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN end_date TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added end_date column to campaigns table';
    ELSE
        RAISE NOTICE 'end_date column already exists in campaigns table';
    END IF;
END $$;

-- Check if amount_per_vote column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'amount_per_vote'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN amount_per_vote INTEGER DEFAULT 100;
        RAISE NOTICE 'Added amount_per_vote column to campaigns table';
    ELSE
        RAISE NOTICE 'amount_per_vote column already exists in campaigns table';
    END IF;
END $$;

-- Check if is_public column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'is_public'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN is_public BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_public column to campaigns table';
    ELSE
        RAISE NOTICE 'is_public column already exists in campaigns table';
    END IF;
END $$;

-- Check if allow_anonymous_voting column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'allow_anonymous_voting'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN allow_anonymous_voting BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added allow_anonymous_voting column to campaigns table';
    ELSE
        RAISE NOTICE 'allow_anonymous_voting column already exists in campaigns table';
    END IF;
END $$;

-- Check if max_votes_per_user column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'max_votes_per_user'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN max_votes_per_user INTEGER DEFAULT 10;
        RAISE NOTICE 'Added max_votes_per_user column to campaigns table';
    ELSE
        RAISE NOTICE 'max_votes_per_user column already exists in campaigns table';
    END IF;
END $$;

-- Check if require_payment column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'require_payment'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN require_payment BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added require_payment column to campaigns table';
    ELSE
        RAISE NOTICE 'require_payment column already exists in campaigns table';
    END IF;
END $$;

-- Check if payment_methods column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'payment_methods'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN payment_methods TEXT[] DEFAULT ARRAY['PAYSTACK'];
        RAISE NOTICE 'Added payment_methods column to campaigns table';
    ELSE
        RAISE NOTICE 'payment_methods column already exists in campaigns table';
    END IF;
END $$;

-- Check if auto_publish column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'auto_publish'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN auto_publish BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added auto_publish column to campaigns table';
    ELSE
        RAISE NOTICE 'auto_publish column already exists in campaigns table';
    END IF;
END $$;

-- Check if allow_editing column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'allow_editing'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN allow_editing BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added allow_editing column to campaigns table';
    ELSE
        RAISE NOTICE 'allow_editing column already exists in campaigns table';
    END IF;
END $$;

-- Check if show_vote_counts column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'show_vote_counts'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN show_vote_counts BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added show_vote_counts column to campaigns table';
    ELSE
        RAISE NOTICE 'show_vote_counts column already exists in campaigns table';
    END IF;
END $$;

-- Check if show_voter_names column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'show_voter_names'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN show_voter_names BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added show_voter_names column to campaigns table';
    ELSE
        RAISE NOTICE 'show_voter_names column already exists in campaigns table';
    END IF;
END $$;

-- Show current table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
ORDER BY ordinal_position;
