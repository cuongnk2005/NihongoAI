---
trigger: always_on
---

# Anki Compatibility and Flashcard Rules

## 1. Goal

The application is inspired by Anki and should support familiar flashcard concepts.

Important concepts:

- Deck
- Note
- Card
- Fields
- Tags
- Review
- Scheduling

Do not model the entire system as simple question/answer rows.

---

## 2. Deck

A Deck organizes learning material.

Basic fields:

id
name
description
createdAt
updatedAt

A deck contains learning cards indirectly through notes/cards.

Deck deletion must not accidentally destroy unrelated knowledge or history.

---

## 3. Note

A Note represents source learning information.

Example vocabulary note:

Expression:
食べる

Reading:
たべる

Meaning:
ăn

Example:
毎日野菜を食べます。

A Note may generate multiple Cards.

---

## 4. Card

A Card represents one review direction.

From:

食べる
たべる
ăn

Possible Card A:

Front:
食べる

Back:
ăn

Possible Card B:

Front:
ăn

Back:
食べる

Do not create duplicate Notes just to support reverse review.

---

## 5. Knowledge Link

Notes/cards may reference structured knowledge such as:

Vocabulary
Grammar

Do not duplicate all Vocabulary/Grammar data into Card text when a relationship can represent it.

However, preserve imported Anki fields where necessary for compatibility.

---

## 6. Scheduling Separation

Card content and scheduling state are separate concerns.

Conceptually:

Card
 |
 +-- content/template information
 |
 +-- ReviewState

Review history should be stored separately.

Do not overwrite historical reviews when updating scheduling.

---

## 7. Import/Export Development Order

Implement compatibility in stages.

Stage 1:
- CSV import
- CSV export

Stage 2:
- TSV import
- TSV export

Stage 3:
- advanced field mapping
- tags
- duplicate handling

Stage 4:
- APKG investigation
- APKG import
- APKG export

Do not attempt full APKG compatibility before CSV/TSV is stable.

---

## 8. CSV Import

CSV import must support field mapping.

Example imported columns:

Japanese
Reading
Vietnamese
Example
Tags

The user should be able to map:

Column 1 -> Expression
Column 2 -> Reading
Column 3 -> Meaning
Column 4 -> Example
Column 5 -> Tags

Do not assume every CSV has the same column order.

---

## 9. CSV Encoding

Japanese and Vietnamese text must be preserved correctly.

Prefer UTF-8.

Handle UTF-8 BOM when necessary.

Do not corrupt:

- Kanji
- Hiragana
- Katakana
- Vietnamese diacritics

---

## 10. CSV Delimiters

Import should eventually support common delimiters:

- comma
- tab
- semicolon when needed

Avoid naive string splitting.

Use a proper CSV parser because fields may contain:

- commas
- quotes
- line breaks

---

## 11. Import Preview

Before committing a large import, provide a preview when practical.

Show examples of parsed rows.

Allow the user to confirm field mappings.

Do not insert thousands of malformed notes before the user can detect a wrong mapping.

---

## 12. Import Validation

Validate:

- required fields
- malformed rows
- encoding
- mapping
- duplicate behavior

Provide useful error reporting.

Prefer reporting:

row number
problem
possible reason

Do not fail silently.

---

## 13. Duplicate Handling

Design import to support policies such as:

- allow duplicates
- skip duplicates
- update existing
- ask user

Do not choose destructive update behavior implicitly.

---

## 14. Import Transaction

Large imports should use appropriate transactions.

If an import fails catastrophically, avoid leaving the database in an unpredictable half-imported state.

For recoverable row errors, architecture may later support partial import with an error report.

---

## 15. Export

Export should preserve selected information consistently.

Allow exporting appropriate fields such as:

- Japanese
- Reading
- Meaning
- Example
- Tags

Export must preserve Unicode.

---

## 16. Round Trip

When practical, test:

Export
  |
Import exported file
  |
Equivalent learning data

Round-trip testing is important for compatibility.

---

## 17. Existing User Format

The architecture should support vocabulary study formats such as:

Column 1:
Hiragana/reading and optionally multiple-choice Kanji candidates

Column 2:
Correct Kanji

Column 3:
Vietnamese meaning and Sino-Vietnamese meaning when applicable

Column 4:
Japanese example sentence and Vietnamese translation

Do not hard-code this as the only possible note format.

Treat it as one supported note/import format.

---

## 18. APKG

APKG support is an advanced feature.

Before implementation:

- research the current Anki package format
- understand collection database structure
- understand note/card relationships
- understand media handling
- understand scheduling compatibility

Do not guess APKG internals.

Do not claim compatibility until tested with actual Anki imports/exports.

---

## 19. Media

Future Anki imports may contain:

- images
- audio
- other media

Design import/export boundaries so media support can be added later.

Do not implement media prematurely if the current milestone is text-only CSV.

---

## 20. HTML Fields

Anki fields may contain HTML.

Do not blindly display imported HTML without considering sanitization.

Preserve content where compatibility requires it while keeping rendering safe.

---

## 21. Tags

Support multiple tags per Note where appropriate.

Tags may represent:

- JLPT level
- textbook
- lesson
- topic
- custom categories

Do not encode all tags as unrelated boolean database columns.

---

## 22. Review Compatibility

Our internal scheduler may use FSRS.

Do not assume imported Anki scheduling information can always be mapped perfectly.

Keep import of content and import of scheduling state conceptually separate.

When compatibility is uncertain, preserve data rather than silently transforming it incorrectly.

---

## 23. Tests

Import/export code requires strong tests.

Test:

- Japanese text
- Vietnamese text
- quotes
- commas
- tabs
- empty fields
- long fields
- duplicate entries
- malformed rows
- BOM
- line breaks inside fields

Use real representative test files when possible.

---

## 24. Core Principle

Anki compatibility is important, but internal architecture should remain clean.

Do not copy Anki internals blindly.

Preserve concepts necessary for compatibility while designing our application around Japanese learning.