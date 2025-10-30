# "Uni" Prefix Audit Report

**Date:** October 30, 2025  
**Purpose:** Identify and document all "Uni" prefixed code and understand its role

---

## 🔍 Executive Summary

The "Uni" prefix stands for **"Unified"** and was part of an **architectural transition** that the Tango system went through. The system evolved from:

1. **Old System** → Multiple separate tables (`greetings`, `motivational`, `pbp`, `statistics`)
2. **Unified System** → Single `content` table (with "uni-" prefix)
3. **Current System** → Dedicated collection tables (`collection_greetings`, `collection_motivational`, etc.)

### **Current Status:**

- ✅ **UniContent interface** - **STILL IN USE** (actively used)
- ✅ **uni-gemini-\* files** - **LEGACY** (duplicates exist)
- ✅ **uni-content API** - **LEGACY** (references old `content` table)

---

## 📦 What Has the "Uni" Prefix

### **1. TypeScript Interface: `UniContent`**

**Location:** `lib/types.ts` (lines 76-99)

**Status:** ✅ **ACTIVELY USED**

**Purpose:** Universal data structure for collection content types

```typescript
interface UniContent {
  content_type:
    | "stat"
    | "greeting"
    | "motivational"
    | "wisdom"
    | "penalty-box-philosopher";
  content_text: string;
  // ... type-specific fields
}
```

**Used By:**

- All Gemini generation APIs (×11 files)
- `/api/content/save` endpoint
- Main Generator page
- All generation helper files

**Why It's Still Here:** This interface provides a **universal contract** for generated content before it's saved to dedicated tables. It allows all generators to return a consistent format that the save API can then route to the appropriate table.

**Should It Be Removed?** ❌ **NO** - It's essential infrastructure

---

### **2. Legacy Generator Files: `uni-gemini-*.ts`**

**Location:** `lib/` directory

**Files:**

- `uni-gemini-greetings.ts` (121 lines)
- `uni-gemini-motivational.ts` (121 lines)
- `uni-gemini-stats.ts` (121 lines)
- `uni-gemini-wisdom.ts` (113 lines)

**Status:** ⚠️ **LEGACY / DUPLICATES**

**Created:** Part of the "Unified Content System" initiative (see `docs/UNI-CONTENT-SYSTEM-COMPLETE.md`)

**Problem:** These files are **near-identical duplicates** of the non-prefixed versions:

- `gemini-greetings.ts`
- `gemini-motivational.ts`
- `gemini-stats.ts`
- `gemini-wisdom.ts`

**Key Difference:**

- `uni-gemini-greetings.ts` has inline `extractJsonObject()` function (lines 26-40)
- `gemini-greetings.ts` imports `extractJsonObject()` from `content-helpers.ts`

Otherwise, they are **functionally identical**.

**Currently Used?** ❌ **NO** - The system uses the non-prefixed versions

**Why They're Still Here:** Historical artifact from the unified content system experiment that was never fully adopted or cleaned up.

**Should They Be Removed?** ✅ **YES** - They are unused duplicates

---

### **3. Legacy API Routes: `/api/uni-content/`**

**Location:**

- `app/api/uni-content/route.ts` (43 lines - GET)
- `app/api/uni-content/[id]/route.ts` (226 lines - PUT, PATCH, DELETE)

**Status:** ⚠️ **ACTIVELY USED / REFERENCES OLD TABLE**

**Purpose:** CRUD operations for content from the old unified `content` table

**Problem:** These APIs still reference the old **unified `content` table**:

```typescript
await supabaseAdmin.from("content"); // Lines: route.ts:19, [id]/route.ts:65,140,203
```

**Currently Used By:**

- `lib/content-helpers.ts` - Functions: `fetchUniContent()`, `updateUniContent()`, `deleteUniContent()`, `markContentAsUsed()`
- `components/content-card.tsx` - Archive and Delete operations
- `app/cms/hero-collections/page.tsx` - Uses ContentCard component for CRUD operations

**Current System Uses:**

- **Save (NEW):** `/api/content/save` → Routes to `collection_*` tables ✅
- **Fetch (OLD):** `/api/uni-content` → Reads from old `content` table ⚠️
- **Update/Delete (OLD):** `/api/uni-content/[id]` → Updates old `content` table ⚠️

**Should It Be Removed?** ⚠️ **YES, BUT REQUIRES MIGRATION FIRST**

- Old `content` table still exists and is being read from
- Hero Collections page depends on this for archive/delete operations
- Need to either:
  1. Migrate old `content` table data to new `collection_*` tables
  2. Rewrite APIs to work with new tables
  3. Update Hero Collections page to use new table structure

---

## 🗺️ Historical Context

### **Phase 1: Old System (Pre-Unified)**

```
Database:
├── greetings table
├── motivational table
├── pbp table
└── statistics table

Code:
├── gemini-greetings.ts
├── gemini-motivational.ts
└── gemini-stats.ts
```

### **Phase 2: Unified System Experiment**

```
Database:
└── content table (all types)

Code:
├── lib/uni-content-types.ts
├── lib/uni-gemini-greetings.ts
├── lib/uni-gemini-motivational.ts
├── lib/uni-gemini-stats.ts
├── lib/uni-gemini-wisdom.ts
└── app/api/uni-content/
```

**Goal:** Consolidate everything into one table for easier management

**Documented In:**

- `docs/UNI-CONTENT-SYSTEM-COMPLETE.md`
- `docs/UNIVERSAL-SAVE-ROUTE-UPDATE.md`

### **Phase 3: Current System (Collection Tables)**

```
Database:
├── collection_greetings table
├── collection_motivational table
├── collection_stats table
├── collection_wisdom table
└── trivia_questions table

Code:
├── lib/types.ts (with UniContent interface)
├── lib/gemini-greetings.ts
├── lib/gemini-motivational.ts
├── lib/gemini-stats.ts
├── lib/gemini-wisdom.ts
└── app/api/content/save/
```

**Current Approach:** Dedicated tables with centralized save logic

**Documented In:**

- `docs/CONTENT-TYPES-AUDIT.md`
- `docs/CONTENT-TYPES-MIGRATION-COMPLETE.md`
- `docs/GREETINGS-TABLE-MIGRATION.md`

---

## 📊 Detailed File Analysis

### **Files That Should STAY**

#### `lib/types.ts` → `UniContent` interface

- **Lines:** 76-99
- **Used By:** 28+ files
- **Purpose:** Universal content structure
- **Status:** ✅ Essential infrastructure

---

### **Files That Should BE REMOVED**

#### 1. `lib/uni-gemini-greetings.ts` (121 lines)

- ❌ Duplicate of `lib/gemini-greetings.ts`
- ❌ Not imported anywhere
- ❌ Contains duplicate `extractJsonObject()` function

#### 2. `lib/uni-gemini-motivational.ts` (121 lines)

- ❌ Duplicate of `lib/gemini-motivational.ts`
- ❌ Not imported anywhere
- ❌ Contains duplicate `extractJsonObject()` function

#### 3. `lib/uni-gemini-stats.ts` (121 lines)

- ❌ Duplicate of `lib/gemini-stats.ts`
- ❌ Not imported anywhere
- ❌ Contains duplicate `extractJsonObject()` function

#### 4. `lib/uni-gemini-wisdom.ts` (113 lines)

- ❌ Duplicate of `lib/gemini-wisdom.ts`
- ❌ Not imported anywhere
- ❌ Contains duplicate `extractJsonObject()` function

**Total Lines to Delete:** ~476 lines of duplicate code

---

### **Files That Need MIGRATION (NOT DELETION)**

#### `app/api/uni-content/route.ts` (43 lines)

- ⚠️ **ACTIVELY USED** by Hero Collections page
- ⚠️ References old `content` table for GET operations
- ⚠️ Used by `lib/content-helpers.ts → fetchUniContent()`

#### `app/api/uni-content/[id]/route.ts` (226 lines)

- ⚠️ **ACTIVELY USED** by Hero Collections page
- ⚠️ References old `content` table for PUT, PATCH, DELETE operations
- ⚠️ Used by `lib/content-helpers.ts → updateUniContent()`, `deleteUniContent()`
- ⚠️ Used by `components/content-card.tsx` for archive/delete buttons

#### `lib/content-helpers.ts`

- ⚠️ Contains functions that call `/api/uni-content` endpoints
- ⚠️ Functions: `fetchUniContent()`, `updateUniContent()`, `deleteUniContent()`, `markContentAsUsed()`
- ⚠️ Also imported by 7 Gemini generation files (only for `extractJsonObject()` function)

#### `components/content-card.tsx` (193 lines)

- ⚠️ **ACTIVELY USED** by Hero Collections page
- ⚠️ Calls `/api/uni-content/[id]` for PATCH (archive) and DELETE operations

#### `app/cms/hero-collections/page.tsx` (412 lines)

- ⚠️ **ACTIVELY USED** page in CMS
- ⚠️ Uses `ContentCard` component which depends on uni-content API
- ⚠️ Manages hero collections that pull from old `content` table

**Confirmed Findings:**

1. ✅ Old `content` table still exists and is in active use
2. ✅ Hero Collections page actively reads/writes to it
3. ✅ Archive and Delete functionality depends on uni-content API
4. ⚠️ **Cannot delete these files without breaking Hero Collections page**

---

## 🎯 Recommendation Summary

### **Immediate Actions (Safe to Do Now)**

1. ✅ **Delete duplicate uni-gemini files** (4 files, ~476 lines)
   - `lib/uni-gemini-greetings.ts`
   - `lib/uni-gemini-motivational.ts`
   - `lib/uni-gemini-stats.ts`
   - `lib/uni-gemini-wisdom.ts`
   - **Confirmed:** Not imported or used anywhere

2. ✅ **Keep UniContent interface** in `lib/types.ts`
   - Actively used and essential

### **Requires Migration (Cannot Delete Yet)**

3. ⚠️ **OLD CONTENT TABLE SYSTEM IS STILL IN USE**
   - Old `content` table exists and is actively used
   - Hero Collections page depends on it
   - Archive/Delete functionality relies on uni-content API
4. ⚠️ **Files that CANNOT be deleted yet:**
   - `app/api/uni-content/route.ts` - Used by Hero Collections
   - `app/api/uni-content/[id]/route.ts` - Used by Hero Collections
   - `lib/content-helpers.ts` - Used by Hero Collections and Gemini generators
   - `components/content-card.tsx` - Used by Hero Collections
   - `app/cms/hero-collections/page.tsx` - Active CMS page

### **Long-Term Migration Path**

5. 📋 **To fully remove old unified system:**
   - [ ] Migrate data from `content` table to appropriate `collection_*` tables
   - [ ] Rewrite Hero Collections to use new table structure
   - [ ] Rewrite content-helpers functions for new tables
   - [ ] Update ContentCard component for new API endpoints
   - [ ] Delete uni-content API routes
   - [ ] Update or archive old documentation

### **Documentation Updates**

6. 📝 **Update documentation**
   - Mark `docs/UNI-CONTENT-SYSTEM-COMPLETE.md` as SUPERSEDED
   - Mark `docs/UNIVERSAL-SAVE-ROUTE-UPDATE.md` as SUPERSEDED
   - Note: Hero Collections still uses old system
   - Create migration plan document if full cleanup desired

---

## 🔬 Verification Commands

### Check if uni-gemini files are imported anywhere:

```bash
grep -r "from.*uni-gemini" app/ lib/ components/
grep -r "import.*uni-gemini" app/ lib/ components/
```

### Check if old content table is referenced:

```bash
grep -r 'from("content")' app/ lib/
```

### Check if uni-content API is called:

```bash
grep -r "/api/uni-content" app/ lib/ components/
```

---

## 📋 Clean-up Checklist

- [ ] Verify uni-gemini-\* files are not imported
- [ ] Delete `lib/uni-gemini-greetings.ts`
- [ ] Delete `lib/uni-gemini-motivational.ts`
- [ ] Delete `lib/uni-gemini-stats.ts`
- [ ] Delete `lib/uni-gemini-wisdom.ts`
- [ ] Investigate `app/api/uni-content/` routes
- [ ] Check database for old `content` table
- [ ] Search frontend for calls to `/api/uni-content`
- [ ] Move obsolete docs to `docs/archive/`
- [ ] Update this audit with findings

---

## 🎓 Key Lessons

1. **"Uni" = "Unified"** - It was an architectural experiment
2. **UniContent interface** - Still useful as a universal contract
3. **uni-gemini-\* files** - Abandoned duplicates that should be removed
4. **uni-content API** - Legacy routes that may need migration or removal

---

## 📊 Summary Table

| Item                        | Status    | Action           | Impact                                  |
| --------------------------- | --------- | ---------------- | --------------------------------------- |
| `UniContent` interface      | ✅ In Use | **KEEP**         | Essential for generation flow           |
| `uni-gemini-*.ts` files (4) | ❌ Unused | **DELETE**       | Safe to remove (476 lines)              |
| `/api/uni-content/` routes  | ⚠️ In Use | **MIGRATE**      | Hero Collections depends on it          |
| `content-helpers.ts`        | ⚠️ In Use | **MIGRATE**      | Contains both used and unused functions |
| `content-card.tsx`          | ⚠️ In Use | **MIGRATE**      | Used by Hero Collections                |
| Old `content` table         | ⚠️ In Use | **MIGRATE DATA** | Hero Collections still reads from it    |

---

## 🎓 Key Takeaways

1. **"Uni" = "Unified"** - It was an architectural experiment to consolidate content
2. **Two Systems Coexist** - New system (collection tables) for generation, old system (content table) for Hero Collections
3. **UniContent Interface** - Still valuable as a universal contract between generators and save API
4. **Duplicate Generators** - Can be safely deleted (uni-gemini-\* files)
5. **Hero Collections** - The blocker to full cleanup; still depends on old unified table
6. **Partial Migration** - Save endpoint was migrated, but read/update/delete were not

---

**Bottom Line:** The "Uni" prefix represents a **partially completed migration**. The **concept** (universal interface) is still valuable and in use. The **duplicate generators** are safe to delete. However, the **old unified table system cannot be removed yet** because Hero Collections actively depends on it for managing and curating content collections.
