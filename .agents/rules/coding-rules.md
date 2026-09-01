---
trigger: always_on
---

# Coding, Testing and Bug-Fixing Rules

## 1. General Behavior

Before writing code:

1. Inspect relevant files.
2. Understand the current implementation.
3. Search for existing reusable code.
4. Identify dependencies.
5. Determine the correct architectural layer.

Do not immediately create new files without checking whether equivalent functionality already exists.

---

## 2. Scope Control

Only change what is necessary for the requested task.

Do not:

- refactor unrelated modules
- rename unrelated files
- change formatting across the entire project
- replace libraries unnecessarily
- redesign working architecture during a small task

Keep changes focused.

---

## 3. Large Features

For substantial features:

1. inspect architecture
2. identify affected frontend/backend/database layers
3. create a short implementation plan
4. implement incrementally
5. verify each layer

Do not attempt a large feature through one uncontrolled rewrite.

---

## 4. Code Quality

Prefer:

- clear names
- small focused methods
- explicit types
- separation of concerns
- reusable logic where appropriate

Avoid:

- giant classes
- giant React components
- deeply nested logic
- duplicated code
- unexplained magic numbers
- unnecessary abstractions

Do not create abstractions merely for the sake of abstraction.

---

## 5. Comments

Comments should explain WHY when the reason is not obvious.

Avoid comments that merely repeat code.

Bad:

// increment count
count++;

Useful:

// Preserve the original review timestamp because FSRS recalculation
// must not modify historical review data.

Keep comments current when code changes.

---

## 6. TODOs

Do not leave placeholder TODO implementations and claim the feature is complete.

If a requested part cannot be implemented:

- explain why
- clearly identify what remains

Do not silently return fake/mock data in production code.

---

## 7. Compilation

Before declaring implementation complete, check when possible:

Backend:
- compilation
- tests

Frontend:
- TypeScript errors
- build
- tests

Tauri:
- relevant build/configuration errors

Do not knowingly leave obvious compilation errors.

---

## 8. API Consistency

Whenever changing an API:

Check:

- backend endpoint
- request DTO
- response DTO
- frontend type
- frontend API service
- UI consumer

Do not update only one side of the API contract.

---

## 9. Database Changes

When changing persistent models:

1. inspect existing schema
2. update entity/model
3. create Flyway migration
4. update DTO/mapping if needed
5. update tests

Do not rely on automatic schema mutation as a replacement for proper migrations.

Protect existing user learning data.

---

## 10. Bug Fixing

When fixing a bug:

1. reproduce or understand the failure
2. identify root cause
3. inspect related code paths
4. make the smallest reliable fix
5. test the affected behavior
6. check for regression

Do not patch only the visible symptom when the underlying cause is clear.

---

## 11. Regression

After fixing a bug, consider:

"What existing behavior could this change break?"

Check related functionality.

Example:

If changing CSV parsing, also consider:

- Japanese text
- Vietnamese text
- quotes
- delimiters
- empty fields

---

## 12. Testing Priorities

Prioritize tests for logic where mistakes could damage learning behavior or user data.

High priority:

- FSRS scheduling
- review state
- review history
- CSV/TSV import
- export
- database migrations
- practice generation rules
- AI response parsing

Medium priority:

- service CRUD behavior
- API validation
- frontend learning flows

Do not spend excessive effort testing trivial implementation details.

---

## 13. Deterministic Logic

If a feature can be implemented reliably without AI, prefer deterministic code.

Examples:

- database queries
- scheduling
- validation
- CSV parsing
- date calculations
- filtering
- sorting

Do not ask AI providers to perform normal application logic.

---

## 14. External Libraries

Before adding a dependency:

1. determine whether existing dependencies already solve the problem
2. ensure the dependency is actively maintained
3. verify it is appropriate for the project

Do not add large libraries for trivial functionality.

---

## 15. Security

Never commit:

- API keys
- passwords
- tokens
- private secrets

Never expose backend secrets to React.

Do not print secrets in logs.

---

## 16. File Handling

Validate imported files.

Do not assume:

- correct extension
- correct encoding
- valid content
- safe size

Handle failures gracefully.

---

## 17. User Data

Learning history is valuable user data.

Be conservative with:

- deletion
- migrations
- imports
- bulk updates
- scheduler changes

Do not silently delete review history.

For destructive operations, require appropriate confirmation at the UI level.

---

## 18. Error Messages

Technical logs may contain technical details.

User-facing errors should be understandable.

Bad:

SQLException: constraint failed...

Better:

Không thể lưu từ vựng. Vui lòng thử lại.

Do not expose stack traces directly to users.

---

## 19. Git-Friendly Changes

Keep commits/changes conceptually focused.

Avoid unnecessary generated file changes.

Do not modify lockfiles unless dependency changes require it.

Do not commit:

- build output
- IDE temporary files
- local databases
- secrets

Ensure .gitignore covers local/generated files.

---

## 20. Refactoring

Refactor when:

- duplication is causing maintenance problems
- code is blocking a new feature
- responsibility is clearly misplaced
- tests make the change safe

Do not perform large refactors during unrelated bug fixes unless necessary.

---

## 21. Naming

Use consistent English names in source code.

Examples:

VocabularyService
GrammarService
PracticeService
ReviewService

Avoid mixing Vietnamese variable names into source code.

Vietnamese is appropriate for:

- UI text
- learning explanations
- translations

Code identifiers should generally remain English.

---

## 22. Japanese Data

Never assume Japanese text behaves exactly like ASCII.

Be careful with:

- Unicode
- normalization
- whitespace
- punctuation
- Kana
- Kanji

Do not destructively normalize original learning content unless required.

---

## 23. Definition of Done

A feature is complete only when relevant parts are finished.

Depending on the feature, this may include:

- database migration
- backend implementation
- API
- frontend integration
- validation
- error handling
- tests
- successful build

Do not say a feature is complete when only a controller or UI mock has been created.

---

## 24. Final Report

After implementing a meaningful task, provide a concise report:

Changed:
- files/modules changed

Implemented:
- behavior added

Verified:
- tests/builds performed

Remaining:
- known limitations, if any

Do not claim tests passed unless they were actually run successfully.

---

## 25. Most Important Rule

Do not optimize for producing the largest amount of code.

Optimize for:

- correctness
- maintainability
- simplicity
- preserving user data
- consistency with project architecture
- actual learning value