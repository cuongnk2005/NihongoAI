---
trigger: always_on
---

# Backend Rules

## 1. Technology

Backend uses:

- Java
- Spring Boot
- Maven
- SQLite
- Flyway

Spring Boot is the primary business logic layer.

Do not introduce another backend framework unless explicitly requested.

---

## 2. Architecture

Use layered architecture:

Controller
    |
    v
Service
    |
    v
Repository
    |
    v
Database

Recommended package structure:

src/main/java/.../

config/
controller/
dto/
entity/
repository/
service/
mapper/
exception/
ai/
anki/
srs/
practice/
util/

Responsibilities:

controller/
- REST endpoints
- request validation
- response handling

service/
- business logic
- orchestration

repository/
- database access

entity/
- persistence models

dto/
- API request/response models

mapper/
- DTO/entity conversion

exception/
- centralized error handling

ai/
- AI provider integration

anki/
- Anki import/export

srs/
- spaced repetition

practice/
- exercise generation and evaluation

---

## 3. Controller Rules

Controllers must be thin.

Controllers may:

- receive requests
- validate input
- call services
- return responses

Controllers must not contain:

- database queries
- FSRS calculations
- AI prompt construction
- import/export parsing
- complex business logic

Do not expose JPA entities directly through REST APIs.

Use DTOs.

---

## 4. Dependency Injection

Prefer constructor injection.

Good:

public VocabularyController(VocabularyService service) {
    this.service = service;
}

Avoid field injection:

@Autowired
private VocabularyService service;

---

## 5. Database

Use SQLite for local application data.

Use Flyway for schema migrations.

Never rely on manually modifying the user's database schema.

Each schema change should have a migration.

Example:

db/migration/

V1__initial_schema.sql
V2__add_vocabulary.sql
V3__add_grammar.sql

Be careful with destructive migrations because user learning history is valuable.

---

## 6. Core Entities

Expected domain entities include:

- Deck
- Note
- Card
- Vocabulary
- Grammar
- ReviewState
- ReviewLog
- PracticeQuestion
- PracticeHistory

Additional entities may be added when justified.

Do not combine all concepts into one Card entity.

---

## 7. Vocabulary Entity

Suggested fields:

id
word
reading
meaningVi
meaningEn
partOfSpeech
jlptLevel
notes
createdAt
updatedAt

Tags may use a dedicated relation when appropriate.

Design the model so additional dictionary information can be added later.

---

## 8. Grammar Entity

Suggested fields:

id
pattern
meaningVi
structure
explanation
jlptLevel
createdAt
updatedAt

Grammar examples should support multiple examples.

Do not store multiple examples as an arbitrary delimiter-separated string if a relational model is more appropriate.

---

## 9. Deck / Note / Card

Follow an Anki-like conceptual model:

Deck
  |
  +-- Note
        |
        +-- Card
        +-- Card

A Note represents source information.

A Card represents a review direction generated from that information.

Do not duplicate Notes merely to create reverse cards.

---

## 10. REST API

Use REST initially.

Examples:

GET    /api/decks
POST   /api/decks
GET    /api/decks/{id}
PUT    /api/decks/{id}
DELETE /api/decks/{id}

GET    /api/vocabularies
POST   /api/vocabularies
GET    /api/vocabularies/{id}
PUT    /api/vocabularies/{id}
DELETE /api/vocabularies/{id}

GET    /api/grammars
POST   /api/grammars
GET    /api/grammars/{id}
PUT    /api/grammars/{id}
DELETE /api/grammars/{id}

GET    /api/reviews/next
POST   /api/reviews/answer

POST   /api/practice/generate
POST   /api/practice/evaluate

Keep endpoint naming consistent.

---

## 11. API DTOs

Separate request and response models when appropriate.

Example:

CreateVocabularyRequest
UpdateVocabularyRequest
VocabularyResponse

Do not bind frontend API contracts directly to database implementation details.

---

## 12. Validation

Validate incoming data.

Examples:

- required vocabulary word
- valid JLPT level
- valid review rating
- valid deck ID
- valid grammar pattern

Use Bean Validation where appropriate.

Return useful validation messages.

---

## 13. Error Handling

Use centralized exception handling:

@RestControllerAdvice

Return consistent API errors.

Example:

{
  "code": "VOCABULARY_NOT_FOUND",
  "message": "Vocabulary does not exist",
  "timestamp": "..."
}

Do not expose stack traces to the frontend in production.

---

## 14. FSRS / SRS

Spaced repetition logic belongs in:

srs/

Do not implement scheduling logic inside controllers or React.

Prefer FSRS.

The scheduler must receive learning state and rating and calculate the next review.

Typical ratings:

Again
Hard
Good
Easy

Store enough review information to:

- calculate future scheduling
- show learning history
- build statistics
- adjust FSRS later

Never overwrite review history when scheduling the next review.

---

## 15. Review Transactions

Submitting a review may involve:

1. validating the card
2. reading current SRS state
3. calculating new SRS state
4. saving the new state
5. creating ReviewLog

These operations should be transactional when necessary.

Avoid states where scheduling updates but history fails to save.

---

## 16. AI Integration

All external AI calls must happen through the backend.

Never expose provider API keys to React.

AI implementation must follow ai-rules.md.

---

## 17. Security

Never hard-code:

- API keys
- passwords
- secrets

Do not commit secrets.

Use environment variables or secure local configuration.

Local backend should bind to loopback only unless another behavior is explicitly required.

---

## 18. Logging

Log useful technical information.

Do not log:

- API keys
- secrets
- full sensitive configuration

Avoid excessive logs for every simple database operation.

Errors should provide enough information for debugging.

---

## 19. Tests

Prioritize tests for:

- FSRS
- import/export
- practice selection
- critical services
- data transformations

Use unit tests for isolated business logic.

Use integration tests when database/API behavior needs verification.

---

## 20. Performance

Avoid premature optimization.

However:

- paginate large vocabulary lists
- paginate review history
- avoid N+1 database queries
- index frequently queried fields when justified

Correctness and maintainability are more important than micro-optimizations.