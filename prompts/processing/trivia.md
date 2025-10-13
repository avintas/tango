# Trivia Generation Prompt

Generate trivia questions from the source content below using the **exact format** specified.

## Requirements:

- Create multiple-choice questions with 4 options each
- Include 1 correct answer and 3 plausible wrong answers
- Questions should be factually accurate and verifiable
- Extract single, non-obvious facts from the source material
- Use engaging question titles/themes
- Bold key facts and numbers in explanations

## Exact Output Format:

```markdown
# Roster Trivia Challenge

## [Create an Engaging Question Title]

[Write the question text here]

---

### Options

**A.** [Option 1]  
**B.** [Option 2]  
**C.** [Option 3]  
**D.** [Option 4]

---

### Answer

**[Correct letter].** [Correct answer text]

### Explanation

[Brief explanation with **bold** emphasis on key facts/numbers]

---

**Category:** [Topic category from source]  
**Season:** [If applicable, e.g., 2025–26 or Historical]
```

## Formatting Rules:

- Use `#` for main title, `##` for question title, `###` for section headers
- Use `---` horizontal rules for clear visual separation
- Bold important facts, numbers, and player names using `**text**`
- Keep explanations brief but engaging (2-3 sentences max)
- Include metadata at the bottom for filtering

## Source Content:

{source_content}

Please generate trivia questions based on the content above, following this exact format.
