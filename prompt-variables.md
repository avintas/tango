# Prompt Generator Variables (Revised Structure)

This file contains all the variable options for the dynamic prompt generator.
The structure uses question_type as the primary driver with conditional fields.

## game_type

- Trivia game
- Quiz
- Brain Teaser
- Pop Quiz
- Study Guide
- Assessment

## question_type

- Fact-based
- Comparison
- Clue-based
- Multiple-Choice
- True or False

## topic

- Hockey Geography
- NHL Records
- Stanley Cup History
- Famous Goaltenders
- NHL Mascots
- Hockey Nicknames
- All-Star Games
- Coaching
- Halloween Hockey
- Women's Hockey (WHL, Olympics)
- International Hockey (Olympics, IIHF)
- Minor Leagues (AHL, ECHL)
- Youth Hockey
- Hockey Rules and Penalties
- NHL Team Logos and Jerseys
- Rivalries
- Draft History
- Arenas and Stadiums
- Hockey in Pop Culture (Movies, TV)
- International

## audience

- a casual pub night with a mix of avid fans and newcomers
- a group of dedicated hockey fans
- a group of people new to the sport
- a family game night with kids and adults
- a team-building event for a company
- a high school classroom

## number_of_questions

- 1
- 5
- 10
- 15
- 20
- 25

## comparison_type

- a "more than..." comparison
- a counter-intuitive fact
- a surprising comparison (e.g., population, distance, size)
- a "did you know?" style fact

## fact_quality_1

- verifiable
- recent
- historic
- challenging
- niche
- statistical
- anecdotal
- biographical
- rule-based
- funny

## fact_quality_2

- not too obscure
- surprising
- well-known
- educational
- entertaining
- easy to understand
- thought-provoking
- random
- visual
- auditory (e.g., a question about a goal call)

## difficulty_level

- easy
- medium
- hard
- mixed difficulty

## output_format

- a list
- a JSON object
- a Markdown document
- a structured table

## answer_format_fact_based

- a concise answer
- a one-word answer
- a brief explanation with the answer

## answer_format_multiple_choice

- a concise answer
- a brief explanation with the answer

## answer_format_clue_based

- a full name
- a brief explanation
- a one-word answer
