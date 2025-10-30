# Files with "stats" and "greetings" - Cleanup List

**Date:** October 30, 2025  
**Purpose:** Proactive fix of remaining plural content type names

---

## 🎯 Files That Need Fixing

### **🔴 HIGH PRIORITY - Code Files**

#### 1. **`lib/supabase.ts`** (Line 19)

**Issue:** Old ContentType definition with "stats"

```typescript
export type ContentType =
  | "trivia"
  | "stats" // ❌ Should be "stat"
  | "motivational"
  | "quotes"
  | "stories";
```

**Status:** ⚠️ **LEGACY TYPE DEFINITION**

- This is an OLD ContentType definition
- System now uses `lib/types.ts` as single source of truth
- This definition is likely unused/deprecated

**Action:**

- Option A: Delete entire old ContentType definition (if unused)
- Option B: Update to match new system (stat, greeting, etc.)
- Option C: Add deprecation comment

---

#### 2. **`app/cms/prompts/create/page.tsx`** (Lines 91-93)

**Issue:** Array uses old plural names

```typescript
const contentTypes = [
  "multiple-choice",
  "true-false",
  "who-am-i",
  "stats", // ❌ Should be "stat"
  "motivational",
  "greetings", // ❌ Should be "greeting"
  "penalty-box-philosopher",
];
```

**Impact:** 🔴 **HIGH** - This is a UI component that users interact with

- Prompt creation will use wrong content type values
- Prompts won't match content generation expectations
- Users won't be able to create working prompts

**Action:** Change to `"stat"` and `"greeting"`

---

#### 3. **`app/cms/processing/page.tsx`** (Lines 137, 151)

**Issue:** Content type values use old names

**Location 1 - Line 137:**

```typescript
{
  id: "greetings",   // ❌ Should be "greeting"
  name: "Greetings",
  description: "Welcome messages",
}
```

**Location 2 - Line 151:**

```typescript
const contentTypeMapping = {
  lore: "lore",
  motivational: "motivational",
  greetings: "greetings", // ❌ Should be "greeting"
};
```

**Impact:** 🔴 **HIGH** - Processing page functionality

- Content type selection will use wrong values
- Processing operations may fail

**Action:** Change to `"greeting"`

---

#### 4. **`config/content-badges.ts`** (Lines 64, 88)

**Issue:** Badge keys use old names

```typescript
stats: {
  key: "stats",      // ❌ Key should be "stat"
  label: "S",
  color: "orange",
},

greetings: {
  key: "greetings",  // ❌ Key should be "greeting"
  label: "G",
  color: "yellow",
}
```

**Impact:** 🟡 **MEDIUM** - Display badges

- Badge lookup by content type may fail
- Visual indicators won't show for stat/greeting content

**Action:** Change object keys to `stat` and `greeting`

---

#### 5. **`lib/session-helpers.ts`**

**Status:** Need to check

---

#### 6. **`app/api/prompts/route.ts`**

**Status:** Need to check

---

### **✅ Documentation Files (OK - No Action)**

These files reference old names for documentation purposes:

- `docs/BULK-GENERATE-AUDIT.md` - Shows before/after (correct)
- `docs/CONTENT-TYPES-MIGRATION-COMPLETE.md` - Historical (correct)
- `docs/UNIVERSAL-SAVE-ROUTE-UPDATE.md` - Historical (correct)
- `docs/CONTENT-TYPES-FULL-AUDIT-SUMMARY.md` - Documentation (correct)
- `docs/CONTENT-TYPES-CONSISTENCY-AUDIT.md` - Audit report (correct)

---

## 📊 Summary Table

| File                              | Lines    | Issue                | Priority   | Impact                 |
| --------------------------------- | -------- | -------------------- | ---------- | ---------------------- |
| `lib/supabase.ts`                 | 19       | Old ContentType def  | 🟡 Medium  | Legacy type            |
| `app/cms/prompts/create/page.tsx` | 91-93    | "stats", "greetings" | 🔴 High    | Prompt creation broken |
| `app/cms/processing/page.tsx`     | 137, 151 | "greetings"          | 🔴 High    | Processing broken      |
| `config/content-badges.ts`        | 64, 88   | Badge keys           | 🟡 Medium  | Display issues         |
| `lib/session-helpers.ts`          | TBD      | TBD                  | ⚠️ Unknown | Need check             |
| `app/api/prompts/route.ts`        | TBD      | TBD                  | ⚠️ Unknown | Need check             |

---

## 🎯 Recommended Fix Order

### **Phase 1: Critical UI/Functionality** (Do First)

1. ✅ `app/api/bulk-generate/route.ts` - **ALREADY FIXED**
2. 🔴 `app/cms/prompts/create/page.tsx` - User-facing
3. 🔴 `app/cms/processing/page.tsx` - User-facing

### **Phase 2: Configuration** (Do Second)

4. 🟡 `config/content-badges.ts` - Display/UI

### **Phase 3: Legacy Code** (Do Last)

5. 🟡 `lib/supabase.ts` - Consider removing old type definition
6. ⚠️ Check `lib/session-helpers.ts`
7. ⚠️ Check `app/api/prompts/route.ts`

---

## 🔍 Verification Commands

After fixes, verify no instances remain:

```bash
# Should only find documentation files
grep -r '"stats"' --include="*.ts" --include="*.tsx" app/ lib/ components/ config/

# Should only find documentation files
grep -r '"greetings"' --include="*.ts" --include="*.tsx" app/ lib/ components/ config/

# Should find ONLY: "stat" and "greeting" (singular)
grep -r 'content_type.*["'\'']stat' app/ lib/
```

---

## 💡 Root Cause

These files were created before or during the content type standardization and never updated. They reference the old naming convention.

---

**Next Step:** Fix Phase 1 files (prompts/create and processing pages) immediately as they affect user functionality.
