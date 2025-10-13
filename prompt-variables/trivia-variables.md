# Prompt Generator Variables: Trivia Content

This file contains all the variable options for the dynamic prompt generator, designed for creating trivia game content.

## game_type

- Trivia
- Pop Quiz

## question_type

- Fa
- Co
- Cl
- MC
- TF

## topic

- Records
- Stanley Cup
- Goaltenders
- Mascots
- Hockey Nicknames
- All-Star Games
- Youth Hockey
- Rules
- Rivalries
- Draft History
- Arenas and Stadiums
- Hockey in Pop Culture (Movies, TV)
- Women's Hockey (WHL, Olympics)
- International Hockey (Olympics, IIHF)
- Coaching
- Halloween Hockey
- International

## audience

- casual fans
- dedicated fans
- newbies
- game night

## number_of_questions

- 1
- 3
- 5
- 10
- 15
- 20
- 25

## comparison_type (Conditional: Appears when question_type is "Comparison")

- a "more than..." comparison
- a counter-intuitive fact
- a surprising comparison (e.g., population, distance, size)
- a "did you know?" style fact

## fact_quality_1

- verifiable
- historic
- funny
- surprising

## fact_quality_2 (Optional, for added specificity)

- entertaining
- educational
- random
- biographical

## answer_format_fact_based (Conditional: Appears when question_type is "Fact-based")

- a concise answer
- a one-word answer
- a brief explanation with the answer

## answer_format_multiple_choice (Conditional: Appears when question_type is "Multiple-Choice")

- a concise answer
- a brief explanation with the answer

## answer_format_clue_based (Conditional: Appears when question_type is "Clue-based")

- a full name
- a brief explanation
- a one-word answer

## output_format_structure

**Required Format:**

```markdown
# [Title]

## [Question Title/Theme]

[Question text goes here]

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

**Category:** [Topic category]  
**Season:** [If applicable]
```

**Formatting Rules:**

- Use markdown headings (`#`, `##`)
- Use horizontal rules (`---`) for clear separation
- Bold key facts and numbers for emphasis
- Include metadata at the bottom
- Single, non-obvious fact per question
- Brief, engaging explanation
