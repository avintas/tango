# RLS Policies Quick Reference

## User Roles & Permissions

| Role          | Description                  | Permissions                                                  |
| ------------- | ---------------------------- | ------------------------------------------------------------ |
| `super_admin` | Full system access           | All operations on all tables                                 |
| `admin`       | Content and user management  | Create/read/update content, users, media; view activity logs |
| `editor`      | Content creation and editing | Create/read/update content and categories; upload media      |
| `author`      | Limited content access       | Read published content; create/update own content            |

## Table Access Matrix

### cms_users

- **View**: Own profile + Admins (all users)
- **Create**: Super Admin only
- **Update**: Own profile + Super Admin (roles)
- **Delete**: Super Admin only

### cms_groups

- **View**: Admins only
- **Create**: Super Admin only
- **Update**: Super Admin only
- **Delete**: Super Admin only

### content_categories

- **View**: All authenticated users
- **Create**: Editors+
- **Update**: Editors+
- **Delete**: Super Admin only

### content_items

- **View**: Published content + Own content + Admins (all)
- **Create**: Editors+
- **Update**: Own content + Editors+ (all)
- **Delete**: Admins only

### content_relationships

- **View**: All authenticated users
- **Create**: Editors+
- **Update**: Editors+
- **Delete**: Admins only

### media_library

- **View**: All authenticated users
- **Create**: Editors+
- **Update**: Admins only
- **Delete**: Super Admin only

### cms_activity_log

- **View**: Admins only
- **Create**: System only (triggers)
- **Update**: N/A
- **Delete**: Super Admin only

## Helper Functions

```sql
-- Get current user's role
SELECT get_user_role();

-- Check if user is admin or super admin
SELECT is_admin();

-- Check if user is editor or above
SELECT is_editor();
```

## Common Queries for Testing

```sql
-- Check your authentication status
SELECT auth.uid(), auth.role();

-- View your user profile
SELECT * FROM cms_users WHERE id::text = auth.uid()::text;

-- View all published content
SELECT * FROM content_items WHERE status = 'published';

-- View your own content
SELECT * FROM content_items WHERE author_id::text = auth.uid()::text;

-- View all content (admin only)
SELECT * FROM content_items;

-- View activity logs (admin only)
SELECT * FROM cms_activity_log ORDER BY created_at DESC LIMIT 10;
```

## Policy Examples

### Content Creation Policy

```sql
-- Authors can create content if they're editors or above
CREATE POLICY "Editors can create content" ON content_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM cms_users
            WHERE id::text = auth.uid()::text
            AND role IN ('super_admin', 'admin', 'editor')
        )
    );
```

### Content Access Policy

```sql
-- Users can view published content or their own content
CREATE POLICY "Users can view published content" ON content_items
    FOR SELECT USING (
        status = 'published' OR
        author_id::text = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM cms_users
            WHERE id::text = auth.uid()::text
            AND role IN ('super_admin', 'admin', 'editor')
        )
    );
```

## Security Best Practices

1. **Always use RLS policies** - Never rely on application-level security alone
2. **Test policies thoroughly** - Use the RLS test component to verify access
3. **Monitor activity logs** - Review audit trails regularly
4. **Use least privilege** - Give users only the minimum access they need
5. **Regular audits** - Periodically review and update policies

## Troubleshooting

### "Permission denied" errors

- Check if user is authenticated: `SELECT auth.uid()`
- Verify user exists in `cms_users` table
- Check user's role and permissions
- Review the specific policy for the operation

### Can't see expected data

- Verify RLS policies are enabled: `SELECT * FROM pg_policies`
- Check if policies match your expectations
- Test with different user roles
- Review the policy conditions

### Performance issues

- RLS policies can impact query performance
- Use indexes on columns used in policy conditions
- Consider policy complexity and database size
- Monitor query execution plans
