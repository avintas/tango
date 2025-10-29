# Greetings Table Migration

## Overview

Migrated greetings content from the unified `content` table to a dedicated `greetings` table, following the established pattern from the Wisdom Table migration.

## What Changed

### Before (Old System)

- Greetings stored in unified `content` table with `content_type = 'greeting'`
- Mixed with wisdom, motivational, and statistics content
- Had unnecessary fields: `theme`, `category`, `tone`
- API: `/api/uni-content?type=greeting`

### After (New System)

- Dedicated `greetings` table with purpose-built schema
- Clean, simple structure focused on what greetings actually need
- Only 11 fields (compared to wisdom's similar structure)
- API: `/api/greetings`

## Database Schema

### Table: `greetings`

**Content-Specific Fields:**

- `id` - BIGINT PRIMARY KEY (auto-generated)
- `greeting_text` - TEXT NOT NULL (the actual greeting message)

**Standard Fields:**

- `attribution` - TEXT (source attribution)
- `status` - TEXT (draft, published, archived)
- `source_content_id` - BIGINT (FK to source material)
- `used_in` - TEXT[] (usage tracking)
- `display_order` - INTEGER (manual ordering)
- `created_at` - TIMESTAMPTZ NOT NULL
- `updated_at` - TIMESTAMPTZ NOT NULL
- `published_at` - TIMESTAMPTZ
- `archived_at` - TIMESTAMPTZ

**Indexes:**

- `idx_greetings_status` - Status filtering
- `idx_greetings_created_at` - Recent items
- `idx_greetings_published_at` - Published items

### Key Design Decisions

1. **No `theme` field** - Greetings are all supportive messages; thematic classification was artificial and unused
2. **No `category` field** - Not needed for greetings
3. **No `tone` field** - Suggested but determined unnecessary for current use case
4. **Simple structure** - Focus on the greeting text and standard workflow fields

## Files Created

### 1. SQL Migration

- **`sql/18-create-greetings-table.sql`** - Table creation with indexes and comments
- **`sql/19-migrate-greetings-from-content.sql`** - Data migration from content table

### 2. TypeScript Types

- **`lib/greetings-types.ts`** - Complete type definitions:
  - `Greeting` - Main interface
  - `GreetingCreateInput` - For creating new greetings
  - `GreetingUpdateInput` - For updating greetings
  - `GreetingFetchParams` - Query parameters
  - `GreetingApiResponse` - API response wrapper

### 3. API Routes

- **`app/api/greetings/route.ts`** - GET (list/filter) and POST (create)
- **`app/api/greetings/[id]/route.ts`** - PUT (update), PATCH (status changes), DELETE

### 4. CMS Page Update

- **`app/cms/greetings-library/page.tsx`** - Updated to use new API and types

## Migration Process

### Running the Migration

```sql
-- 1. Create the greetings table
\i sql/18-create-greetings-table.sql

-- 2. Migrate data from content table
\i sql/19-migrate-greetings-from-content.sql
```

### What Gets Migrated

From `content` table WHERE `content_type = 'greeting'`:

- `content_text` → `greeting_text`
- `attribution` → `attribution`
- `status` → `status`
- `source_content_id` → `source_content_id`
- `used_in` → `used_in`
- `id` → `display_order` (preserves original order)
- `created_at` → `created_at`
- `updated_at` → `updated_at`
- Sets `published_at` for published items
- Sets `archived_at` for archived items

### What Gets Dropped

Fields NOT migrated (weren't used meaningfully):

- `theme` - Artificially assigned, not meaningful for greetings
- `category` - Not used
- `content_title` - Not applicable to greetings
- `musings` - Wisdom-specific
- `from_the_box` - Wisdom-specific

## API Changes

### Old Endpoints (still work during transition)

```typescript
GET /api/uni-content?type=greeting
PATCH /api/uni-content/{id}
```

### New Endpoints

```typescript
GET /api/greetings?limit=20&offset=0&status=published
POST /api/greetings
PUT /api/greetings/{id}
PATCH /api/greetings/{id}
DELETE /api/greetings/{id}
```

## CMS Page Updates

### Changed From:

```typescript
import { UniContent } from "@/lib/content-types";
const [items, setItems] = useState<UniContent[]>([]);
fetch("/api/uni-content?type=greeting&...");
```

### Changed To:

```typescript
import { Greeting } from "@/lib/greetings-types";
const [items, setItems] = useState<Greeting[]>([]);
fetch("/api/greetings?limit=...");
```

### ContentCard Adapter

Since ContentCard expects `content_text`, we map the data:

```typescript
<ContentCard
  item={{
    id: item.id,
    content_text: item.greeting_text,
    content_type: 'greeting',
    attribution: item.attribution || undefined,
    status: item.status || undefined,
  }}
/>
```

## Testing Checklist

- [ ] Run SQL migrations on development database
- [ ] Verify all existing greetings display correctly
- [ ] Test creating new greetings via API
- [ ] Test archive functionality
- [ ] Test delete functionality
- [ ] Verify ContentCard displays greetings properly
- [ ] Confirm pagination works
- [ ] Check that status changes (draft → published → archived) work

## Future Considerations

### Content Generation

If greetings generation needs updating:

- Update save logic to use `/api/greetings` instead of `/api/uni-content/save`
- Ensure Gemini generators return proper structure
- Map generated content to new schema

### After Full Migration

Once confirmed working:

- Consider archiving old `/api/uni-content?type=greeting` endpoint
- Remove greeting-related code from unified content system
- Update any remaining references

## Consistency with Pattern

This migration follows the **Content Library Table Pattern** documented in `CONTENT-LIBRARY-TABLE-PATTERN.md`:
✅ Dedicated table per content type
✅ Standard metadata fields
✅ Standard workflow fields
✅ Standard tracking fields
✅ Standard timestamps
✅ Standard indexes
✅ Purpose-built content-specific fields

## Reference Files

- **Pattern Guide:** `CONTENT-LIBRARY-TABLE-PATTERN.md`
- **Wisdom Example:** `sql/15-create-wisdom-table.sql`
- **Wisdom Migration:** `sql/16-migrate-wisdom-from-content.sql`
- **Wisdom Types:** `lib/wisdom-types.ts`

---

**Migration Date:** October 29, 2025  
**Status:** Complete  
**Next Tables:** Motivational, Stats (pending)
