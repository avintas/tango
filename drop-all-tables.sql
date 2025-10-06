-- Drop All Tables Script for Supabase Database
-- WARNING: This will permanently delete ALL data and tables!
-- Make sure you have backups before running this script.

-- Disable RLS temporarily to avoid policy conflicts during drops
SET session_replication_role = replica;

-- Drop all triggers first (to avoid dependency issues)
DROP TRIGGER IF EXISTS audit_cms_users ON cms_users CASCADE;
DROP TRIGGER IF EXISTS audit_content_items ON content_items CASCADE;
DROP TRIGGER IF EXISTS audit_media_library ON media_library CASCADE;
DROP TRIGGER IF EXISTS update_content_categories_updated_at ON content_categories CASCADE;
DROP TRIGGER IF EXISTS update_content_items_updated_at ON content_items CASCADE;
DROP TRIGGER IF EXISTS update_media_library_updated_at ON media_library CASCADE;
DROP TRIGGER IF EXISTS auto_generate_content_slug_trigger ON content_items CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS log_activity() CASCADE;
DROP FUNCTION IF EXISTS get_user_role() CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS is_editor() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_slug(TEXT) CASCADE;
DROP FUNCTION IF EXISTS auto_generate_content_slug() CASCADE;

-- Drop all policies (RLS policies)
DROP POLICY IF EXISTS "Users can view own profile" ON cms_users CASCADE;
DROP POLICY IF EXISTS "Users can update own profile" ON cms_users CASCADE;
DROP POLICY IF EXISTS "Admins can view all users" ON cms_users CASCADE;
DROP POLICY IF EXISTS "Super admins can create users" ON cms_users CASCADE;
DROP POLICY IF EXISTS "Super admins can update user roles" ON cms_users CASCADE;
DROP POLICY IF EXISTS "Admins can view groups" ON cms_groups CASCADE;
DROP POLICY IF EXISTS "Super admins can create groups" ON cms_groups CASCADE;
DROP POLICY IF EXISTS "Super admins can update groups" ON cms_groups CASCADE;
DROP POLICY IF EXISTS "Super admins can delete groups" ON cms_groups CASCADE;
DROP POLICY IF EXISTS "Authenticated users can view categories" ON content_categories CASCADE;
DROP POLICY IF EXISTS "Admins can create categories" ON content_categories CASCADE;
DROP POLICY IF EXISTS "Admins can update categories" ON content_categories CASCADE;
DROP POLICY IF EXISTS "Super admins can delete categories" ON content_categories CASCADE;
DROP POLICY IF EXISTS "Users can view published content" ON content_items CASCADE;
DROP POLICY IF EXISTS "Authors can view own content" ON content_items CASCADE;
DROP POLICY IF EXISTS "Editors can create content" ON content_items CASCADE;
DROP POLICY IF EXISTS "Authors can update own content" ON content_items CASCADE;
DROP POLICY IF EXISTS "Admins can delete content" ON content_items CASCADE;
DROP POLICY IF EXISTS "Users can view content relationships" ON content_relationships CASCADE;
DROP POLICY IF EXISTS "Editors can create relationships" ON content_relationships CASCADE;
DROP POLICY IF EXISTS "Editors can update relationships" ON content_relationships CASCADE;
DROP POLICY IF EXISTS "Admins can delete relationships" ON content_relationships CASCADE;
DROP POLICY IF EXISTS "Users can view media" ON media_library CASCADE;
DROP POLICY IF EXISTS "Editors can upload media" ON media_library CASCADE;
DROP POLICY IF EXISTS "Admins can update media" ON media_library CASCADE;
DROP POLICY IF EXISTS "Super admins can delete media" ON media_library CASCADE;
DROP POLICY IF EXISTS "Admins can view activity logs" ON cms_activity_log CASCADE;
DROP POLICY IF EXISTS "System can insert activity logs" ON cms_activity_log CASCADE;
DROP POLICY IF EXISTS "Super admins can delete activity logs" ON cms_activity_log CASCADE;
DROP POLICY IF EXISTS "Allow all authenticated users to manage categories" ON content_categories CASCADE;
DROP POLICY IF EXISTS "Allow all authenticated users to manage content" ON content_items CASCADE;
DROP POLICY IF EXISTS "Allow all authenticated users to manage media" ON media_library CASCADE;

-- Drop all tables (in reverse dependency order)
DROP TABLE IF EXISTS cms_activity_log CASCADE;
DROP TABLE IF EXISTS content_relationships CASCADE;
DROP TABLE IF EXISTS content_items CASCADE;
DROP TABLE IF EXISTS content_categories CASCADE;
DROP TABLE IF EXISTS media_library CASCADE;
DROP TABLE IF EXISTS cms_groups CASCADE;
DROP TABLE IF EXISTS cms_users CASCADE;

-- Drop all indexes (if any remain)
DROP INDEX IF EXISTS idx_content_items_category_id CASCADE;
DROP INDEX IF EXISTS idx_content_items_status CASCADE;
DROP INDEX IF EXISTS idx_content_items_published_at CASCADE;
DROP INDEX IF EXISTS idx_content_items_slug CASCADE;
DROP INDEX IF EXISTS idx_content_categories_slug CASCADE;

-- Re-enable normal replication role
SET session_replication_role = DEFAULT;

-- Verify all tables are dropped
SELECT 
    schemaname,
    tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE 'sql_%'
ORDER BY tablename;

-- Show completion message
SELECT 'All tables, policies, functions, and triggers have been dropped successfully!' as status;
