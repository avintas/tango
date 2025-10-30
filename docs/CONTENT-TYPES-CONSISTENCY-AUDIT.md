# Content Types Consistency Audit

**Date:** October 30, 2025  
**Purpose:** Identify and fix content type naming inconsistencies

---

## 🎯 Executive Summary

Found **CRITICAL INCONSISTENCY**: The `lib/gemini-stats.ts` generator is returning `"statistic"` but the system expects `"stat"`. This will cause save failures.

---

## 📋 Issues Found

### **🔴 CRITICAL: gemini-stats.ts Returns Wrong Type**

**File:** `lib/gemini-stats.ts` (Line 86)

**Current:**

```typescript
content_type: "statistic",  // ❌ WRONG
```

**Should Be:**

```typescript
content_type: "stat",  // ✅ CORRECT
```

**Impact:**

- Generated stats content will have `content_type: "statistic"`
- Save API expects `"stat"` (line 35 of `/api/content/save/route.ts`)
- **This will cause save failures** with "Unsupported content type" error

**Fix:** Change line 86 of `lib/gemini-stats.ts` from `"statistic"` to `"stat"`

---

### **✅ VERIFIED: Other Generators Are Correct**

Checked all other generators:

| File                         | Line | Returns          | Status       |
| ---------------------------- | ---- | ---------------- | ------------ |
| `lib/gemini-greetings.ts`    | 84   | `"greeting"`     | ✅ Correct   |
| `lib/gemini-motivational.ts` | 84   | `"motivational"` | ✅ Correct   |
| `lib/gemini-wisdom.ts`       | 77   | `"wisdom"`       | ✅ Correct   |
| `lib/gemini-stats.ts`        | 86   | `"statistic"`    | ❌ **WRONG** |

---

## 🔍 System-Wide Content Type Usage

### **Official Content Types** (from `lib/types.ts`)

```typescript
export type ContentType =
  | "stat" // ✅ NOT "statistic" or "statistics"
  | "greeting" // ✅ NOT "greetings"
  | "motivational" // ✅
  | "wisdom" // ✅
  | "penalty-box-philosopher" // ✅
  | "multiple-choice" // ✅
  | "true-false" // ✅
  | "who-am-i"; // ✅
```

---

## 📊 Content Type Mapping

### **Content Type → Database Table**

| Content Type              | Table Name                | API Endpoint                                   | Generator File                 |
| ------------------------- | ------------------------- | ---------------------------------------------- | ------------------------------ |
| `stat`                    | `collection_stats`        | `/api/gemini/generate-stats`                   | `gemini-stats.ts` ⚠️           |
| `greeting`                | `collection_greetings`    | `/api/gemini/generate-greetings`               | `gemini-greetings.ts` ✅       |
| `motivational`            | `collection_motivational` | `/api/gemini/generate-motivational`            | `gemini-motivational.ts` ✅    |
| `wisdom`                  | `collection_wisdom`       | `/api/gemini/generate-wisdom` ❌               | `gemini-wisdom.ts` ✅          |
| `penalty-box-philosopher` | `collection_wisdom`       | `/api/gemini/generate-penalty-box-philosopher` | ✅                             |
| `multiple-choice`         | `trivia_questions`        | `/api/gemini/generate-multiple-choice`         | `gemini-multiple-choice.ts` ✅ |
| `true-false`              | `trivia_questions`        | `/api/gemini/generate-true-false`              | `gemini-true-false.ts` ✅      |
| `who-am-i`                | `trivia_questions`        | `/api/gemini/generate-who-am-i`                | `gemini-who-am-i.ts` ✅        |

---

## ⚠️ Missing API Endpoint

### **No Generate-Wisdom Endpoint**

**Content Type:** `wisdom`  
**Expected Endpoint:** `/api/gemini/generate-wisdom`  
**Actual:** Does NOT exist  
**Generator File:** `lib/gemini-wisdom.ts` exists ✅  
**API File:** `app/api/gemini/generate-wisdom/route.ts` MISSING ❌

**Impact:**

- Cannot generate "wisdom" content type from Main Generator
- Process Jobs route has empty endpoint for wisdom (line 33)
- Only "penalty-box-philosopher" can be generated (which saves to collection_wisdom)

**Decision Needed:**

1. Is "wisdom" a separate content type that needs generation?
2. Or is "wisdom" only created via "penalty-box-philosopher"?
3. Should we create `/api/gemini/generate-wisdom` route?

---

## 📁 Content Type Selector

**File:** `components/content-type-selector.tsx`

All content types are properly defined:

```typescript
export const typeNames: Record<ContentType, string> = {
  stat: "Stats", // ✅ Display name
  greeting: "Greetings", // ✅ Plural for display
  motivational: "Motivational", // ✅
  wisdom: "Wisdom", // ✅
  "penalty-box-philosopher": "Penalty Box Philosopher", // ✅
  "multiple-choice": "Multiple Choice", // ✅
  "true-false": "True/False", // ✅
  "who-am-i": "Who Am I?", // ✅
};
```

✅ **Status:** Consistent and correct

---

## 🗂️ Process Jobs Integration

**File:** `app/api/process-jobs/route.ts`

### Badge Key Mapping (Lines 10-21)

```typescript
const badgeKeyMap: Record<ContentType, string> = {
  stat: "stat", // ✅
  motivational: "motivational", // ✅
  greeting: "greeting", // ✅
  "penalty-box-philosopher": "pbp", // ✅
  wisdom: "wisdom", // ✅
  "multiple-choice": "mc", // ✅
  "true-false": "tf", // ✅
  "who-am-i": "whoami", // ✅
};
```

### API Endpoint Mapping (Lines 24-36)

```typescript
const endpointMap: Record<ContentType, string> = {
  stat: "/api/gemini/generate-stats", // ✅
  motivational: "/api/gemini/generate-motivational", // ✅
  greeting: "/api/gemini/generate-greetings", // ✅
  "penalty-box-philosopher": "/api/gemini/generate-penalty-box-philosopher", // ✅
  wisdom: "", // ⚠️ Wisdom is not generated this way
  "multiple-choice": "/api/gemini/generate-multiple-choice", // ✅
  "true-false": "/api/gemini/generate-true-false", // ✅
  "who-am-i": "/api/gemini/generate-who-am-i", // ✅
};
```

### Save Endpoint Mapping (Lines 38-57)

```typescript
const triviaTypes = ["multiple-choice", "true-false", "who-am-i"];
→ Save to: "/api/trivia/save"  // ✅

const uniContentTypes = ["stat", "motivational", "greeting", "penalty-box-philosopher", "wisdom"];
→ Save to: "/api/content/save"  // ✅
```

✅ **Status:** All mappings correct

---

## 🎯 Recommended Fixes

### **Priority 1: CRITICAL - Fix gemini-stats.ts**

**File:** `lib/gemini-stats.ts`  
**Line:** 86  
**Change:**

```typescript
// BEFORE:
content_type: "statistic",

// AFTER:
content_type: "stat",
```

**Reason:** Prevents save failures

---

### **Priority 2: DECISION NEEDED - Wisdom Generation**

**Options:**

**Option A: Create Wisdom Generation Endpoint**

- Create `/api/gemini/generate-wisdom/route.ts`
- Use existing `lib/gemini-wisdom.ts` generator
- Add to Main Generator page as separate option
- Update process-jobs to point to new endpoint

**Option B: Keep Current Approach**

- "wisdom" content type only accessible via "penalty-box-philosopher"
- Document that wisdom generation uses PBP generator
- No separate wisdom endpoint needed

**Recommendation:** Clarify with stakeholders if wisdom needs separate generation or if current PBP approach is sufficient.

---

## ✅ What's Working Correctly

1. ✅ **ContentType TypeScript Definition** - Clean and complete
2. ✅ **Content Type Selector** - All types properly displayed
3. ✅ **Process Jobs Mapping** - Correct endpoints and save routes
4. ✅ **Save API** - Properly routes to collection tables
5. ✅ **Most Generators** - Return correct content_type values
6. ✅ **Database Tables** - All collection tables exist
7. ✅ **Trivia Generation** - All 3 types working correctly

---

## 📋 Verification Checklist

After fixing gemini-stats.ts:

- [ ] Update `lib/gemini-stats.ts` line 86
- [ ] Test stats generation in Main Generator
- [ ] Verify stats save to `collection_stats` table
- [ ] Check that no "Unsupported content type" errors occur
- [ ] Decide on wisdom generation approach
- [ ] Update documentation if needed

---

## 🔬 How to Test

### **Test Stats Generation**

1. Go to Main Generator page
2. Select "Stats" content type
3. Add source content
4. Load a stats prompt
5. Generate content
6. Click "Save Generated Content"
7. Verify:
   - ✅ No "Unsupported content type: statistic" error
   - ✅ Content saves to `collection_stats` table
   - ✅ Response includes `table: "collection_stats"`

---

## 📊 Impact Assessment

| Issue                            | Severity    | Impact                           | Fix Difficulty     |
| -------------------------------- | ----------- | -------------------------------- | ------------------ |
| gemini-stats returns "statistic" | 🔴 CRITICAL | Breaks stats saving              | Easy (1 line)      |
| No wisdom generation endpoint    | 🟡 MEDIUM   | Can't generate wisdom separately | Medium (if needed) |

---

## 🎓 Key Takeaways

1. **Always use singular form** - "stat" not "statistic", "greeting" not "greetings"
2. **Check generator return values** - Ensure they match ContentType definition
3. **Test end-to-end** - Generation → Save → Verify in database
4. **Document architectural decisions** - Is wisdom separate or PBP-only?

---

**Bottom Line:** Fix the critical `gemini-stats.ts` issue immediately. The wisdom generation endpoint is a design decision that needs stakeholder input.
