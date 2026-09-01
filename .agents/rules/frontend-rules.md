---
trigger: always_on
---

# Frontend and Desktop Rules

## 1. Technology

Frontend uses:

- React
- TypeScript
- Vite

Desktop shell:

- Tauri 2

Do not replace React or Tauri without explicit instruction.

---

## 2. Responsibilities

React handles:

- UI
- navigation
- forms
- user interaction
- review screens
- practice screens
- Kaiwa UI
- statistics visualization
- settings

Spring Boot handles business logic.

Do not duplicate backend business rules in React.

---

## 3. Project Structure

Prefer feature-based organization:

src/

app/
components/
pages/
layouts/

features/
  decks/
  cards/
  vocabulary/
  grammar/
  review/
  practice/
  kaiwa/
  statistics/
  settings/

services/
stores/
hooks/
types/
utils/
assets/

Keep related feature code together.

---

## 4. TypeScript

Use TypeScript strictly.

Avoid `any`.

Define types for API data.

Example:

interface Vocabulary {
  id: number;
  word: string;
  reading: string;
  meaningVi: string;
  jlptLevel?: string;
}

Use shared types within the frontend where appropriate.

Do not duplicate nearly identical interfaces unnecessarily.

---

## 5. API Communication

Do not call backend APIs directly throughout random UI components.

Centralize communication in:

services/

or feature-specific API modules.

Example:

features/vocabulary/api.ts

Expose functions such as:

getVocabularies()
createVocabulary()
updateVocabulary()
deleteVocabulary()

UI components should not need to know backend URL construction details.

---

## 6. Backend URL

Do not hard-code:

http://localhost:8080

inside components.

Backend connection configuration must be centralized.

The application should support a dynamically assigned or configured local backend port.

---

## 7. Components

Keep components focused.

Avoid giant components containing:

- API communication
- business logic
- complex state
- large UI
- validation

all together.

Extract reusable:

- components
- hooks
- services
- utilities

when appropriate.

Do not over-componentize trivial markup.

---

## 8. State

Use local component state for local UI concerns.

Use shared/global state only when information genuinely needs to be shared.

Do not introduce a large state-management library without need.

Server/database state should not be duplicated unnecessarily in global frontend state.

---

## 9. Main Screens

Expected application areas:

Dashboard

Decks

Review

Vocabulary

Grammar

Practice

Kaiwa

Statistics

Settings

The navigation should make these areas easy to access.

---

## 10. Dashboard

Dashboard should eventually show useful learning information such as:

- cards due today
- new cards
- vocabulary progress
- grammar progress
- recent learning activity
- Practice shortcut
- Kaiwa shortcut

Prioritize useful information over decorative widgets.

---

## 11. Review UX

Flashcard review must be optimized for speed.

Support keyboard interaction when practical.

Typical review flow:

Question
   |
Show Answer
   |
Again / Hard / Good / Easy
   |
Next Card

Avoid unnecessary dialogs during normal review.

The learner should be able to complete many reviews quickly.

---

## 12. Japanese Typography

Japanese text is important content.

Ensure proper display of:

- Kanji
- Hiragana
- Katakana
- Japanese punctuation

Japanese answer inputs should be comfortable to use.

Do not use excessively small font sizes for Japanese learning content.

---

## 13. Practice UI

Vietnamese -> Japanese practice should clearly show:

- Vietnamese prompt
- Japanese answer input
- target grammar when appropriate
- target vocabulary when appropriate
- evaluation
- corrections
- explanation
- suggested answer

Do not reveal the expected Japanese answer before the learner submits unless they explicitly request it.

---

## 14. AI Loading State

AI calls may be slow.

Always provide appropriate:

- loading state
- error state
- retry behavior

Do not freeze the entire UI while waiting for AI.

If AI fails, normal application navigation must remain usable.

---

## 15. Kaiwa UI

Initial Kaiwa is text-based.

The UI should resemble a conversation.

Clearly distinguish:

- AI messages
- learner messages
- correction/explanation

Corrections should not overwhelm the conversation.

Later speech support should fit into the existing conversation model.

---

## 16. Forms

Forms should:

- validate required fields
- display useful errors
- preserve user input when a request fails where practical

Avoid resetting an entire form because of a temporary backend error.

---

## 17. Error Handling

Handle:

- backend unavailable
- validation errors
- database errors
- AI unavailable
- AI timeout
- invalid imports
- network unavailable

Show understandable messages to the learner.

Do not display raw Java stack traces.

---

## 18. Tauri Responsibilities

Use Tauri for desktop-specific functionality such as:

- application lifecycle
- local backend process
- native file dialogs
- native filesystem access when required
- packaging
- application updates later

Do not move ordinary React UI logic into Rust.

Do not move Spring Boot business logic into Rust without a strong reason.

---

## 19. Desktop UX

Design for desktop first.

Support:

- keyboard shortcuts
- resizable windows
- common desktop navigation patterns
- file selection dialogs
- efficient table/list management

Do not design the entire application as if it were only a mobile app.

---

## 20. Accessibility and Usability

Buttons should have clear labels.

Inputs should have labels.

Important actions should have visible states.

Destructive actions should require appropriate confirmation.

Do not sacrifice usability for animation or visual decoration.

---

## 21. Styling

Keep styling consistent throughout the application.

Prefer reusable design primitives for:

- buttons
- inputs
- dialogs
- cards
- tables
- badges
- navigation

Do not introduce multiple competing UI libraries.

---

## 22. Frontend Testing

Prioritize testing important flows:

- creating/editing vocabulary
- review flow
- practice submission
- import mapping
- error states

Avoid tests that only verify implementation details without user value.