# Uni-Prefix Architecture Diagram

**Date:** October 30, 2025

---

## 🏗️ Current System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      TANGO CONTENT SYSTEM                        │
│                    (Two Systems Coexist)                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  NEW SYSTEM (Collection Tables) - Used for Generation           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Main Generator Page                                             │
│         ↓                                                        │
│  Gemini Generation APIs (×8)                                     │
│    - gemini-greetings.ts                                         │
│    - gemini-motivational.ts                                      │
│    - gemini-stats.ts                                             │
│    - gemini-wisdom.ts                                            │
│    - gemini-multiple-choice.ts                                   │
│    - gemini-true-false.ts                                        │
│    - gemini-who-am-i.ts                                          │
│    - gemini-penalty-box-philosopher.ts                           │
│         ↓                                                        │
│  Returns: UniContent[] interface                                 │
│         ↓                                                        │
│  POST /api/content/save                                          │
│         ↓                                                        │
│  Routes to appropriate table:                                    │
│    - collection_greetings                                        │
│    - collection_motivational                                     │
│    - collection_stats                                            │
│    - collection_wisdom                                           │
│    - trivia_questions                                            │
│                                                                  │
│  ✅ STATUS: WORKING & CURRENT                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  OLD SYSTEM (Unified Content Table) - Still Used by Hero        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Hero Collections Page                                           │
│         ↓                                                        │
│  ContentCard Component                                           │
│         ↓                                                        │
│  content-helpers.ts functions:                                   │
│    - fetchUniContent()                                           │
│    - updateUniContent()                                          │
│    - deleteUniContent()                                          │
│         ↓                                                        │
│  API Routes:                                                     │
│    - GET    /api/uni-content?type=...                            │
│    - PUT    /api/uni-content/[id]                                │
│    - PATCH  /api/uni-content/[id]                                │
│    - DELETE /api/uni-content/[id]                                │
│         ↓                                                        │
│  Old Database Table:                                             │
│    - content (unified table)                                     │
│                                                                  │
│  ⚠️ STATUS: LEGACY BUT STILL IN USE                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  DUPLICATE FILES (Not Used) - Safe to Delete                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ❌ lib/uni-gemini-greetings.ts                                 │
│  ❌ lib/uni-gemini-motivational.ts                              │
│  ❌ lib/uni-gemini-stats.ts                                     │
│  ❌ lib/uni-gemini-wisdom.ts                                    │
│                                                                  │
│  These were part of the "unified system" experiment             │
│  that was never fully adopted.                                  │
│                                                                  │
│  STATUS: UNUSED DUPLICATES - DELETE NOW                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Comparison

### **NEW SYSTEM (Generation Flow)**

```
Source Content
    ↓
Gemini AI Generation
    ↓
UniContent[] (standardized format)
    ↓
/api/content/save (smart router)
    ↓
collection_greetings
collection_motivational
collection_stats
collection_wisdom
trivia_questions
```

### **OLD SYSTEM (Hero Collections Flow)**

```
Hero Collections UI
    ↓
ContentCard component
    ↓
/api/uni-content (GET/PUT/PATCH/DELETE)
    ↓
content (old unified table)
```

---

## 🎯 The Problem

The system went through a migration:

1. **Phase 1:** Multiple separate tables
2. **Phase 2:** Unified `content` table (with uni-\* prefix)
3. **Phase 3:** Back to dedicated `collection_*` tables

**Result:** Phase 2 (unified) was partially migrated to Phase 3:

- ✅ **Generation & Save** → Migrated to new collection tables
- ⚠️ **Hero Collections** → Still uses old unified table
- ❌ **Duplicate Generators** → Left behind as ghost code

---

## 🔍 What Each "Uni" Item Does

### ✅ **UniContent Interface** (Keep)

```typescript
interface UniContent {
  content_type: "stat" | "greeting" | ...
  content_text: string;
  // ... other fields
}
```

**Purpose:** Universal data contract between generators and save API

**Why it's needed:** Allows all generators to return consistent format that the save API can route to appropriate tables

---

### ❌ **uni-gemini-\*.ts Files** (Delete)

```
lib/uni-gemini-greetings.ts
lib/uni-gemini-motivational.ts
lib/uni-gemini-stats.ts
lib/uni-gemini-wisdom.ts
```

**Purpose:** Were supposed to be "unified" generators for Phase 2

**Problem:** Never adopted. System uses non-prefixed versions instead.

**Status:** Duplicate code, not imported anywhere

---

### ⚠️ **uni-content API Routes** (Need Migration)

```
app/api/uni-content/route.ts
app/api/uni-content/[id]/route.ts
```

**Purpose:** CRUD operations for old unified `content` table

**Problem:** Hero Collections page still depends on them

**Why they can't be deleted yet:** Would break Hero Collections functionality

---

## 🛠️ What Needs to Happen

### **Immediate (Safe Now)**

```bash
# Delete duplicate generators
rm lib/uni-gemini-greetings.ts
rm lib/uni-gemini-motivational.ts
rm lib/uni-gemini-stats.ts
rm lib/uni-gemini-wisdom.ts
```

### **Long-term (Requires Planning)**

1. Decide if Hero Collections should use new collection tables
2. If yes:
   - Migrate data from `content` table to `collection_*` tables
   - Rewrite Hero Collections to query new tables
   - Rewrite uni-content API routes for new tables
   - Delete old `content` table
3. If no:
   - Keep old system for Hero Collections
   - Document that it's intentionally legacy
   - Ensure no confusion between systems

---

## 📊 Impact Assessment

| Component            | Depends On             | Can Delete?          |
| -------------------- | ---------------------- | -------------------- |
| Main Generator       | UniContent interface   | No - essential       |
| Main Generator       | gemini-\*.ts (non-uni) | No - in use          |
| Main Generator       | /api/content/save      | No - in use          |
| Hero Collections     | content-card.tsx       | No - in use          |
| Hero Collections     | /api/uni-content       | No - still needed    |
| Hero Collections     | old `content` table    | No - still needed    |
| **uni-gemini-\*.ts** | Nothing                | **Yes - delete now** |

---

## 🎓 Lessons Learned

1. **Architectural migrations should be all-or-nothing**
   - Don't leave half-migrated systems
   - Either complete the migration or roll back

2. **Name with purpose, not process**
   - "Uni" prefix indicated a process (unification)
   - Should have been named by purpose (interface vs implementation)

3. **Delete abandoned code immediately**
   - uni-gemini files should have been deleted when approach changed
   - Leaving them creates confusion

4. **Document system boundaries**
   - Should have been clear which pages use which system
   - Hero Collections vs Main Generator have different data sources

---

**Recommendation:** Delete the 4 uni-gemini files now (safe). Plan a separate project to migrate Hero Collections if desired.
