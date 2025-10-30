# Universal Save Route - Dedicated Table Integration

## Overview

Updated `app/api/uni-content/save/route.ts` to save generated content to dedicated tables instead of the unified `content` table.

**Date Updated:** October 30, 2025

## Problem

The universal save route (`/api/uni-content/save`) was still saving all content types (stats, motivational, greetings, penalty-box-philosopher, wisdom) to the old unified `content` table, even though dedicated tables had been created for each content type.

## Solution

Updated the POST handler to:

1. Detect the content_type from the first item in the batch
2. Route to the appropriate dedicated table with correct field mapping
3. Transform data to match each table's schema

## Content Type → Table Mapping

| Content Type               | Database Table | Primary Content Field     |
| -------------------------- | -------------- | ------------------------- |
| `statistics` / `statistic` | `stats`        | `stat_text`               |
| `motivational`             | `motivational` | `quote`                   |
| `greetings` / `greeting`   | `greetings`    | `greeting_text`           |
| `penalty-box-philosopher`  | `wisdom`       | `musing` + `from_the_box` |
| `wisdom`                   | `wisdom`       | `musing` + `from_the_box` |

## Field Mappings

### Statistics → `stats` table

```typescript
{
  stat_text: item.content_text,
  stat_value: item.stat_value || null,
  stat_category: item.stat_category || null,
  year: item.year || null,
  theme: item.theme || null,
  category: item.category || null,
  attribution: item.attribution || null,
  status: "draft",
  source_content_id: sourceContentId
}
```

### Motivational → `motivational` table

```typescript
{
  quote: item.content_text,
  context: item.context || null,
  theme: item.theme || null,
  category: item.category || null,
  attribution: item.attribution || null,
  status: "draft",
  source_content_id: sourceContentId
}
```

### Greetings → `greetings` table

```typescript
{
  greeting_text: item.content_text,
  attribution: item.attribution || null,
  status: "draft",
  source_content_id: sourceContentId
}
```

### Wisdom/Penalty Box Philosopher → `wisdom` table

```typescript
{
  title: item.content_title || "Untitled",
  musing: item.musings || item.content_text,
  from_the_box: item.from_the_box || "",
  theme: item.theme || null,
  category: item.category || null,
  attribution: item.attribution || "Penalty Box Philosopher",
  status: "draft",
  source_content_id: sourceContentId
}
```

## Key Changes

### Before (Line 38)

```typescript
const { data, error, count } = await supabaseAdmin
  .from("content") // ❌ Old unified table
  .insert(recordsToInsert)
  .select();
```

### After (Lines 101-104)

```typescript
const { data, error, count } = await supabaseAdmin
  .from(tableName) // ✅ Dedicated table determined by content type
  .insert(recordsToInsert)
  .select();
```

## Features Added

1. **Content Type Detection** - Automatically detects content type from first item
2. **Dynamic Table Routing** - Routes to correct dedicated table
3. **Field Transformation** - Maps generic UniContent fields to table-specific fields
4. **Error Handling** - Returns clear error for unsupported content types
5. **Transparency** - Response includes which table was used
6. **Singular/Plural Handling** - Handles both "statistic" and "statistics", "greeting" and "greetings"

## Response Changes

The API response now includes which table was used:

```json
{
  "success": true,
  "data": [...],
  "count": 5,
  "table": "stats"  // New field for transparency
}
```

## Error Handling

If an unsupported content type is provided:

```json
{
  "success": false,
  "error": "Unsupported content type: xyz. Expected: statistics, motivational, greetings, wisdom, or penalty-box-philosopher"
}
```

## Impact

**What This Fixes:**

- ✅ Generated stats now save to `stats` table
- ✅ Generated motivational quotes now save to `motivational` table
- ✅ Generated greetings now save to `greetings` table
- ✅ Generated penalty-box-philosopher content now saves to `wisdom` table
- ✅ Generated wisdom now saves to `wisdom` table

**What This Enables:**

- Proper use of dedicated table schemas
- Type-specific field validation at database level
- Better query performance with dedicated indexes
- Cleaner separation of concerns

## Testing Checklist

### Content Generation Integration

- [ ] Generate new stats via Gemini
- [ ] Verify stats save to `stats` table (not `content`)
- [ ] Generate new motivational quotes via Gemini
- [ ] Verify motivational saves to `motivational` table (not `content`)
- [ ] Generate new greetings via Gemini
- [ ] Verify greetings save to `greetings` table (not `content`)
- [ ] Generate new penalty-box-philosopher content via Gemini
- [ ] Verify wisdom saves to `wisdom` table (not `content`)
- [ ] Generate new wisdom via Gemini
- [ ] Verify wisdom saves to `wisdom` table (not `content`)

### Data Validation

- [ ] Check that `source_content_id` is properly tracked
- [ ] Verify all fields map correctly for each content type
- [ ] Confirm status defaults to "draft"
- [ ] Test with missing optional fields (should handle gracefully)

## Related Migrations

This update completes the integration for migrations already performed:

- **Greetings:** `sql/18-create-greetings-table.sql`, `sql/19-migrate-greetings-from-content.sql`
- **Wisdom:** `sql/15-create-wisdom-table.sql`, `sql/16-migrate-wisdom-from-content.sql`
- **Stats:** `sql/20-create-stats-table.sql`, `sql/21-migrate-stats-from-content.sql`
- **Motivational:** `sql/21-create-motivational-table.sql`, `sql/22-migrate-motivational-from-content.sql`

## Files Modified

- **`app/api/uni-content/save/route.ts`** - Updated to route to dedicated tables

## Related Documentation

- `docs/GREETINGS-TABLE-MIGRATION.md` - Greetings migration guide
- `docs/TRUE-FALSE-TRIVIA-MIGRATION.md` - True/False trivia migration guide
- `docs/CONTENT-LIBRARY-TABLE-PATTERN.md` - Pattern documentation

---

**Status:** Complete  
**Tested:** Pending  
**Impact:** High - Affects all future content generation for stats, motivational, greetings, wisdom, and penalty-box-philosopher
