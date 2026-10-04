---
name: flyway-migration-guide
description: >-
  Best practices and checklist for managing SQLite database schema migrations using
  Flyway in Spring Boot. Use when adding or modifying tables, columns, indexes,
  or relationships without corrupting user learning history.
---

# Flyway SQLite Migration Skill

## 1. Migration File Standards

All migrations must reside in:
`backend/src/main/resources/db/migration/`

### File Naming Convention
`V{VERSION}__{DESCRIPTION}.sql`
- Note: Exactly **two underscores** (`__`) between version and description.
- Version is sequential integer: `V1`, `V2`, `V3`, etc.
- Description uses lowercase words separated by single underscores.
- Examples:
  - `V1__initial_schema.sql`
  - `V2__create_vocabulary_and_grammar.sql`
  - `V3__create_notes_and_cards.sql`
  - `V4__create_review_states_and_logs.sql`

---

## 2. SQLite Specific Migration Rules

SQLite differs significantly from traditional RDBMS engines:

1. **Foreign Key Enforcement:**
   - In SQLite, foreign keys are disabled by default unless explicitly enabled via JDBC connection string:
     `spring.datasource.url=jdbc:sqlite:nihongoai.db?foreign_keys=on`
2. **Column Modifications:**
   - Adding a column (`ALTER TABLE table ADD COLUMN ...`) is supported.
   - Dropping or modifying column constraints (e.g. changing `NULL` to `NOT NULL` or altering types) often requires table recreation in SQLite:
     ```sql
     -- 1. Create temporary new table
     CREATE TABLE note_new (...);
     -- 2. Copy data
     INSERT INTO note_new SELECT id, expression, ... FROM note;
     -- 3. Drop old table
     DROP TABLE note;
     -- 4. Rename new table
     ALTER TABLE note_new RENAME TO note;
     ```
3. **Data Safety (Zero Data Loss):**
   - User review history (`review_log`) and learning states (`review_state`) represent irreplaceable user effort.
   - Never write `DROP TABLE` or `TRUNCATE` migrations against user data tables in production migrations.

---

## 3. Standard Table Patterns

### Timestamps & IDs:
- Primary key: `INTEGER PRIMARY KEY AUTOINCREMENT`
- Timestamps: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`

### Indexing:
- Add indexes on columns used in high-frequency queries:
  - Cards due today: `CREATE INDEX idx_review_state_due ON review_state(due, state);`
  - Vocabulary lookup: `CREATE INDEX idx_vocabulary_word ON vocabulary(word);`
  - Card by deck: `CREATE INDEX idx_card_deck_id ON card(deck_id);`

---

## 4. Verification Checklist

- [ ] Does the migration file follow the `V{N}__{description}.sql` naming rule?
- [ ] Is the migration idempotent and tested against an existing local database?
- [ ] Are foreign key relations defined properly (`REFERENCES parent_table(id) ON DELETE CASCADE`)?
- [ ] Does the migration avoid destructive loss of existing learning cards or logs?
- [ ] Did the Spring Boot backend start up and apply the migration cleanly during `mvn test` or startup?
