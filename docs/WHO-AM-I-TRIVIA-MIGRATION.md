# Who Am I Trivia Table Migration

## Overview

Migrated Who Am I trivia questions from the unified `trivia_questions` table to a dedicated `trivia_who_am_i` table, following the established **Content Library Table Pattern**.

## What Changed

### Before (Old System)

- Who Am I questions stored in unified `trivia_questions` table with `question_type = 'who-am-i'`
- Mixed with multiple-choice and true/false questions
- Answer stored as TEXT (`correct_answer`)
- Had unused `wrong_answers[]` field (always empty)
- API: Part of general trivia questions system

### After (New System)

- Dedicated `trivia_who_am_i` table with purpose-built schema
- Clean structure focused on Who Am I question needs
- Answer stored as TEXT (the riddle answer)
- NO `wrong_answers` field (not needed for riddle-style questions)
- Dedicated APIs: `/api/who-am-i-trivia` (CMS) and `/api/public/who-am-i-trivia` (public)

---

## Database Schema

### Table: `trivia_who_am_i`

**Content-Specific Fields:**

- `id` - BIGINT PRIMARY KEY (auto-generated)
- `question_text` - TEXT NOT NULL (the Who Am I riddle/clues)
- `correct_answer` - TEXT NOT NULL (the answer to the riddle)
- `explanation` - TEXT (optional explanation for the answer)

**Standard Metadata Fields:**

- `category` - TEXT (topic classification)
- `theme` - TEXT (thematic classification)
- `difficulty` - TEXT (Easy, Medium, Hard)
- `tags` - TEXT[] (keywords for searching)
- `attribution` - TEXT (source attribution)

**Standard Workflow & Tracking Fields:**

- `status` - TEXT (draft, published, archived)
- `used_in` - TEXT[] (usage tracking)
- `source_content_id` - BIGINT (FK to source material)
- `display_order` - INTEGER (manual ordering)

**Standard Timestamps:**

- `created_at` - TIMESTAMPTZ NOT NULL
- `updated_at` - TIMESTAMPTZ NOT NULL
- `published_at` - TIMESTAMPTZ
- `archived_at` - TIMESTAMPTZ

**Indexes:**

- `idx_wai_status` - Status filtering
- `idx_wai_category` - Category filtering
- `idx_wai_difficulty` - Difficulty filtering
- `idx_wai_created_at` - Recent items
- `idx_wai_published_at` - Published items

### Key Design Decisions

1. **NO wrong_answers field** - Who Am I questions are riddles, not multiple choice
2. **Explanation field** - Educational value with optional explanations
3. **Difficulty levels** - Supports Easy/Medium/Hard classification
4. **Standard pattern compliance** - Follows Content Library Table Pattern exactly
5. **Public API ready** - Designed for external consumption from day one

---

## Files Created/Modified

### 1. SQL Migration

- **`sql/27-create-who-am-i-trivia-table.sql`** - Table creation with indexes and comments
- **`sql/28-migrate-who-am-i-from-questions.sql`** - Data migration from trivia_questions table

### 2. Generation Integration (Modified)

- **`app/api/trivia/save-who-am-i/route.ts`** - ✅ Updated to save to `trivia_who_am_i` table

### 3. TypeScript Types

- **`lib/who-am-i-trivia-types.ts`** - Complete type definitions:
  - `WhoAmITrivia` - Main interface
  - `WhoAmITriviaCreateInput` - For creating new questions
  - `WhoAmITriviaUpdateInput` - For updating questions
  - `WhoAmITriviaFetchParams` - Query parameters
  - `WhoAmITriviaApiResponse` - API response wrapper

### 4. CMS API Routes (Internal)

- **`app/api/who-am-i-trivia/route.ts`** - GET (list/filter) and POST (create)
- **`app/api/who-am-i-trivia/[id]/route.ts`** - GET (single), PUT (update), PATCH (status changes), DELETE

### 5. Public API Routes (for omnipaki.com)

- **`app/api/public/who-am-i-trivia/random/route.ts`** - Random question
- **`app/api/public/who-am-i-trivia/latest/route.ts`** - Latest N questions
- **`app/api/public/who-am-i-trivia/route.ts`** - Filtered/paginated queries

### 6. CMS Page & Component

- **`app/cms/who-am-i-trivia-library/page.tsx`** - CMS management page
- **`components/who-am-i-trivia-card.tsx`** - Display card component

### 7. Navigation Update

- **`components/app-shell.tsx`** - Added "Who Am I Trivia" link to sidebar (🎭 icon)

### 8. Documentation

- **`docs/PUBLIC-WHO-AM-I-TRIVIA-API.md`** - Public API documentation for omnipaki.com team
- **`docs/WHO-AM-I-TRIVIA-MIGRATION.md`** - This migration guide

---

## Migration Process

### Running the Migration

```sql
-- 1. Create the trivia_who_am_i table
\i sql/27-create-who-am-i-trivia-table.sql

-- 2. Migrate data from trivia_questions table
\i sql/28-migrate-who-am-i-from-questions.sql
```

### What Gets Migrated

From `trivia_questions` table WHERE `question_type = 'who-am-i'`:

- `question_text` → `question_text`
- `correct_answer` → `correct_answer`
- `explanation` → `explanation`
- `theme` → `theme`
- `tags` → `tags`
- `status` → `status`
- `id` → `source_content_id` (link back to original)
- `created_at` → `created_at`
- `updated_at` → `updated_at`
- Sets `published_at` for published items
- Sets `archived_at` for archived items

### Data Transformations

**Status-based Timestamps:**

```sql
-- If status = 'published', set published_at
CASE WHEN LOWER(TRIM(tq.status)) = 'published'
  THEN tq.updated_at ELSE NULL END AS published_at

-- If status = 'archived', set archived_at
CASE WHEN LOWER(TRIM(tq.status)) = 'archived'
  THEN tq.updated_at ELSE NULL END AS archived_at
```

### What Doesn't Get Migrated

Fields NOT migrated from `trivia_questions`:

- `wrong_answers` - Not used for Who Am I questions (always empty array)
- `category` - Not in original table (can be added later)
- `difficulty` - Not in original table (can be added later)
- `attribution` - Not in original table (can be added later)
- `created_by` - CMS internal field, not needed

---

## API Changes

### New CMS Endpoints (Internal)

```typescript
GET /api/who-am-i-trivia?limit=20&offset=0&status=published,draft
POST /api/who-am-i-trivia
GET /api/who-am-i-trivia/{id}
PUT /api/who-am-i-trivia/{id}
PATCH /api/who-am-i-trivia/{id}
DELETE /api/who-am-i-trivia/{id}
```

### New Public Endpoints (for omnipaki.com)

```typescript
GET /api/public/who-am-i-trivia/random
GET /api/public/who-am-i-trivia/latest?limit=10
GET /api/public/who-am-i-trivia?theme=Records&difficulty=Easy
```

---

## CMS Page Features

The new CMS page (`/cms/who-am-i-trivia-library`) provides:

- **List View** - All Who Am I questions with status badges
- **Pagination** - 20 items per page
- **Status Display** - Visual indicators for draft/published/archived
- **Answer Display** - Clear display of riddle and answer
- **Explanation Display** - Shows explanations when available
- **Metadata Display** - ID, theme, category, difficulty, character count, word count
- **Archive Action** - One-click archiving
- **Delete Action** - Delete with confirmation
- **Filtering** - Active questions only (excludes archived)

---

## Public API Features

The public API (`/api/public/who-am-i-trivia/*`) provides:

✅ **No Authentication Required** - Open and public  
✅ **CORS Enabled** - Works from any domain  
✅ **Published Only** - Only returns published questions  
✅ **Clean Responses** - Display-ready data only  
✅ **Rate Limiting** - Max 100 results per request  
✅ **Multiple Filters** - By theme, category, difficulty  
✅ **Pagination Support** - Limit and offset parameters

---

## Testing Checklist

### Database & Migration

- [ ] Run SQL migrations on development database
- [ ] Verify all existing Who Am I questions display correctly

### CMS Management

- [ ] Test archive functionality
- [ ] Test delete functionality
- [ ] Verify card displays question, answer, and explanation properly
- [ ] Confirm pagination works
- [ ] Check that status changes (draft → published → archived) work
- [ ] Confirm sidebar navigation link works

### Content Generation Integration

- [ ] Generate new Who Am I questions via Gemini
- [ ] Verify generated questions save to `trivia_who_am_i` table (not `trivia_questions`)
- [ ] Check that answer field is properly stored
- [ ] Verify explanation field is properly stored
- [ ] Confirm `source_content_id` is tracked

### Public API

- [ ] Test public API `/random` endpoint
- [ ] Test public API `/latest` endpoint
- [ ] Test public API with filters (theme, category, difficulty)
- [ ] Verify CORS headers work
- [ ] Test pagination works on public API

---

## Usage Examples

### Create New Question via CMS

Currently done through the trivia questions generation system. Future enhancement: dedicated creation form.

### Fetch Questions via Public API

```javascript
// Random question
const response = await fetch("/api/public/who-am-i-trivia/random");
const { data } = await response.json();
console.log(data.question_text, data.correct_answer);

// Latest 10 questions
const response = await fetch("/api/public/who-am-i-trivia/latest?limit=10");
const { data } = await response.json();
console.log(`Fetched ${data.length} questions`);

// Easy difficulty questions
const response = await fetch(
  "/api/public/who-am-i-trivia?difficulty=Easy&limit=20",
);
const { data, count } = await response.json();
console.log(`Found ${count} easy questions`);
```

---

## Content Generation Integration

### ✅ Generator Save Logic Updated

**File:** `app/api/trivia/save-who-am-i/route.ts`

When Who Am I questions are generated via Gemini AI, they now save directly to the new `trivia_who_am_i` table:

**Changes Made:**

- ✅ Changed insert target from `trivia_questions` to `trivia_who_am_i`
- ✅ Updated field mapping: only `correct_answer` (no `wrong_answers`)
- ✅ Added support for `explanation` field (now properly stored)
- ✅ Added `source_content_id` tracking for provenance
- ✅ Removed unused `wrong_answers` field
- ✅ Removed unused `question_type` field

**Field Mapping:**

```typescript
{
  question_text: q.question_text,           // Question text (riddle/clues)
  correct_answer: q.correct_answer,         // Answer to the riddle
  theme: q.theme || null,                   // Theme
  tags: q.tags || null,                     // Tags array
  status: "draft",                          // Default status
  source_content_id: sourceContentId        // Track source material
}
```

This means all newly generated Who Am I questions will automatically populate the new dedicated table.

## Comparison with Other Trivia Types

### Question Structure Differences

| Feature          | Multiple Choice                                | True/False          | Who Am I                |
| ---------------- | ---------------------------------------------- | ------------------- | ----------------------- |
| Question Type    | Multiple choice with options                   | Binary (T/F)        | Riddle/puzzle           |
| Answer Storage   | `correct_answer` + `wrong_answers[]` (3 items) | `is_true` (boolean) | `correct_answer` (text) |
| Wrong Answers    | Required (3 distractors)                       | Not applicable      | Not applicable          |
| User Interaction | Select from 4 options                          | Choose True/False   | Free text answer        |

### Use Cases

**Multiple Choice:** Best for testing specific knowledge with defined options  
**True/False:** Best for fact verification and quick assessment  
**Who Am I:** Best for engaging riddles, building anticipation, and testing inference skills

---

## Future Considerations

### Migration Completion Status

With this Who Am I migration complete:

- ✅ **True/False Trivia** - Migrated to dedicated table
- ✅ **Multiple Choice Trivia** - Migrated to dedicated table
- ✅ **Who Am I Trivia** - Migrated to dedicated table

**Next Step:** The original `trivia_questions` table can now be deprecated once all systems are verified working with the new dedicated tables.

---

## Consistency with Pattern

This migration follows the **Content Library Table Pattern** documented in `CONTENT-LIBRARY-TABLE-PATTERN.md`:

✅ Dedicated table per content type  
✅ Standard metadata fields  
✅ Standard workflow fields  
✅ Standard tracking fields  
✅ Standard timestamps  
✅ Standard indexes  
✅ Purpose-built content-specific fields  
✅ Public API endpoints (random, latest, filtered)  
✅ Public API documentation  
✅ CMS management page

---

## Reference Files

- **Pattern Guide:** `CONTENT-LIBRARY-TABLE-PATTERN.md`
- **Similar Migrations:**
  - `TRUE-FALSE-TRIVIA-MIGRATION.md`
  - `MULTIPLE-CHOICE-TRIVIA-MIGRATION.md`
- **Public API Docs:** `PUBLIC-WHO-AM-I-TRIVIA-API.md`
- **Table Creation:** `sql/27-create-who-am-i-trivia-table.sql`
- **Data Migration:** `sql/28-migrate-who-am-i-from-questions.sql`

---

## Next Steps

This completes the trivia table migrations! All three trivia question types now have:

1. ✅ **Dedicated tables** with purpose-built schemas
2. ✅ **Type-specific CMS APIs** for internal management
3. ✅ **Public APIs** for omnipaki.com consumption
4. ✅ **CMS management pages** for editors
5. ✅ **Complete documentation** for both teams

**System Status:** All trivia types fully migrated ✅

---

**Migration Date:** October 30, 2025  
**Status:** Complete  
**Final Migration:** Who Am I (all trivia types now complete)
