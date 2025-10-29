# Tango CMS Documentation Index

**Last Updated:** October 29, 2025

---

## 📖 Documentation Overview

This index helps you find the right documentation quickly.

---

## 🏗️ For Tango CMS Developers

### Getting Started

| Document                               | Purpose                                         | Read This If...                                         |
| -------------------------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| **`DEVELOPER-HANDOFF-SUMMARY.md`**     | 📍 Master overview of architecture and patterns | You're new to the project or implementing new libraries |
| **`CONTENT-LIBRARY-TABLE-PATTERN.md`** | Complete pattern guide for content libraries    | You're creating a new content type table                |

### Database Migrations

| Document                                 | Purpose                                        |
| ---------------------------------------- | ---------------------------------------------- |
| `sql/10-create-hero-collections.sql`     | Hero Collections table schema                  |
| `sql/15-create-wisdom-table.sql`         | Wisdom table schema (reference implementation) |
| `sql/18-create-greetings-table.sql`      | Greetings table schema                         |
| `sql/20-create-stats-table.sql`          | Stats table schema                             |
| `sql/21-create-motivational-table.sql`   | Motivational table schema                      |
| `sql/MIGRATION-rename-name-to-title.sql` | Hero Collections field rename                  |

### Specific Feature Guides

| Document                          | Purpose                             |
| --------------------------------- | ----------------------------------- |
| `WISDOM-CONTENT-STRUCTURE.md`     | Wisdom content structure and fields |
| `GREETINGS-TABLE-MIGRATION.md`    | Greetings migration guide           |
| `HERO-COLLECTIONS-INTEGRATION.md` | Hero Collections system details     |

---

## 🌐 For omnipaki.com Developers

### Getting Started

| Document                            | Purpose                     | Start Here?         |
| ----------------------------------- | --------------------------- | ------------------- |
| **`ONLYHOCKEY-HANDOFF-PACKAGE.md`** | Overview of what's included | ⭐ Yes - Start here |
| **`ONLYHOCKEY-SETUP-CHECKLIST.md`** | Step-by-step setup guide    | ⭐ Yes - Then this  |
| **`ONLYHOCKEY-API-HANDOFF.md`**     | Quick API integration guide | After setup         |

### API References

| Document                             | API Endpoint                    | Content Type               |
| ------------------------------------ | ------------------------------- | -------------------------- |
| **`PUBLIC-WISDOM-API.md`**           | `/api/public/wisdom`            | Philosophical musings      |
| **`PUBLIC-GREETINGS-API.md`**        | `/api/public/greetings`         | Hockey greetings (HUG)     |
| **`PUBLIC-MOTIVATIONAL-API.md`**     | `/api/public/motivational`      | Motivational quotes        |
| **`PUBLIC-STATS-API.md`**            | `/api/public/stats`             | Hockey statistics          |
| **`PUBLIC-HERO-COLLECTIONS-API.md`** | `/api/hero-collections/default` | Curated 7-item collections |

### Code Examples

| Location                                    | Language/Framework          |
| ------------------------------------------- | --------------------------- |
| `onlyhockey-examples/vanilla-js-example.js` | Plain JavaScript            |
| `onlyhockey-examples/react-example.tsx`     | React/Next.js               |
| `onlyhockey-api-types.ts`                   | TypeScript type definitions |
| `test-api.html`                             | Browser testing page        |

---

## 📚 By Content Type

### Wisdom (Penalty Box Philosopher)

- **Table**: `wisdom`
- **CMS Page**: `/cms/wisdom-library`
- **API**: `/api/public/wisdom`
- **Docs**:
  - `PUBLIC-WISDOM-API.md` (for omnipaki.com)
  - `WISDOM-CONTENT-STRUCTURE.md` (for CMS team)
  - `sql/15-create-wisdom-table.sql` (database)

### Greetings (HUG - Hockey Universal Greetings)

- **Table**: `greeting`
- **CMS Page**: `/cms/greetings-library`
- **API**: `/api/public/greetings`
- **Docs**:
  - `PUBLIC-GREETINGS-API.md` (for omnipaki.com)
  - `GREETINGS-TABLE-MIGRATION.md` (for CMS team)
  - `sql/18-create-greetings-table.sql` (database)

### Hero Collections

- **Table**: `hero_collections`
- **CMS Page**: `/cms/hero-collections`
- **API**: `/api/hero-collections/default`, `/api/hero-collections/:id`
- **Docs**:
  - `PUBLIC-HERO-COLLECTIONS-API.md` (for omnipaki.com)
  - `HERO-COLLECTIONS-INTEGRATION.md` (for CMS team)
  - `sql/10-create-hero-collections.sql` (database)
  - `sql/MIGRATION-rename-name-to-title.sql` (recent migration)

### Motivational

- **Table**: `motivational`
- **CMS Page**: `/cms/motivational-library`
- **API**: `/api/public/motivational`
- **Docs**:
  - `PUBLIC-MOTIVATIONAL-API.md` (for omnipaki.com)
  - `sql/21-create-motivational-table.sql` (database)
  - `sql/22-migrate-motivational-from-content.sql` (migration)

### Stats

- **Table**: `stats`
- **CMS Page**: `/cms/stats-library`
- **API**: `/api/public/stats`
- **Docs**:
  - `PUBLIC-STATS-API.md` (for omnipaki.com)
  - `sql/20-create-stats-table.sql` (database)
  - `sql/21-migrate-stats-from-content.sql` (migration)

---

## 🎯 Quick Links by Task

### "I need to create a new content library"

1. Read: `CONTENT-LIBRARY-TABLE-PATTERN.md`
2. Reference: `sql/15-create-wisdom-table.sql`
3. Follow: Migration checklist in pattern guide

### "I need to integrate Tango content into omnipaki.com"

1. Read: `ONLYHOCKEY-SETUP-CHECKLIST.md`
2. Choose API: `PUBLIC-WISDOM-API.md`, `PUBLIC-GREETINGS-API.md`, `PUBLIC-MOTIVATIONAL-API.md`, `PUBLIC-STATS-API.md`, or `PUBLIC-HERO-COLLECTIONS-API.md`
3. Copy: Code from `onlyhockey-examples/`
4. Test: Use `test-api.html`

### "I need to understand the architecture"

1. Read: `DEVELOPER-HANDOFF-SUMMARY.md` (architecture section)
2. Review: Any `PUBLIC-*-API.md` to see API patterns

### "I need to document a new API for omnipaki.com"

1. Copy: Structure from `PUBLIC-WISDOM-API.md`
2. Follow: Pattern in `CONTENT-LIBRARY-TABLE-PATTERN.md` (API Documentation section)
3. Include: Example code, TypeScript types, troubleshooting

### "I need to migrate/update a table"

1. Check: Existing migrations in `sql/` folder
2. Reference: `sql/MIGRATION-rename-name-to-title.sql` (example)
3. Update: All related files (see DEVELOPER-HANDOFF-SUMMARY.md)

---

## 📁 File Organization

### Documentation Root

```
/
├── DOCUMENTATION-INDEX.md          ← You are here
├── DEVELOPER-HANDOFF-SUMMARY.md    ← Master guide for developers
├── CONTENT-LIBRARY-TABLE-PATTERN.md ← Database/API pattern guide
│
├── ONLYHOCKEY-HANDOFF-PACKAGE.md   ← omnipaki.com: Overview
├── ONLYHOCKEY-SETUP-CHECKLIST.md   ← omnipaki.com: Setup steps
├── ONLYHOCKEY-API-HANDOFF.md       ← omnipaki.com: API guide
│
├── PUBLIC-WISDOM-API.md            ← Wisdom API reference
├── PUBLIC-GREETINGS-API.md         ← Greetings API reference
├── PUBLIC-MOTIVATIONAL-API.md      ← Motivational API reference
├── PUBLIC-STATS-API.md             ← Stats API reference
├── PUBLIC-HERO-COLLECTIONS-API.md  ← Hero Collections API reference
│
├── WISDOM-CONTENT-STRUCTURE.md     ← Wisdom implementation details
├── GREETINGS-TABLE-MIGRATION.md    ← Greetings migration
├── HERO-COLLECTIONS-INTEGRATION.md ← Hero Collections details
│
└── COLLECTION-LIST-DISPLAY.md      ← Additional collection info
```

### Code Examples

```
/onlyhockey-examples/
├── vanilla-js-example.js          ← Plain JavaScript
└── react-example.tsx              ← React/Next.js

/
├── onlyhockey-api-types.ts        ← TypeScript types
└── test-api.html                  ← Browser testing
```

### SQL Migrations

```
/sql/
├── 10-create-hero-collections.sql
├── 15-create-wisdom-table.sql
├── 18-create-greetings-table.sql
├── 20-create-stats-table.sql
├── 21-create-motivational-table.sql
├── 22-migrate-motivational-from-content.sql
└── MIGRATION-rename-name-to-title.sql
```

---

## 🔍 Search Tips

### Find by Keyword

**"API"**

- Public API docs: `PUBLIC-*-API.md`
- API patterns: `CONTENT-LIBRARY-TABLE-PATTERN.md`
- Example code: `onlyhockey-examples/`

**"Database" / "SQL" / "Table"**

- Pattern guide: `CONTENT-LIBRARY-TABLE-PATTERN.md`
- SQL files: `sql/` folder
- Reference: `sql/15-create-wisdom-table.sql`

**"Integration" / "omnipaki" / "OnlyHockey"**

- Setup: `ONLYHOCKEY-SETUP-CHECKLIST.md`
- API docs: `PUBLIC-*-API.md`
- Examples: `onlyhockey-examples/`

**"Pattern" / "Template" / "How to"**

- Content libraries: `CONTENT-LIBRARY-TABLE-PATTERN.md`
- Overall guide: `DEVELOPER-HANDOFF-SUMMARY.md`

**"Migration"**

- Pattern guide: `CONTENT-LIBRARY-TABLE-PATTERN.md`
- Example: `sql/MIGRATION-rename-name-to-title.sql`
- Specific: `GREETINGS-TABLE-MIGRATION.md`

---

## 🎓 Learning Path

### For New Tango CMS Developers

**Week 1: Understanding**

1. Read `DEVELOPER-HANDOFF-SUMMARY.md` (30 min)
2. Read `CONTENT-LIBRARY-TABLE-PATTERN.md` (45 min)
3. Review `sql/15-create-wisdom-table.sql` (15 min)
4. Browse existing CMS pages: `/cms/wisdom-library`, `/cms/greetings-library`

**Week 2: Practice**

1. Follow pattern to create a new test library
2. Create public API endpoints
3. Test with `test-api.html`

**Week 3: Real Work**

1. Implement Motivational Library or Stats Library
2. Document in `PUBLIC-MOTIVATIONAL-API.md` or `PUBLIC-STATS-API.md`

---

### For omnipaki.com Developers

**Day 1: Setup**

1. Read `ONLYHOCKEY-HANDOFF-PACKAGE.md` (10 min)
2. Follow `ONLYHOCKEY-SETUP-CHECKLIST.md` (30 min)
3. Test API with browser or `test-api.html` (15 min)

**Day 2: First Integration**

1. Choose API: Read `PUBLIC-WISDOM-API.md`, `PUBLIC-GREETINGS-API.md`, `PUBLIC-MOTIVATIONAL-API.md`, or `PUBLIC-STATS-API.md` (20 min)
2. Copy example from `onlyhockey-examples/` (30 min)
3. Build first feature (1-2 hours)

**Day 3+: Advanced Features**

1. Add caching strategies
2. Implement error handling
3. Add Hero Collections: `PUBLIC-HERO-COLLECTIONS-API.md`

---

## 🆘 Troubleshooting Docs

| Problem                        | Check This Document                                       |
| ------------------------------ | --------------------------------------------------------- |
| API not working                | `ONLYHOCKEY-SETUP-CHECKLIST.md` (Troubleshooting section) |
| Database schema question       | `CONTENT-LIBRARY-TABLE-PATTERN.md`                        |
| How to create new content type | `DEVELOPER-HANDOFF-SUMMARY.md` (Implementation Checklist) |
| CORS errors                    | Any `PUBLIC-*-API.md` (Troubleshooting section)           |
| Field naming conventions       | `DEVELOPER-HANDOFF-SUMMARY.md` (Code Style section)       |

---

## 📊 Documentation Status

| Content Type     | Database | CMS Page | Public API | API Docs | Status   |
| ---------------- | -------- | -------- | ---------- | -------- | -------- |
| Wisdom           | ✅       | ✅       | ✅         | ✅       | Complete |
| Greetings        | ✅       | ✅       | ✅         | ✅       | Complete |
| Motivational     | ✅       | ✅       | ✅         | ✅       | Complete |
| Stats            | ✅       | ✅       | ✅         | ✅       | Complete |
| Hero Collections | ✅       | ✅       | ✅         | ✅       | Complete |

---

## 🔄 Recent Updates

| Date       | Update                                        | Documents Affected                                                                                                                                                        |
| ---------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2025-10-29 | Completed Motivational Library implementation | `sql/21-create-motivational-table.sql`, `sql/22-migrate-motivational-from-content.sql`, `app/cms/motivational-library/page.tsx`, API routes, `PUBLIC-MOTIVATIONAL-API.md` |
| 2025-10-29 | Hero Collections: `name` → `title` rename     | `sql/10-create-hero-collections.sql`, `app/cms/hero-collections/page.tsx`, API routes, `HERO-COLLECTIONS-INTEGRATION.md`, `sql/MIGRATION-rename-name-to-title.sql`        |
| 2025-10-29 | Added API architecture documentation          | `CONTENT-LIBRARY-TABLE-PATTERN.md`, `DEVELOPER-HANDOFF-SUMMARY.md`                                                                                                        |
| 2025-10-29 | Created Hero Collections API docs             | `PUBLIC-HERO-COLLECTIONS-API.md`                                                                                                                                          |
| 2025-10-29 | Created this index                            | `DOCUMENTATION-INDEX.md`                                                                                                                                                  |

---

## 💡 Pro Tips

1. **Always start with** `DEVELOPER-HANDOFF-SUMMARY.md` if you're new
2. **Use wisdom as reference** - It's the most complete example
3. **Follow the pattern** - Don't reinvent, use established conventions
4. **Document as you go** - Create PUBLIC-\*-API.md when you create APIs
5. **Test with test-api.html** - Quick way to verify APIs work

---

**Need help?** Start with the "Quick Links by Task" section above to find the right doc fast!
