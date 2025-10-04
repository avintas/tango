# Row Level Security (RLS) Setup Guide for Tango CMS

## Overview

This guide will help you secure your Supabase database by enabling Row Level Security (RLS) and implementing proper access control policies for your Onlyhockey.com CMS.

## Security Architecture

### User Roles

- **Super Admin**: Full system access, can manage users, delete content/media
- **Admin**: Can manage content, users, and media (except deletion)
- **Editor**: Can create and edit content, upload media
- **Author**: Can create and edit their own content only

### Table Access Levels

| Table                   | View                     | Create           | Update                    | Delete           |
| ----------------------- | ------------------------ | ---------------- | ------------------------- | ---------------- |
| `cms_users`             | Own profile + Admins     | Super Admin only | Own profile + Super Admin | Super Admin only |
| `cms_groups`            | Admins                   | Super Admin only | Super Admin only          | Super Admin only |
| `content_categories`    | All authenticated        | Editors+         | Editors+                  | Super Admin only |
| `content_items`         | Published + Own + Admins | Editors+         | Own + Editors+            | Admins only      |
| `content_relationships` | All authenticated        | Editors+         | Editors+                  | Admins only      |
| `media_library`         | All authenticated        | Editors+         | Admins only               | Super Admin only |
| `cms_activity_log`      | Admins only              | System only      | -                         | Super Admin only |

## Setup Instructions

### Step 1: Run the RLS Setup Script

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `supabase-rls-setup.sql`
4. Execute the script

### Step 2: Create Your Super Admin User

After running the RLS script, you need to create your first super admin user:

1. **Get your User ID from Supabase Auth:**
   - Go to Authentication → Users in your Supabase dashboard
   - Find your user and copy the User ID (UUID)

2. **Insert yourself as Super Admin:**
   ```sql
   INSERT INTO cms_users (id, email, name, role, is_active, created_at)
   VALUES (
       'your-actual-user-id-here'::uuid,
       'your-email@example.com',
       'Your Name',
       'super_admin',
       true,
       NOW()
   );
   ```

### Step 3: Verify RLS is Working

1. **Test as unauthenticated user:**

   ```sql
   -- This should fail
   SELECT * FROM cms_users;
   ```

2. **Test as authenticated user:**

   ```sql
   -- This should only show your own profile
   SELECT * FROM cms_users;
   ```

3. **Test admin functions:**

   ```sql
   -- Check if you're an admin
   SELECT is_admin();

   -- Get your role
   SELECT get_user_role();
   ```

## Security Features

### Audit Logging

- All changes to `cms_users`, `content_items`, and `media_library` are automatically logged
- Activity logs include: table name, operation, record ID, user ID, old/new values, timestamp
- Only admins can view activity logs

### Helper Functions

- `get_user_role()`: Returns current user's role
- `is_admin()`: Returns true if user is admin or super admin
- `is_editor()`: Returns true if user is editor or above

### Content Access Control

- Published content is visible to all authenticated users
- Authors can only see/edit their own unpublished content
- Editors can see/edit all content
- Admins can delete content

### Media Security

- All authenticated users can view media
- Only editors+ can upload
- Only admins can update metadata
- Only super admins can delete

## Testing Your Setup

### 1. Test User Access

```sql
-- Should only return your profile
SELECT id, email, name, role FROM cms_users;

-- Should return all categories
SELECT * FROM content_categories;
```

### 2. Test Content Access

```sql
-- Should return published content + your own content
SELECT id, title, status, author_id FROM content_items;
```

### 3. Test Admin Functions

```sql
-- Should return true if you're admin
SELECT is_admin();

-- Should return your role
SELECT get_user_role();
```

## Troubleshooting

### Common Issues

1. **"Permission denied" errors:**
   - Make sure you're logged in to Supabase
   - Check that your user exists in `cms_users` table
   - Verify your role is correct

2. **Can't see any data:**
   - Check that RLS policies are properly applied
   - Verify your user has the correct role
   - Make sure you're authenticated

3. **Can't create content:**
   - Ensure your role is 'editor' or above
   - Check that the `content_items` table has the correct policies

### Debugging Queries

```sql
-- Check current user
SELECT auth.uid(), auth.role();

-- Check your user record
SELECT * FROM cms_users WHERE id::text = auth.uid()::text;

-- Check if you're admin
SELECT is_admin();

-- View all your permissions
SELECT
    table_name,
    policy_name,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public';
```

## Next Steps

1. **Create additional users** with appropriate roles
2. **Set up content categories** for your hockey content
3. **Test content creation and editing** workflows
4. **Configure media uploads** with proper permissions
5. **Monitor activity logs** for security auditing

## Security Best Practices

1. **Regularly review activity logs**
2. **Use least privilege principle** - give users only the access they need
3. **Monitor for unusual activity**
4. **Keep user roles up to date**
5. **Regularly audit permissions**

## Support

If you encounter issues:

1. Check the Supabase logs for detailed error messages
2. Verify your user authentication status
3. Test with the debugging queries above
4. Review the RLS policies for the specific table/operation

Remember: RLS is enforced at the database level, so all queries (including those from your Next.js app) will be subject to these policies.
