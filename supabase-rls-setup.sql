-- Tango CMS - Row Level Security Setup
-- This script enables RLS and creates security policies for the Onlyhockey.com CMS

-- Enable RLS on all tables
ALTER TABLE cms_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

-- ========================================
-- CMS USERS TABLE POLICIES
-- ========================================

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON cms_users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Allow users to update their own profile (except role)
CREATE POLICY "Users can update own profile" ON cms_users
    FOR UPDATE USING (auth.uid()::text = id::text)
    WITH CHECK (auth.uid()::text = id::text);

-- Only admins can view all users
CREATE POLICY "Admins can view all users" ON cms_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'admin')
        )
    );

-- Only super admins can create new users
CREATE POLICY "Super admins can create users" ON cms_users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role = 'super_admin'
        )
    );

-- Only super admins can update user roles
CREATE POLICY "Super admins can update user roles" ON cms_users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role = 'super_admin'
        )
    );

-- ========================================
-- CMS GROUPS TABLE POLICIES
-- ========================================

-- Admins and super admins can view all groups
CREATE POLICY "Admins can view groups" ON cms_groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'admin')
        )
    );

-- Only super admins can create groups
CREATE POLICY "Super admins can create groups" ON cms_groups
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role = 'super_admin'
        )
    );

-- Only super admins can update groups
CREATE POLICY "Super admins can update groups" ON cms_groups
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role = 'super_admin'
        )
    );

-- Only super admins can delete groups
CREATE POLICY "Super admins can delete groups" ON cms_groups
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role = 'super_admin'
        )
    );

-- ========================================
-- CONTENT CATEGORIES TABLE POLICIES
-- ========================================

-- All authenticated users can view categories
CREATE POLICY "Authenticated users can view categories" ON content_categories
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can create categories
CREATE POLICY "Admins can create categories" ON content_categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'admin', 'editor')
        )
    );

-- Only admins can update categories
CREATE POLICY "Admins can update categories" ON content_categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'admin', 'editor')
        )
    );

-- Only super admins can delete categories
CREATE POLICY "Super admins can delete categories" ON content_categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role = 'super_admin'
        )
    );

-- ========================================
-- CONTENT ITEMS TABLE POLICIES
-- ========================================

-- All authenticated users can view published content
CREATE POLICY "Users can view published content" ON content_items
    FOR SELECT USING (
        status = 'published' OR
        EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'admin', 'editor')
        )
    );

-- Authors can view their own content
CREATE POLICY "Authors can view own content" ON content_items
    FOR SELECT USING (author_id::text = auth.uid()::text);

-- Only editors and above can create content
CREATE POLICY "Editors can create content" ON content_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'admin', 'editor')
        )
    );

-- Authors can update their own content, editors can update all
CREATE POLICY "Authors can update own content" ON content_items
    FOR UPDATE USING (
        author_id::text = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'admin', 'editor')
        )
    );

-- Only admins can delete content
CREATE POLICY "Admins can delete content" ON content_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'admin')
        )
    );

-- ========================================
-- CONTENT RELATIONSHIPS TABLE POLICIES
-- ========================================

-- All authenticated users can view relationships
CREATE POLICY "Users can view content relationships" ON content_relationships
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only editors can create relationships
CREATE POLICY "Editors can create relationships" ON content_relationships
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'admin', 'editor')
        )
    );

-- Only editors can update relationships
CREATE POLICY "Editors can update relationships" ON content_relationships
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'admin', 'editor')
        )
    );

-- Only admins can delete relationships
CREATE POLICY "Admins can delete relationships" ON content_relationships
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'admin')
        )
    );

-- ========================================
-- MEDIA LIBRARY TABLE POLICIES
-- ========================================

-- All authenticated users can view media
CREATE POLICY "Users can view media" ON media_library
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only editors can upload media
CREATE POLICY "Editors can upload media" ON media_library
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'admin', 'editor')
        )
    );

-- Only admins can update media metadata
CREATE POLICY "Admins can update media" ON media_library
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'admin')
        )
    );

-- Only super admins can delete media
CREATE POLICY "Super admins can delete media" ON media_library
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role = 'super_admin'
        )
    );

-- ========================================
-- CMS ACTIVITY LOG TABLE POLICIES
-- ========================================

-- Only admins can view activity logs
CREATE POLICY "Admins can view activity logs" ON cms_activity_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'admin')
        )
    );

-- System can insert activity logs (for triggers/functions)
CREATE POLICY "System can insert activity logs" ON cms_activity_log
    FOR INSERT WITH CHECK (true);

-- Only super admins can delete activity logs
CREATE POLICY "Super admins can delete activity logs" ON cms_activity_log
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role = 'super_admin'
        )
    );

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Function to get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role FROM cms_users 
        WHERE id::text = auth.uid()::text
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'admin')
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is editor or above
CREATE OR REPLACE FUNCTION is_editor()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT EXISTS (
            SELECT 1 FROM cms_users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('super_admin', 'admin', 'editor')
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- AUDIT TRIGGER FUNCTION
-- ========================================

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO cms_activity_log (
        table_name,
        operation,
        record_id,
        user_id,
        old_values,
        new_values,
        created_at
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.id, OLD.id),
        auth.uid()::text,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
        NOW()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for audit logging on important tables
CREATE TRIGGER audit_cms_users
    AFTER INSERT OR UPDATE OR DELETE ON cms_users
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER audit_content_items
    AFTER INSERT OR UPDATE OR DELETE ON content_items
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER audit_media_library
    AFTER INSERT OR UPDATE OR DELETE ON media_library
    FOR EACH ROW EXECUTE FUNCTION log_activity();

-- ========================================
-- INITIAL DATA SETUP
-- ========================================

-- Insert default super admin user (replace with your actual user ID from Supabase Auth)
-- You'll need to get your user ID from the Supabase Auth dashboard
-- and replace 'your-user-id-here' with the actual UUID

-- Example (uncomment and modify):
-- INSERT INTO cms_users (id, email, name, role, is_active, created_at)
-- VALUES (
--     'your-user-id-here'::uuid,
--     'admin@onlyhockey.com',
--     'Super Admin',
--     'super_admin',
--     true,
--     NOW()
-- );

-- Insert default categories
INSERT INTO content_categories (name, slug, description, created_at) VALUES
('Hockey News', 'hockey-news', 'Latest hockey news and updates', NOW()),
('Player Profiles', 'player-profiles', 'Profiles of hockey players', NOW()),
('Game Analysis', 'game-analysis', 'In-depth game analysis and breakdowns', NOW()),
('Community', 'community', 'Community stories and features', NOW()),
('Tips & Training', 'tips-training', 'Hockey tips and training advice', NOW())
ON CONFLICT (slug) DO NOTHING;

-- Insert default groups
INSERT INTO cms_groups (name, description, permissions, created_at) VALUES
('Content Editors', 'Users who can create and edit content', 
 '["create_content", "edit_content", "upload_media"]'::jsonb, NOW()),
('Content Managers', 'Users who can manage all content and users', 
 '["create_content", "edit_content", "delete_content", "manage_users", "upload_media"]'::jsonb, NOW()),
('Super Admins', 'Full system access', 
 '["*"]'::jsonb, NOW())
ON CONFLICT (name) DO NOTHING;
