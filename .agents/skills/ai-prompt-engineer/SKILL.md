---
name: ai-prompt-engineer
description: >-
  Standardizes AI prompt templates, provider abstractions, and structured response parsing
  for Japanese learning. Use when generating Vietnamese-to-Japanese exercises, evaluating
  learner answers, generating Vietnamese explanations, or handling Kaiwa conversations.
---

# AI Prompt Engineering & Evaluation Skill

## 1. Core Architectural Constraints

1. **Backend Exclusivity:** All external AI provider calls (Gemini, OpenAI, DeepSeek, Anthropic) must execute inside Spring Boot. Never call AI APIs directly from React or expose API keys.
2. **Provider Abstraction:**
   ```
   PracticeService / KaiwaService
               |
               v
           AiProvider  (Interface)
               |
      +--------+--------+
      |                 |
   GeminiProvider   OpenAiProvider
   ```
3. **Structured Outputs (Strict JSON):** AI responses must be requested as structured JSON and parsed into strongly-typed Java DTOs. Never parse arbitrary prose for core features.
4. **Resilience & Fallback:** AI calls must have timeouts (e.g. 10-15s). If an AI request fails, return a graceful error message without corrupting offline learning workflows.

---

## 2. Exercise Generation (Vietnamese $\rightarrow$ Japanese)

### Context Payload
Always supply explicit structured context rather than open-ended queries:
```json
{
  "learnerLevel": "N4",
  "targetVocabulary": ["映画", "見る", "友達"],
  "targetGrammar": ["～たことがある"],
  "knownVocabulary": ["昨日", "行く", "日本"],
  "task": "generate_translation_exercise"
}
```

### System & Task Prompt Standard
- **System Role:** Expert Japanese teacher creating targeted exercises for Vietnamese native speakers.
- **Rules:**
  - Create 1 natural Vietnamese sentence that encourages the learner to use the target vocabulary and grammar.
  - Respect the learner's JLPT level (do not introduce N2/N1 grammar into an N4 exercise).
  - Output strictly valid JSON matching the schema below.

### Expected JSON Output Schema
```json
{
  "sentenceVi": "Tôi đã từng xem bộ phim này với bạn.",
  "exampleAnswerJa": "友達とこの映画を見たことがあります。",
  "targetVocabulary": ["映画", "見る", "友達"],
  "targetGrammar": ["～たことがある"],
  "difficulty": "N4",
  "hints": ["映画 (phim)", "見る (xem)"]
}
```

---

## 3. Japanese Answer Evaluation

### Critical Evaluation Rule: No Exact String Matching
Japanese allows multiple grammatically correct and natural variations for a single idea (word order, particle omission, synonyms, politeness levels).
Evaluate:
1. **Semantic Meaning** (Does it preserve the original Vietnamese intent?)
2. **Grammatical Correctness** (Are particles and verb conjugations correct?)
3. **Target Knowledge Usage** (Did the learner correctly use the targeted vocabulary and grammar pattern?)
4. **Naturalness** (Is it natural modern Japanese?)

### Evaluation Input Context
```json
{
  "promptVi": "Tôi đã từng xem bộ phim này với bạn.",
  "expectedPattern": "～たことがある",
  "targetVocabulary": ["映画", "見る", "友達"],
  "userAnswerJa": "友達とこの映画を見ましたことがある。"
}
```

### Evaluation Output Schema
```json
{
  "correct": false,
  "score": 65,
  "meaningScore": 90,
  "grammarScore": 50,
  "naturalnessScore": 60,
  "grammarErrors": [
    {
      "offendingText": "見ましたことがある",
      "issue": "Chia sai thể động từ trước mẫu ～たことがある",
      "correction": "見たことがある",
      "explanationVi": "Mẫu câu biểu thị kinh nghiệm '～たことがある' bắt buộc phải kết hợp với động từ ở thể Ta (thể quá khứ ngắn), không đi với thể Masu (見ました)."
    }
  ],
  "vocabularyErrors": [],
  "suggestedAnswer": "友達とこの映画を見たことがあります。",
  "explanationVi": "Bạn đã nắm được ý nghĩa câu, nhưng cần lưu ý cấu trúc Vた + ことがある: '見る' chia sang thể Ta là '見た'."
}
```

---

## 4. Text Kaiwa (Conversation) Guidelines

- **Progression:**
  1. AI sends conversational Japanese message tailored to user's JLPT level.
  2. Learner types response in Japanese.
  3. AI generates next response + optional subtle correction feedback.
- **Constraints:**
  - Lower levels (N5/N4): Short sentences, common polite forms (`です/ます`), clear direct questions.
  - Higher levels (N3+): Varied vocabulary, casual/polite shifts as appropriate to the scenario.
  - Reuse learner's weak/learned vocabulary naturally without forcing it awkwardly.

---

## 5. Verification Checklist

- [ ] Is prompt construction separated into dedicated template classes/files rather than concatenated in controller strings?
- [ ] Is temperature tuned appropriately (e.g. 0.2–0.4 for evaluation; 0.7 for creative exercise generation/kaiwa)?
- [ ] Are JSON responses validated with Jackson before passing to service logic?
- [ ] Does the UI render Vietnamese explanations with clear formatting (markdown / bullet points)?
- [ ] Are timeouts and retry limits configured on the HTTP client?
