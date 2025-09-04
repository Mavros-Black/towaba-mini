-- Add Admin User Script
-- Run this after the admin-override-system.sql script

-- 1. First, find your user ID from the auth.users table
-- Replace 'your-email@example.com' with your actual email
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'your-email@example.com';

-- 2. Once you have your user ID, add yourself as an admin
-- Replace 'your-user-id-here' with the actual UUID from step 1
INSERT INTO admin_roles (user_id, role, permissions, granted_by) 
VALUES (
  'your-user-id-here',  -- Replace with your actual user ID
  'super_admin',        -- or 'admin' for limited permissions
  '{"delete_campaigns": true, "delete_nominees": true, "modify_votes": true, "view_audit_logs": true}',
  'your-user-id-here'   -- Self-granted (replace with your user ID)
);

-- 3. Verify your admin role was added
SELECT 
  ar.id,
  au.email,
  ar.role,
  ar.permissions,
  ar.is_active,
  ar.granted_at
FROM admin_roles ar
JOIN auth.users au ON ar.user_id = au.id
WHERE au.email = 'your-email@example.com';

-- 4. Test admin functions
-- This should return true if you're properly set up as admin
SELECT is_admin('your-user-id-here');

-- 5. Check available permissions
SELECT has_admin_permission('your-user-id-here', 'delete_campaigns');
SELECT has_admin_permission('your-user-id-here', 'delete_nominees');
SELECT has_admin_permission('your-user-id-here', 'modify_votes');
