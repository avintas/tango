# 🧪 Testing Playground

This directory is your **UI/UX experimentation zone**. Test components, layouts, and designs with sample data before implementing them in production.

## What's Here

- **`/testing`** - Main testing hub with links to different test pages
- **`/testing/components`** - Test individual UI components
- **`/testing/trivia`** - Preview trivia layouts (to be created)
- **`/testing/cards`** - Test content card designs (to be created)
- **`/testing/tables`** - Preview table layouts (to be created)

## Sample Data

All test pages use mock data from:

```
lib/fixtures/sample-trivia.ts
```

This includes:

- Sample trivia questions
- Motivational messages
- Stats facts
- Different categories (daily-quiz, halloween, playoffs, etc.)

## How to Use

1. **Navigate to `/testing`** in your browser
2. **Pick a test page** to experiment on
3. **Edit the page files** to try different UI approaches
4. **Copy components** you like to `/components` when ready
5. **Share screenshots** with your team or AI assistant for feedback

## Adding New Test Pages

Create a new page:

```bash
app/testing/your-page/page.tsx
```

Import sample data:

```typescript
import {
  sampleTriviaSet,
  sampleMotivational,
} from '@/lib/fixtures/sample-trivia';
```

Build your UI experiments!

## Important Notes

⚠️ **Nothing here affects production:**

- No database calls
- No authentication required
- Pure UI experimentation

🗑️ **Safe to delete:**

- This entire `/testing` directory can be removed before production deployment
- It's purely for development/design purposes

## Tips

- Use Tailwind's dark mode classes to test both themes
- Try different breakpoints (mobile, tablet, desktop)
- Test with different content lengths
- Experiment with animations and transitions
- Don't worry about breaking things - it's a playground!

---

**Have fun experimenting! 🎨**
