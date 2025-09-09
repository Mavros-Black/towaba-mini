-- Add Current User as Admin
-- This script will add the currently logged-in user as a super admin

-- 1. First, let's see all users to identify the current user
SELECT 
  id, 
  email, 
  created_at,
  raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Check if admin_roles table exists and has any data
SELECT 
  ar.id,
  au.email,
  ar.role,
  ar.is_active,
  ar.granted_at
FROM admin_roles ar
JOIN auth.users au ON ar.user_id = au.id
ORDER BY ar.granted_at DESC;

-- 3. Add the most recent user as super admin (replace with actual user ID)
-- You'll need to replace 'USER_ID_HERE' with the actual UUID from step 1
INSERT INTO admin_roles (user_id, role, permissions, granted_by) 
VALUES (
  'USER_ID_HERE',  -- Replace with actual user ID from step 1
  'super_admin',
  '{"delete_campaigns": true, "delete_nominees": true, "modify_votes": true, "view_audit_logs": true, "manage_users": true, "manage_campaigns": true}',
  'USER_ID_HERE'   -- Self-granted (replace with actual user ID)
) ON CONFLICT (user_id) DO UPDATE SET
  role = 'super_admin',
  permissions = '{"delete_campaigns": true, "delete_nominees": true, "modify_votes": true, "view_audit_logs": true, "manage_users": true, "manage_campaigns": true}',
  is_active = true,
  granted_at = NOW();

-- 4. Verify the admin role was added
SELECT 
  ar.id,
  au.email,
  ar.role,
  ar.permissions,
  ar.is_active,
  ar.granted_at
FROM admin_roles ar
JOIN auth.users au ON ar.user_id = au.id
WHERE ar.is_active = true
ORDER BY ar.granted_at DESC;

-- 5. Test admin functions
-- Replace 'USER_ID_HERE' with the actual user ID
SELECT is_admin('USER_ID_HERE') as is_admin_user;
SELECT has_admin_permission('USER_ID_HERE', 'delete_campaigns') as can_delete_campaigns;
