-- Admin Override System
-- Allows administrators to handle special situations with proper audit trails
-- This should be used carefully and only by trusted administrators

-- 1. Create admin roles table
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'admin', -- admin, super_admin
    permissions JSONB DEFAULT '{}', -- specific permissions
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create admin actions audit log
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    action_type VARCHAR(100) NOT NULL, -- delete_campaign, modify_campaign, etc.
    target_type VARCHAR(50) NOT NULL, -- campaign, nominee, category
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE user_id = user_uuid 
    AND is_active = true
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql;

-- 4. Create function to check admin permissions
CREATE OR REPLACE FUNCTION has_admin_permission(user_uuid UUID, permission VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  user_permissions JSONB;
BEGIN
  SELECT permissions INTO user_permissions
  FROM admin_roles 
  WHERE user_id = user_uuid 
  AND is_active = true
  AND role IN ('admin', 'super_admin');
  
  IF user_permissions IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Super admins have all permissions
  IF (SELECT role FROM admin_roles WHERE user_id = user_uuid AND is_active = true LIMIT 1) = 'super_admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Check specific permission
  RETURN COALESCE((user_permissions->>permission)::boolean, FALSE);
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  admin_uuid UUID,
  action_type VARCHAR,
  target_type VARCHAR,
  target_id UUID,
  reason TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  action_id UUID;
BEGIN
  INSERT INTO admin_actions (
    admin_id, action_type, target_type, target_id, 
    reason, details, ip_address, user_agent
  ) VALUES (
    admin_uuid, action_type, target_type, target_id,
    reason, details, ip_address, user_agent
  ) RETURNING id INTO action_id;
  
  RETURN action_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Create admin override functions for campaigns
CREATE OR REPLACE FUNCTION admin_delete_campaign(
  admin_uuid UUID,
  campaign_uuid UUID,
  reason TEXT,
  ip_address INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  campaign_title TEXT;
  vote_count INTEGER;
  action_id UUID;
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(admin_uuid) THEN
    RAISE EXCEPTION 'Access denied: User is not an administrator';
  END IF;
  
  -- Check if user has delete permission
  IF NOT has_admin_permission(admin_uuid, 'delete_campaigns') THEN
    RAISE EXCEPTION 'Access denied: Insufficient permissions to delete campaigns';
  END IF;
  
  -- Get campaign info
  SELECT title INTO campaign_title FROM campaigns WHERE id = campaign_uuid;
  IF campaign_title IS NULL THEN
    RAISE EXCEPTION 'Campaign not found';
  END IF;
  
  -- Count votes
  SELECT COUNT(*) INTO vote_count 
  FROM votes 
  WHERE campaign_id = campaign_uuid AND status = 'SUCCESS';
  
  -- Log the action
  action_id := log_admin_action(
    admin_uuid, 'delete_campaign', 'campaign', campaign_uuid,
    reason, 
    json_build_object(
      'campaign_title', campaign_title,
      'vote_count', vote_count,
      'votes_lost', vote_count
    ),
    ip_address, user_agent
  );
  
  -- Delete the campaign (this will cascade to votes, nominees, etc.)
  DELETE FROM campaigns WHERE id = campaign_uuid;
  
  result := json_build_object(
    'success', true,
    'action_id', action_id,
    'campaign_title', campaign_title,
    'votes_lost', vote_count,
    'message', 'Campaign deleted by admin override'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 7. Create admin override function for nominees
CREATE OR REPLACE FUNCTION admin_delete_nominee(
  admin_uuid UUID,
  nominee_uuid UUID,
  reason TEXT,
  ip_address INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  nominee_name TEXT;
  vote_count INTEGER;
  action_id UUID;
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(admin_uuid) THEN
    RAISE EXCEPTION 'Access denied: User is not an administrator';
  END IF;
  
  -- Check if user has delete permission
  IF NOT has_admin_permission(admin_uuid, 'delete_nominees') THEN
    RAISE EXCEPTION 'Access denied: Insufficient permissions to delete nominees';
  END IF;
  
  -- Get nominee info
  SELECT name INTO nominee_name FROM nominees WHERE id = nominee_uuid;
  IF nominee_name IS NULL THEN
    RAISE EXCEPTION 'Nominee not found';
  END IF;
  
  -- Count votes
  SELECT COUNT(*) INTO vote_count 
  FROM votes 
  WHERE nominee_id = nominee_uuid AND status = 'SUCCESS';
  
  -- Log the action
  action_id := log_admin_action(
    admin_uuid, 'delete_nominee', 'nominee', nominee_uuid,
    reason,
    json_build_object(
      'nominee_name', nominee_name,
      'vote_count', vote_count,
      'votes_lost', vote_count
    ),
    ip_address, user_agent
  );
  
  -- Delete the nominee (this will cascade to votes)
  DELETE FROM nominees WHERE id = nominee_uuid;
  
  result := json_build_object(
    'success', true,
    'action_id', action_id,
    'nominee_name', nominee_name,
    'votes_lost', vote_count,
    'message', 'Nominee deleted by admin override'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to transfer votes between nominees
CREATE OR REPLACE FUNCTION admin_transfer_votes(
  admin_uuid UUID,
  from_nominee_uuid UUID,
  to_nominee_uuid UUID,
  reason TEXT,
  ip_address INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  from_nominee_name TEXT;
  to_nominee_name TEXT;
  vote_count INTEGER;
  action_id UUID;
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(admin_uuid) THEN
    RAISE EXCEPTION 'Access denied: User is not an administrator';
  END IF;
  
  -- Check if user has modify permission
  IF NOT has_admin_permission(admin_uuid, 'modify_votes') THEN
    RAISE EXCEPTION 'Access denied: Insufficient permissions to modify votes';
  END IF;
  
  -- Get nominee names
  SELECT name INTO from_nominee_name FROM nominees WHERE id = from_nominee_uuid;
  SELECT name INTO to_nominee_name FROM nominees WHERE id = to_nominee_uuid;
  
  IF from_nominee_name IS NULL OR to_nominee_name IS NULL THEN
    RAISE EXCEPTION 'One or both nominees not found';
  END IF;
  
  -- Count votes to transfer
  SELECT COUNT(*) INTO vote_count 
  FROM votes 
  WHERE nominee_id = from_nominee_uuid AND status = 'SUCCESS';
  
  -- Log the action
  action_id := log_admin_action(
    admin_uuid, 'transfer_votes', 'nominee', from_nominee_uuid,
    reason,
    json_build_object(
      'from_nominee', from_nominee_name,
      'to_nominee', to_nominee_name,
      'vote_count', vote_count
    ),
    ip_address, user_agent
  );
  
  -- Transfer votes
  UPDATE votes 
  SET nominee_id = to_nominee_uuid 
  WHERE nominee_id = from_nominee_uuid AND status = 'SUCCESS';
  
  -- Update vote counts
  UPDATE nominees 
  SET votes_count = (
    SELECT COALESCE(SUM(amount / 100), 0)
    FROM votes 
    WHERE nominee_id = nominees.id AND status = 'SUCCESS'
  )
  WHERE id IN (from_nominee_uuid, to_nominee_uuid);
  
  result := json_build_object(
    'success', true,
    'action_id', action_id,
    'from_nominee', from_nominee_name,
    'to_nominee', to_nominee_name,
    'votes_transferred', vote_count,
    'message', 'Votes transferred by admin override'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 9. Create function to get admin action history
CREATE OR REPLACE FUNCTION get_admin_actions(
  admin_uuid UUID,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT is_admin(admin_uuid) THEN
    RAISE EXCEPTION 'Access denied: User is not an administrator';
  END IF;
  
  SELECT json_agg(
    json_build_object(
      'id', aa.id,
      'action_type', aa.action_type,
      'target_type', aa.target_type,
      'target_id', aa.target_id,
      'reason', aa.reason,
      'details', aa.details,
      'ip_address', aa.ip_address,
      'user_agent', aa.user_agent,
      'created_at', aa.created_at,
      'admin_email', au.email
    )
  ) INTO result
  FROM admin_actions aa
  JOIN auth.users au ON aa.admin_id = au.id
  ORDER BY aa.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- 10. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_active ON admin_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON admin_actions(target_type, target_id);

-- 11. Add comments for documentation
COMMENT ON TABLE admin_roles IS 'Stores admin user roles and permissions';
COMMENT ON TABLE admin_actions IS 'Audit log of all admin override actions';
COMMENT ON FUNCTION is_admin IS 'Checks if a user has admin privileges';
COMMENT ON FUNCTION has_admin_permission IS 'Checks if admin has specific permission';
COMMENT ON FUNCTION log_admin_action IS 'Logs admin actions for audit trail';
COMMENT ON FUNCTION admin_delete_campaign IS 'Admin override to delete campaigns with votes';
COMMENT ON FUNCTION admin_delete_nominee IS 'Admin override to delete nominees with votes';
COMMENT ON FUNCTION admin_transfer_votes IS 'Admin override to transfer votes between nominees';
COMMENT ON FUNCTION get_admin_actions IS 'Retrieves admin action history';

-- 12. Example: Grant admin role to a user (replace with actual user ID)
-- INSERT INTO admin_roles (user_id, role, permissions, granted_by) 
-- VALUES (
--   'user-uuid-here',
--   'admin',
--   '{"delete_campaigns": true, "delete_nominees": true, "modify_votes": true}',
--   'super-admin-uuid-here'
-- );

-- 13. Show current admin users
SELECT 
  ar.id,
  au.email,
  ar.role,
  ar.permissions,
  ar.is_active,
  ar.granted_at,
  granter.email as granted_by_email
FROM admin_roles ar
JOIN auth.users au ON ar.user_id = au.id
LEFT JOIN auth.users granter ON ar.granted_by = granter.id
WHERE ar.is_active = true
ORDER BY ar.granted_at DESC;
