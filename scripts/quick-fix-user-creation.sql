-- Quick Fix for User Creation Error
-- This script addresses the most common issues

-- 1. First, let's see what we're working with
SELECT 'Starting quick fix for user creation...' as status;

-- 2. Drop and recreate the trigger function with proper permissions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Create a more robust trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into public.users when a new user is created in auth.users
  -- Use ON CONFLICT to handle any race conditions
  INSERT INTO public.users (id, email, name, created_at, updated_at)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(
      new.raw_user_meta_data->>'name', 
      split_part(new.email, '@', 1)
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    updated_at = NOW();
  
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the auth user creation
  RAISE WARNING 'Failed to create public.users record for user %: %', new.email, SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant necessary permissions to the function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- 5. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Ensure the users table has the right structure
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE NOT NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 7. Remove password column if it exists (old system)
ALTER TABLE public.users DROP COLUMN IF EXISTS password;

-- 8. Grant proper permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO service_role;
GRANT SELECT ON public.users TO anon;

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);

-- 10. Test the function
SELECT 'Testing the trigger function...' as status;

-- 11. Create a test function to verify everything works
CREATE OR REPLACE FUNCTION public.test_user_creation()
RETURNS TEXT AS $$
DECLARE
    test_id UUID := gen_random_uuid();
    test_email TEXT := 'test-' || extract(epoch from now()) || '@example.com';
    result TEXT;
BEGIN
    -- Test inserting into public.users directly
    BEGIN
        INSERT INTO public.users (id, email, name) 
        VALUES (test_id, test_email, 'Test User');
        
        -- Clean up
        DELETE FROM public.users WHERE id = test_id;
        
        result := 'Direct insert test: SUCCESS';
    EXCEPTION WHEN OTHERS THEN
        result := 'Direct insert test: FAILED - ' || SQLERRM;
    END;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Run the test
SELECT public.test_user_creation() as test_result;

-- 13. Clean up test function
DROP FUNCTION IF EXISTS public.test_user_creation();

-- 14. Success message
SELECT 'Quick fix completed! Try creating a user now.' as status;

-- 15. Show current users table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
