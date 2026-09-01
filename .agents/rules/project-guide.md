---
trigger: always_on
---

# Japanese Learning Desktop App - Project Guide

## 1. AI Role

You are the primary software engineering agent for this project.

Your job is to help design, implement, debug, test, refactor, and maintain a desktop application for learning Japanese.

Always preserve the architecture and principles described in this rule.

Before changing code:

1. Inspect the existing project structure.
2. Read relevant existing files.
3. Understand the current implementation.
4. Reuse existing code when appropriate.
5. Do not modify unrelated functionality.
6. Do not introduce a new framework or major dependency without a clear reason.
7. For large changes, create a short implementation plan before coding.

---

## 2. Project Goal

Build a desktop application for Vietnamese learners of Japanese.

The application is inspired by Anki but extends traditional flashcards with structured Japanese learning and AI-assisted practice.

Core features:

- Deck management
- Notes and cards
- Flashcard review
- FSRS spaced repetition
- Vocabulary management
- Grammar management
- Vietnamese -> Japanese sentence practice
- AI-generated exercises
- AI answer evaluation
- AI explanations in Vietnamese
- AI Kaiwa
- Learning statistics
- Anki-compatible import/export

The application should support Japanese learners from beginner levels such as JLPT N5 and N4 and later support higher levels.

---

## 3. Technology Stack

Use this stack unless explicitly instructed otherwise.

Frontend:
- React
- TypeScript
- Vite

Desktop:
- Tauri 2

Backend:
- Java
- Spring Boot
- Maven

Database:
- SQLite

Database migrations:
- Flyway

AI:
- External AI providers through the Spring Boot backend

---

## 4. High-Level Architecture

Architecture:

React + TypeScript
        |
        | REST API
        v
Spring Boot
        |
        v
SQLite

Tauri is the desktop shell.

Conceptually:

Japanese Learning Desktop App
|
+-- Tauri
|   +-- React + TypeScript frontend
|
+-- Spring Boot local backend
    |
    +-- SQLite
    |
    +-- AI Provider APIs

Spring Boot should run locally with the desktop application.

The frontend communicates with the backend through localhost.

Do not expose the local backend to external networks unless explicitly required.

Do not move normal business logic into Rust.

Use Rust/Tauri only for desktop/native responsibilities when necessary.

---

## 5. Local-First Principle

The application is local-first.

These features must work without Internet:

- Deck management
- Notes
- Cards
- Vocabulary
- Grammar
- Flashcard review
- FSRS scheduling
- Review history
- Statistics
- CSV/TSV import
- CSV/TSV export
- Existing locally stored exercises

Internet should only be required for features that actually require remote AI or online services.

AI failure must never prevent the user from accessing normal learning features.

---

## 6. Core Domain Separation

Never treat all learning information as simple flashcards.

Keep these concepts separate.

### Knowledge

- Vocabulary
- Grammar

### Learning Material

- Deck
- Note
- Card
- PracticeQuestion

### Learning State

- ReviewState
- ReviewHistory
- PracticeHistory
- Statistics

This separation is important because AI practice must be able to select structured vocabulary and grammar.

---

## 7. Vocabulary

Vocabulary is structured knowledge.

Example:

word: 食べる
reading: たべる
meaningVi: ăn
partOfSpeech: verb
jlptLevel: N5

Do not store vocabulary as one unstructured text field.

Vocabulary may later contain:

- kanji information
- pitch accent
- frequency
- examples
- audio
- tags

---

## 8. Grammar

Grammar is structured knowledge.

Example:

pattern: ～たことがある
meaningVi: đã từng...
structure: Vた + ことがある
jlptLevel: N4

Grammar should support:

- pattern
- Vietnamese meaning
- structure
- explanation
- examples
- JLPT level
- tags

---

## 9. Core Practice Feature

Vietnamese -> Japanese sentence production is a core feature.

Example knowledge:

Vocabulary:
- 映画
- 見る
- 友達

Grammar:
- ～たことがある

The system may generate:

"Tôi đã từng xem bộ phim này với bạn."

The learner enters:

友達とこの映画を見たことがあります。

The system evaluates the answer.

Never rely only on exact string matching because multiple Japanese translations may be correct.

---

## 10. Development Priority

Implement approximately in this order:

Phase 1:
- Tauri
- React + TypeScript
- Spring Boot
- SQLite
- Flyway
- Frontend/backend communication

Phase 2:
- Vocabulary
- Grammar
- Deck
- Note
- Card

Phase 3:
- Review system
- FSRS
- Review history
- Daily review queue
- Statistics

Phase 4:
- CSV import/export
- TSV import/export
- Field mapping
- Tags

Phase 5:
- Vietnamese -> Japanese practice
- Practice history
- Rule-based exercises

Phase 6:
- AI provider abstraction
- AI sentence generation
- AI answer evaluation
- Vietnamese explanations

Phase 7:
- Text Kaiwa
- JLPT difficulty control

Phase 8:
- Speech-to-Text
- Text-to-Speech
- APKG import/export
- Advanced statistics

Do not attempt to build all phases simultaneously.

---

## 11. Future Features

The architecture should allow future support for:

- Cloud sync
- User accounts
- Web application
- Mobile application
- Multiple AI providers
- Japanese dictionary integration
- Audio
- OCR
- JLPT study plans
- Advanced learning analytics

Do not implement these prematurely.

Prioritize the current desktop application.

---

## 12. General Rule

When uncertain, choose the solution that preserves:

- desktop-first
- local-first
- structured Japanese knowledge
- maintainability
- offline learning
- separation of concerns
- replaceable AI providers
- Anki compatibility