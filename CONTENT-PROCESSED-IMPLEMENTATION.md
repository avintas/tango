# Content Processed Table Implementation

## Overview

The `content_processed` table is the output table for AI-generated content. It stores formatted markdown files that are ready to be displayed on onlyhockey.com.

## Architecture

```
Content Flow:
1. content_source (raw input) → Tango CMS
2. AI Processing → Generate markdown
3. content_processed (formatted output) → Database
4. onlyhockey.com → Query & Display
```

## Database Schema

### Table: `content_processed`

| Column             | Type         | Description                                                          |
| ------------------ | ------------ | -------------------------------------------------------------------- |
| `id`               | BIGSERIAL    | Primary key                                                          |
| `title`            | VARCHAR(255) | Content title/headline                                               |
| `content_type`     | VARCHAR(50)  | Type: 'trivia', 'stats', 'motivational', 'quotes', 'stories', 'lore' |
| `markdown_content` | TEXT         | Full formatted markdown file                                         |
| `status`           | VARCHAR(20)  | 'draft' or 'published'                                               |
| `published_at`     | TIMESTAMPTZ  | When published (nullable)                                            |
| `created_by`       | UUID         | User who created it                                                  |
| `created_at`       | TIMESTAMPTZ  | Creation timestamp                                                   |
| `updated_at`       | TIMESTAMPTZ  | Last update timestamp                                                |

### Indexes

- `idx_content_processed_type` - Query by content type
- `idx_content_processed_status` - Query by status
- `idx_content_processed_created_at` - Order by date
- `idx_content_processed_type_status` - Combined filter

### Row Level Security (RLS)

- **Public**: Can read published content (`status = 'published'`)
- **Authenticated**: Full CRUD access

## API Endpoints

### GET `/api/content-processed`

Fetch content with optional filters:

**Query Parameters:**

- `contentType` - Filter by type (trivia, stats, etc.)
- `status` - Filter by status (draft, published)
- `limit` - Number of records (default: 20)

**Examples:**

```bash
# Get all published trivia
GET /api/content-processed?contentType=trivia&status=published

# Get latest 10 items
GET /api/content-processed?limit=10

# Get all stats content
GET /api/content-processed?contentType=stats
```

### POST `/api/content-processed`

Create new content:

**Request Body:**

```json
{
  "title": "The Canuck Connection",
  "content_type": "trivia",
  "markdown_content": "# Roster Trivia Challenge...",
  "status": "draft"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    /* created record */
  },
  "message": "Content saved successfully"
}
```

### PATCH `/api/content-processed`

Update existing content (e.g., publish):

**Request Body:**

```json
{
  "id": 1,
  "status": "published"
}
```

## TypeScript Interfaces

```typescript
// Full record from database
interface ContentProcessed {
  id: number;
  title: string;
  content_type: string;
  markdown_content: string;
  status: 'draft' | 'published';
  published_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// For creating new content
interface CreateContentProcessed {
  title: string;
  content_type: string;
  markdown_content: string;
  status?: 'draft' | 'published';
  published_at?: string;
}
```

## Content Types

| Type           | Description                       | Example Use Case                        |
| -------------- | --------------------------------- | --------------------------------------- |
| `trivia`       | Multiple-choice questions         | Quiz games, fan engagement              |
| `stats`        | Statistical summaries with tables | League analysis, player comparisons     |
| `motivational` | Inspirational content (H.U.G.s)   | Youth encouragement, positive messaging |
| `quotes`       | Extracted player/coach quotes     | Daily inspiration, social media         |
| `stories`      | Player journey narratives         | Feature articles, fan interest          |
| `lore`         | Historical facts and legends      | Hockey history, educational content     |

## Usage Examples

### For Tango CMS (Internal)

```typescript
// Save AI-generated content
const response = await fetch('/api/content-processed', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    title: 'The Canuck Connection',
    content_type: 'trivia',
    markdown_content: markdownText,
    status: 'draft',
  }),
});

// Publish content
await fetch('/api/content-processed', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    id: 1,
    status: 'published',
  }),
});
```

### For OnlyHockey.com (Public Site)

```typescript
// Get latest trivia
const { data } = await supabase
  .from('content_processed')
  .select('*')
  .eq('content_type', 'trivia')
  .eq('status', 'published')
  .order('created_at', { ascending: false })
  .limit(10);

// Render markdown as HTML
import { marked } from 'marked';
const html = marked(data[0].markdown_content);

// Display on page
document.getElementById('trivia').innerHTML = html;
```

## Migration Steps

1. **Create the table:**

   ```bash
   # Run in Supabase SQL Editor
   psql < create-content-processed-table.sql
   ```

2. **Verify RLS policies:**
   - Check that public can read published content
   - Check that authenticated users have full access

3. **Test the API:**
   - Create a test record via POST
   - Fetch it via GET
   - Update status to 'published' via PATCH

## Future Enhancements (Optional)

- Add `tags` JSONB field for categorization
- Add `difficulty` field for trivia
- Add `season` field for time-based filtering
- Add `source_content_id` to track origin
- Add full-text search on markdown_content
- Add view count tracking

## Files Created

- `create-content-processed-table.sql` - Database schema
- `lib/supabase.ts` - TypeScript interfaces (updated)
- `app/api/content-processed/route.ts` - API endpoints
- `CONTENT-PROCESSED-IMPLEMENTATION.md` - This documentation

## Next Steps

1. ✅ Create database table (run SQL file)
2. ⏳ Wire "Generate with AI" button on `/cms/processing`
3. ⏳ Create review/publish UI
4. ⏳ Build onlyhockey.com queries to consume content
