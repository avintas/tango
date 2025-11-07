# Process Builders

**Isolated workflow automation system for Tango CMS.**

## 🎯 Isolation Guarantee

**This entire folder is completely isolated from the CMS codebase.**

### Deletion Safety

**To remove ALL Process Builders:**

```bash
rm -rf process-builders/
```

**Result:** ✅ CMS continues working normally - no broken imports, no errors.

**To remove a single Process Builder:**

```bash
rm -rf process-builders/build-trivia-set/
npm run discover-builders  # Regenerate registry
```

**Result:** ✅ Other process builders continue working.

### What Process Builders Can Use

✅ **Shared Infrastructure (Safe to use):**

- `lib/supabase.ts` - Database client
- `lib/supabase-admin.ts` - Admin database client
- `components/ui/*` - Shared UI components

❌ **What Process Builders CANNOT Use:**

- `app/cms/*` - CMS pages
- `lib/gemini-*.ts` - CMS generation logic
- `components/content-library/*` - CMS components

### What CMS CANNOT Use

❌ **CMS never imports from Process Builders:**

- CMS code never imports from `process-builders/`
- Process Builders are self-contained modules

---

## Architecture

```
process-builders/
├── core/              # Shared infrastructure (all builders use)
├── shared/            # Utilities used by 3+ builders
└── [builder-name]/    # Individual process builders (isolated)
```

---

## Adding a New Process Builder

1. Create folder: `process-builders/my-new-process/`
2. Export metadata in `lib/index.ts`
3. Run: `npm run discover-builders`
4. Done! Auto-discovered.

---

## Documentation

See `docs/process-builders-final-architecture.md` for complete architecture details.
