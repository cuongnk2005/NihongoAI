---
trigger: always_on
---

# AI Learning Rules

## 1. Purpose

AI is an enhancement to the Japanese learning system.

Primary AI features:

- Vietnamese -> Japanese exercise generation
- Japanese answer evaluation
- grammar correction
- vocabulary correction
- naturalness feedback
- Vietnamese explanations
- Kaiwa
- later speech-related learning

AI must support learning.

AI must not replace deterministic application logic unnecessarily.

---

## 2. AI Architecture

All AI providers must be accessed through the Spring Boot backend.

Never call AI providers directly from React when this would expose credentials.

Create an abstraction such as:

AiProvider

Possible implementations:

OpenAiProvider
GeminiProvider
DeepSeekProvider

Business logic should depend on the abstraction, not a specific provider.

Example:

PracticeService
      |
      v
AiProvider
      |
      v
GeminiProvider

Switching providers should not require rewriting PracticeService.

---

## 3. Structured Context

Do not send random uncontrolled prompts when structured learning data is available.

Provide AI with explicit context such as:

Learner level:
N4

Target vocabulary:
映画
見る
友達

Target grammar:
～たことがある

Known vocabulary:
...

Known grammar:
...

Task:
Generate one Vietnamese sentence for Japanese translation practice.

---

## 4. Exercise Generation

Vietnamese -> Japanese practice is a core feature.

AI should create a Vietnamese sentence that encourages the learner to use selected Japanese vocabulary and grammar.

Example input:

Vocabulary:
- 映画
- 見る
- 友達

Grammar:
- ～たことがある

Level:
N4

Possible output:

Tôi đã từng xem bộ phim này với bạn.

Expected example:

友達とこの映画を見たことがあります。

---

## 5. Difficulty Control

AI-generated content should respect the learner's level.

If the learner is N5:

- prefer N5 vocabulary
- prefer N5 grammar
- keep sentences relatively short

If target grammar is N4, supporting content should not unnecessarily introduce N2/N1 structures.

Avoid difficulty jumps unless explicitly requested.

---

## 6. Known Knowledge Preference

When possible, exercises should reuse vocabulary and grammar the learner has already studied.

Prioritize:

1. target knowledge currently being practiced
2. learned knowledge
3. simple supporting vocabulary

Avoid introducing many unknown words in one exercise.

---

## 7. Target Knowledge

Each generated exercise should know what it is testing.

Example:

targetVocabularyIds:
[12, 18]

targetGrammarIds:
[5]

This allows the system to:

- evaluate performance
- track weak knowledge
- generate future exercises
- build statistics

Do not generate exercises that cannot be linked back to learning targets when target-based practice is requested.

---

## 8. Structured AI Output

Prefer structured JSON responses.

Do not rely on parsing arbitrary prose if structured output is available.

Example generation response:

{
  "sentenceVi": "Tôi đã từng xem bộ phim này với bạn.",
  "exampleAnswerJa": "友達とこの映画を見たことがあります。",
  "targetVocabulary": ["映画", "見る", "友達"],
  "targetGrammar": ["～たことがある"],
  "difficulty": "N4"
}

Validate AI responses before storing or using them.

---

## 9. Answer Evaluation

Do not evaluate Japanese answers using exact string matching alone.

Japanese can express the same meaning in multiple valid ways.

Evaluate:

- semantic meaning
- grammatical correctness
- target grammar usage
- target vocabulary usage
- naturalness
- politeness/style when relevant

---

## 10. Evaluation Result

Prefer structured output.

Example:

{
  "correct": true,
  "score": 90,
  "meaningScore": 95,
  "grammarScore": 90,
  "naturalnessScore": 85,
  "grammarErrors": [],
  "vocabularyErrors": [],
  "suggestedAnswer": "友達とこの映画を見たことがあります。",
  "explanationVi": "Câu của bạn đúng và sử dụng đúng mẫu ～たことがある."
}

Scores should support learning feedback, not pretend to be mathematically exact.

---

## 11. Multiple Correct Answers

Never assume the generated example answer is the only correct answer.

For example:

来週、京都に行く予定です。

and another natural sentence with the same intended meaning may both be acceptable.

Judge meaning and Japanese correctness, not literal equality.

---

## 12. Error Explanation

When the learner makes a mistake, explain:

1. what is wrong
2. why it is wrong
3. how to correct it

Primary explanation language:

Vietnamese.

Keep explanations appropriate to the learner's level.

Do not produce unnecessarily academic explanations for beginner mistakes.

---

## 13. Furigana

When the learner requests reading help, the system may provide readings/furigana.

Do not clutter every Japanese sentence with furigana unless the selected learning mode requires it.

---

## 14. Kaiwa

Initial Kaiwa should be text-based.

Flow:

AI Japanese message
       |
Learner response
       |
AI response
       |
Optional correction

Kaiwa should adapt to selected JLPT level.

---

## 15. Kaiwa Difficulty

For lower levels:

- shorter sentences
- common vocabulary
- simple grammar
- clear questions

For higher levels:

- more natural expressions
- longer responses
- broader vocabulary
- more complex grammar

Do not intentionally use vocabulary far beyond the configured level unless needed.

---

## 16. Kaiwa Learning Context

When appropriate, Kaiwa should reuse recently learned or weak vocabulary/grammar.

Example:

Weak grammar:
～たことがある

Known vocabulary:
旅行
日本
京都

AI can naturally ask:

京都へ行ったことがありますか。

Do not force target grammar into every message unnaturally.

---

## 17. Kaiwa Correction

Correction modes may later include:

- immediate
- after each response
- after conversation
- minimal correction
- detailed correction

Architecture should allow these modes.

Do not make correction behavior impossible to configure later.

---

## 18. AI Failure

AI calls can fail.

Handle:

- timeout
- rate limit
- invalid response
- provider unavailable
- Internet unavailable
- authentication errors

AI failure must not corrupt learning data.

Do not store incomplete AI responses as valid exercises.

---

## 19. AI Caching

Avoid regenerating identical AI content unnecessarily.

Generated exercises may be stored locally when useful.

However, do not reuse exercises so frequently that practice becomes predictable.

---

## 20. Privacy

Send only information needed for the AI task.

Do not send the entire local database to an AI provider.

Prefer sending selected:

- vocabulary
- grammar
- learner level
- current exercise
- necessary conversation context

---

## 21. Prompt Management

Do not scatter large prompts throughout service classes.

Centralize or organize prompts.

Prompt templates should be versionable and testable.

Separate prompts for:

- generation
- evaluation
- explanation
- Kaiwa

---

## 22. Core Principle

AI should behave like a Japanese learning assistant using the learner's actual learning data.

It should not behave like an unrelated general chatbot.

Every AI feature should answer:

"What learning objective does this feature support?"