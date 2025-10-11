# Prompt Generator Variables: Game Content

This file contains all the variable options for the dynamic prompt generator, designed for creating various types of game content.

## game_type

- Trivia game
- Quiz
- Brain Teaser
- Pop Quiz
- Lightning round
- Assessment
- Study Guide

## question_type

- Fact-based
- Comparison
- Clue-based
- Multiple-Choice
- True or False

## topic

- NHL Records
- Stanley Cup History
- Famous Goaltenders
- NHL Mascots
- Hockey Nicknames
- All-Star Games
- Youth Hockey
- Hockey Rules and Penalties
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

- a casual pub night with a mix of avid fans and newcomers
- a group of dedicated hockey fans
- a group of people new to the sport
- a family game night with kids and adults
- a high school classroom
- a corporate event

## number_of_questions

- 1
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
- challenging
- niche
- funny
- surprising
- easy to understand

## fact_quality_2 (Optional, for added specificity)

- entertaining
- educational
- random
- thought-provoking
- anecdotal
- biographical

## difficulty_level

- easy
- medium
- hard
- mixed difficulty

## output_format

- a Markdown document
- a JSON object
- a structured table
- a plain text list

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
