# use-system-status.ts Issues Found

**Date:** October 30, 2025  
**File:** `lib/hooks/use-system-status.ts`  
**Status:** ❌ **NOT CLEAN - Multiple Issues**

---

## 🔴 Issues Found

### **Issue 1: Wrong Table Name**

**Line 46:** Uses `source_content` table

```typescript
const { count: sourceCount, error: sourceError } =
  await supabase.from("source_content"); // ❌ WRONG TABLE NAME
```

**Should be:** `ingested` (the correct table name)

**Impact:** Query will fail - `source_content` table doesn't exist

---

### **Issue 2: Invalid Query Filter**

**Line 48:** Invalid JSONB query syntax

```typescript
.eq('metadata->>type', 'source_material')  // ❌ INVALID
```

**Problem:**

- Trying to filter by a JSONB field that doesn't exist
- The `ingested` table doesn't have a `metadata` column with a `type` field

**Should be:** Either remove this filter or use correct column names

---

### **Issue 3: Outdated TODO Comment**

**Lines 54-56:** Hardcoded trivia count with outdated comment

```typescript
// Get trivia sets count (for now, we'll use a placeholder until we create trivia_questions table)
// TODO: Replace with real trivia questions count when table is created
const triviaSetsCount = 0; // ❌ HARDCODED
```

**Problem:**

- Comment says "until we create trivia_questions table"
- But `trivia_questions` table **ALREADY EXISTS** and has been in use
- Hardcoded `0` provides no useful information

**Should be:** Query actual `trivia_questions` table for real count

---

## ✅ Correct Implementation

### **Fixed Version:**

```typescript
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface SystemStatus {
  apiConfigured: boolean;
  apiStatus: "configured" | "not-configured" | "testing" | "error";
  sourceItemsCount: number;
  triviaSetsCount: number;
  loading: boolean;
  error: string | null;
}

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus>({
    apiConfigured: false,
    apiStatus: "testing",
    sourceItemsCount: 0,
    triviaSetsCount: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        // Test Gemini API configuration
        let apiConfigured = false;
        try {
          const response = await fetch("/api/gemini/test", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const result = await response.json();
          apiConfigured = result.success;
        } catch (apiError) {
          console.log("Gemini API test failed:", apiError);
          apiConfigured = false;
        }

        // Get source items count from ingested table
        const { count: sourceCount, error: sourceError } = await supabase
          .from("ingested") // ✅ CORRECT TABLE NAME
          .select("*", { count: "exact", head: true });

        if (sourceError) {
          throw new Error(`Source count error: ${sourceError.message}`);
        }

        // Get trivia questions count
        const { count: triviaCount, error: triviaError } = await supabase
          .from("trivia_questions") // ✅ ACTUAL TABLE
          .select("*", { count: "exact", head: true });

        if (triviaError) {
          console.log("Trivia count error:", triviaError);
          // Don't throw - just use 0 if there's an error
        }

        setStatus({
          apiConfigured,
          apiStatus: apiConfigured ? "configured" : "not-configured",
          sourceItemsCount: sourceCount || 0,
          triviaSetsCount: triviaCount || 0, // ✅ REAL COUNT
          loading: false,
          error: null,
        });
      } catch (error) {
        setStatus((prev) => ({
          ...prev,
          apiStatus: "error",
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
      }
    };

    checkSystemStatus();
  }, []);

  return status;
}
```

---

## 📊 Changes Required

| Line  | Issue                         | Fix                                                |
| ----- | ----------------------------- | -------------------------------------------------- |
| 46    | Wrong table: `source_content` | Change to `ingested`                               |
| 48    | Invalid filter                | Remove `.eq('metadata->>type', 'source_material')` |
| 54-56 | Outdated TODO + hardcoded 0   | Query `trivia_questions` table                     |

---

## 🎯 Impact Assessment

### **Current Issues:**

- ❌ Hook will fail when trying to get source count (wrong table)
- ❌ Always shows 0 trivia questions (hardcoded)
- ❌ Misleading TODO comment suggests feature not implemented

### **After Fix:**

- ✅ Correctly queries `ingested` table for source content count
- ✅ Shows real trivia question count from database
- ✅ No outdated comments
- ✅ Hook provides accurate system status

---

## 🔍 Related Issues

This hook is likely used in:

- Dashboard pages
- System status displays
- Admin overview panels

**Impact:** Any component using this hook will show incorrect data or fail silently.

---

## ✅ Testing After Fix

1. Check dashboard loads correctly
2. Verify source count is accurate
3. Verify trivia count is accurate
4. No console errors about missing tables
5. System status displays correctly

---

**Priority:** 🟡 **MEDIUM** - Hook may be failing silently, but doesn't break core functionality
