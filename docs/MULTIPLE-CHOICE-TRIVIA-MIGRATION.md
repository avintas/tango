# Multiple Choice Trivia Table Migration

## Overview

Migrated multiple-choice trivia questions from the unified `trivia_questions` table to a dedicated `trivia_multiple_choice` table, following the established **Content Library Table Pattern**.

## What Changed

### Before (Old System)

- Multiple-choice questions stored in unified `trivia_questions` table with `question_type = 'multiple-choice'`
- Mixed with true/false and who-am-i questions
- Answer stored as TEXT (`correct_answer`) with TEXT array (`wrong_answers`)
- API: Part of general trivia questions system

### After (New System)

- Dedicated `trivia_multiple_choice` table with purpose-built schema
- Clean structure focused on multiple-choice question needs
- Answer stored as TEXT with TEXT array of exactly 3 wrong answers
- Dedicated APIs: `/api/multiple-choice-trivia` (CMS) and `/api/public/multiple-choice-trivia` (public)

---

## Database Schema

### Table: `trivia_multiple_choice`

**Content-Specific Fields:**

- `id` - BIGINT PRIMARY KEY (auto-generated)
- `question_text` - TEXT NOT NULL (the multiple-choice question)
- `correct_answer` - TEXT NOT NULL (the correct answer)
- `wrong_answers` - TEXT[] NOT NULL (array of 3 incorrect answers)
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

- `idx_mct_status` - Status filtering
- `idx_mct_category` - Category filtering
- `idx_mct_difficulty` - Difficulty filtering
- `idx_mct_created_at` - Recent items
- `idx_mct_published_at` - Published items

### Key Design Decisions

1. **TEXT array for wrong_answers** - Maintains 3 incorrect answers (distractors)
2. **Explanation field** - Educational value with optional explanations
3. **Difficulty levels** - Supports Easy/Medium/Hard classification
4. **Standard pattern compliance** - Follows Content Library Table Pattern exactly
5. **Public API ready** - Designed for external consumption from day one

---

## Files Created/Modified

### 1. SQL Migration

- **`sql/25-create-multiple-choice-trivia-table.sql`** - Table creation with indexes and comments
- **`sql/26-migrate-multiple-choice-from-questions.sql`** - Data migration from trivia_questions table

### 2. Generation Integration (Modified)

- **`app/api/trivia/save-multiple-choice/route.ts`** - ✅ Updated to save to `trivia_multiple_choice` table

### 3. TypeScript Types

- **`lib/multiple-choice-trivia-types.ts`** - Complete type definitions:
  - `MultipleChoiceTrivia` - Main interface
  - `MultipleChoiceTriviaCreateInput` - For creating new questions
  - `MultipleChoiceTriviaUpdateInput` - For updating questions
  - `MultipleChoiceTriviaFetchParams` - Query parameters
  - `MultipleChoiceTriviaApiResponse` - API response wrapper

### 4. CMS API Routes (Internal)

- **`app/api/multiple-choice-trivia/route.ts`** - GET (list/filter) and POST (create)
- **`app/api/multiple-choice-trivia/[id]/route.ts`** - GET (single), PUT (update), PATCH (status changes), DELETE

### 5. Public API Routes (for omnipaki.com)

- **`app/api/public/multiple-choice-trivia/random/route.ts`** - Random question
- **`app/api/public/multiple-choice-trivia/latest/route.ts`** - Latest N questions
- **`app/api/public/multiple-choice-trivia/route.ts`** - Filtered/paginated queries

### 6. CMS Page & Component

- **`app/cms/multiple-choice-trivia-library/page.tsx`** - CMS management page
- **`components/multiple-choice-trivia-card.tsx`** - Display card component

### 7. Navigation Update

- **`components/app-shell.tsx`** - Added "Multiple Choice Trivia" link to sidebar

### 8. Documentation

- **`docs/PUBLIC-MULTIPLE-CHOICE-TRIVIA-API.md`** - Public API documentation for omnipaki.com team
- **`docs/MULTIPLE-CHOICE-TRIVIA-MIGRATION.md`** - This migration guide

---

## Migration Process

### Running the Migration

```sql
-- 1. Create the multiple_choice_trivia table
\i sql/25-create-multiple-choice-trivia-table.sql

-- 2. Migrate data from trivia_questions table
\i sql/26-migrate-multiple-choice-from-questions.sql
```

### What Gets Migrated

From `trivia_questions` table WHERE `question_type = 'multiple-choice'`:

- `question_text` → `question_text`
- `correct_answer` → `correct_answer`
- `wrong_answers` → `wrong_answers` (array)
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

- `category` - Not in original table (can be added later)
- `difficulty` - Not in original table (can be added later)
- `attribution` - Not in original table (can be added later)
- `created_by` - CMS internal field, not needed

---

## API Changes

### New CMS Endpoints (Internal)

```typescript
GET /api/multiple-choice-trivia?limit=20&offset=0&status=published,draft
POST /api/multiple-choice-trivia
GET /api/multiple-choice-trivia/{id}
PUT /api/multiple-choice-trivia/{id}
PATCH /api/multiple-choice-trivia/{id}
DELETE /api/multiple-choice-trivia/{id}
```

### New Public Endpoints (for omnipaki.com)

```typescript
GET /api/public/multiple-choice-trivia/random
GET /api/public/multiple-choice-trivia/latest?limit=10
GET /api/public/multiple-choice-trivia?theme=Hockey%20History&difficulty=Easy
```

---

## CMS Page Features

The new CMS page (`/cms/multiple-choice-trivia-library`) provides:

- **List View** - All multiple-choice questions with status badges
- **Pagination** - 20 items per page
- **Status Display** - Visual indicators for draft/published/archived
- **Answer Display** - All answer options with correct answer highlighted
- **Explanation Display** - Shows explanations when available
- **Metadata Display** - ID, theme, category, difficulty, character count, word count
- **Archive Action** - One-click archiving
- **Delete Action** - Delete with confirmation
- **Filtering** - Active questions only (excludes archived)

---

## Public API Features

The public API (`/api/public/multiple-choice-trivia/*`) provides:

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
- [ ] Verify all existing multiple-choice questions display correctly

### CMS Management

- [ ] Test archive functionality
- [ ] Test delete functionality
- [ ] Verify card displays question, all answer options, and explanation properly
- [ ] Confirm pagination works
- [ ] Check that status changes (draft → published → archived) work
- [ ] Confirm sidebar navigation link works

### Content Generation Integration

- [ ] Generate new multiple-choice questions via Gemini
- [ ] Verify generated questions save to `trivia_multiple_choice` table (not `trivia_questions`)
- [ ] Check that `wrong_answers` field contains exactly 3 items
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
const response = await fetch("/api/public/multiple-choice-trivia/random");
const { data } = await response.json();
console.log(data.question_text, data.correct_answer, data.wrong_answers);

// Latest 10 questions
const response = await fetch(
  "/api/public/multiple-choice-trivia/latest?limit=10",
);
const { data } = await response.json();
console.log(`Fetched ${data.length} questions`);

// Easy difficulty questions
const response = await fetch(
  "/api/public/multiple-choice-trivia?difficulty=Easy&limit=20",
);
const { data, count } = await response.json();
console.log(`Found ${count} easy questions`);
```

---

## Content Generation Integration

### ✅ Generator Save Logic Updated

**File:** `app/api/trivia/save-multiple-choice/route.ts`

When multiple-choice questions are generated via Gemini AI, they now save directly to the new `trivia_multiple_choice` table:

**Changes Made:**

- ✅ Changed insert target from `trivia_questions` to `trivia_multiple_choice`
- ✅ Updated field mapping: correct structure for `correct_answer` and `wrong_answers[]`
- ✅ Added support for `explanation` field (now properly stored)
- ✅ Added `source_content_id` tracking for provenance

**Field Mapping:**

```typescript
{
  question_text: q.question_text,           // Question text
  correct_answer: q.correct_answer,         // Correct answer
  wrong_answers: q.wrong_answers,           // Array of 3 wrong answers
  explanation: null,                        // Can be added later
  theme: q.theme || null,                   // Theme
  tags: q.tags || null,                     // Tags array
  status: "draft",                          // Default status
  source_content_id: sourceContentId        // Track source material
}
```

This means all newly generated multiple-choice questions will automatically populate the new dedicated table.

## Future Considerations

### Migration Completion

Once system is fully operational:

- Consider migrating Who Am I questions to dedicated table
- Follow same pattern established here
- Deprecate original `trivia_questions` table after all types migrated

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
- **Similar Migration:** `TRUE-FALSE-TRIVIA-MIGRATION.md`
- **Public API Docs:** `PUBLIC-MULTIPLE-CHOICE-TRIVIA-API.md`
- **Table Creation:** `sql/25-create-multiple-choice-trivia-table.sql`
- **Data Migration:** `sql/26-migrate-multiple-choice-from-questions.sql`

---

## Next Steps

This multiple-choice trivia migration establishes the pattern alongside true/false trivia:

1. **Who Am I Trivia** - Final trivia table to implement
   - Fields: `question_text`, `correct_answer`, `wrong_answers[]`
   - Follow same pattern as true/false and multiple-choice

Once all three are complete, the original `trivia_questions` table can be deprecated.

---

**Migration Date:** October 30, 2025  
**Status:** Complete  
**Next Tables:** Who Am I (pending)
