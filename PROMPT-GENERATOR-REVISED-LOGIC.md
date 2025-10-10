# Revised Prompt Generator Logic

## Overview

The new system uses **question_type** as the primary driver, with conditional fields that show/hide based on selection. This prevents contradictory choices and creates coherent prompts.

---

## Variable Structure

### **Always Visible (Required):**

1. **game_type** - What you're creating (Quiz, Trivia game, etc.)
2. **question_type** - PRIMARY DRIVER (Fact-based, Comparison, Multiple-Choice, etc.)
3. **topic** - Subject matter (NHL Records, Halloween Hockey, etc.)
4. **audience** - Who it's for (family game night, pub quiz, etc.)
5. **number_of_questions** - How many (5, 10, 15, 20, 25)
6. **output_format** - Output structure (list, JSON, markdown, etc.)

### **Conditional (Depends on question_type):**

7. **comparison_type** - ONLY shown if question_type = "Comparison"
8. **answer_format** - Different options based on question_type

### **Always Optional:**

9. **fact_quality_1** - First quality descriptor (verifiable, historic, etc.)
10. **fact_quality_2** - Second quality descriptor (educational, surprising, etc.)

---

## Conditional Logic

### **If question_type = "Fact-based":**

- **Show:** answer_format dropdown
- **Options:** "a concise answer", "a one-word answer", "a brief explanation with the answer"
- **Hide:** comparison_type

### **If question_type = "Comparison":**

- **Show:** comparison_type dropdown
- **Options:** "a 'more than...' comparison", "a counter-intuitive fact", etc.
- **Hide:** answer_format

### **If question_type = "Clue-based":**

- **Show:** answer_format dropdown
- **Options:** "a full name", "a brief explanation", "a one-word answer"
- **Hide:** comparison_type

### **If question_type = "Multiple-Choice":**

- **Show:** answer_format dropdown
- **Options:** "a concise answer", "a brief explanation with the answer"
- **Hide:** comparison_type

### **If question_type = "True or False":**

- **Hide:** comparison_type AND answer_format
- (True/False format is self-evident)

---

## Example Scenarios

### **Scenario 1: Simple True/False Quiz**

**Selections:**

- game_type: Quiz
- question_type: True or False
- topic: NHL Records
- audience: family game night
- number_of_questions: 10
- fact_quality_1: verifiable
- fact_quality_2: easy to understand
- output_format: a list

**Generated Prompt:**

```
"I am creating a Quiz about NHL Records for a family game night. Generate 10 trivia questions. The questions should be True or False style. Each question should be verifiable and easy to understand. Format the output as a list."
```

**UI Shows:** Game Type, Question Type, Topic, Audience, Questions, Fact Quality 1 & 2, Output  
**UI Hides:** Comparison Type, Answer Format (not needed for True/False)

---

### **Scenario 2: Comparison Questions**

**Selections:**

- game_type: Trivia game
- question_type: Comparison
- topic: Hockey Geography
- audience: casual pub night
- number_of_questions: 15
- comparison_type: a surprising comparison
- fact_quality_1: surprising
- output_format: a list

**Generated Prompt:**

```
"I am creating a Trivia game about Hockey Geography for a casual pub night. Generate 15 trivia questions. The questions should be Comparison style. a surprising comparison. Each question should be surprising. Format the output as a list."
```

**UI Shows:** All base fields + Comparison Type  
**UI Hides:** Answer Format (comparison determines its own format)

---

### **Scenario 3: Multiple Choice with Explanations**

**Selections:**

- game_type: Quiz
- question_type: Multiple-Choice
- topic: Stanley Cup History
- audience: dedicated hockey fans
- number_of_questions: 20
- answer_format: a brief explanation with the answer
- fact_quality_1: challenging
- fact_quality_2: well-known
- output_format: a JSON object

**Generated Prompt:**

```
"I am creating a Quiz about Stanley Cup History for a group of dedicated hockey fans. Generate 20 trivia questions. The questions should be Multiple-Choice style. Each question should be challenging and well-known. Provide a brief explanation with the answer. Format the output as a JSON object."
```

**UI Shows:** All base fields + Answer Format (multiple choice specific)  
**UI Hides:** Comparison Type

---

## Benefits

✅ **Prevents Invalid Combinations**

- Can't mix "True or False" with "multiple-choice question format"
- Can't have "comparison type" with non-comparison questions

✅ **Cleaner UI**

- Only relevant fields visible
- Less overwhelming
- Guided workflow

✅ **Better Prompts**

- Always grammatically correct
- Always logical
- Always coherent

✅ **Flexible**

- Still hundreds of combinations
- Can skip optional fields
- Easy to extend

---

## Implementation

### **UI Flow:**

1. User selects **question_type**
2. UI shows/hides relevant conditional fields
3. Answer format options update based on question_type
4. Live preview updates to show final prompt
5. Generate button sends to Gemini

### **Code Logic:**

```typescript
// Watch question_type changes
useEffect(() => {
  // Reset conditional fields when question_type changes
  if (selections.question_type !== previousQuestionType) {
    setSelections({
      ...selections,
      comparison_type: '',
      answer_format: '',
    });
  }
}, [selections.question_type]);

// Conditionally render fields
{shouldShowComparisonType(selections.question_type) && (
  <ComparisonTypeDropdown />
)}

{shouldShowAnswerFormat(selections.question_type) && (
  <AnswerFormatDropdown options={getAnswerFormatOptions(selections.question_type)} />
)}
```

---

## Migration Steps

1. ✅ Replace current `prompt-variables.md` with revised structure
2. ✅ Update prompt builder to use new logic
3. ✅ Update UI to show/hide conditional fields
4. ✅ Test all question_type combinations
5. ✅ Deploy

---

This revised system creates a **smart, guided experience** that produces perfect prompts every time!
