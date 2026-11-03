-- ============================================================================
-- V2__anki_core_and_srs.sql
-- Anki Core (Note, Card) and FSRS Spaced Repetition (ReviewState, ReviewLog)
-- ============================================================================

CREATE TABLE IF NOT EXISTS note (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deck_id INTEGER NOT NULL REFERENCES deck(id) ON DELETE CASCADE,
    fields_json TEXT,
    tags TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS card (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_id INTEGER NOT NULL REFERENCES note(id) ON DELETE CASCADE,
    deck_id INTEGER NOT NULL REFERENCES deck(id) ON DELETE CASCADE,
    card_type TEXT NOT NULL DEFAULT 'FORWARD',
    front_content TEXT NOT NULL,
    back_content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS review_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id INTEGER NOT NULL UNIQUE REFERENCES card(id) ON DELETE CASCADE,
    stability REAL NOT NULL DEFAULT 0.0,
    difficulty REAL NOT NULL DEFAULT 5.0,
    reps INTEGER NOT NULL DEFAULT 0,
    lapses INTEGER NOT NULL DEFAULT 0,
    state TEXT NOT NULL DEFAULT 'NEW',
    due TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_review TIMESTAMP
);

CREATE TABLE IF NOT EXISTS review_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id INTEGER NOT NULL REFERENCES card(id) ON DELETE CASCADE,
    rating TEXT NOT NULL,
    stability_before REAL NOT NULL DEFAULT 0.0,
    difficulty_before REAL NOT NULL DEFAULT 5.0,
    elapsed_days INTEGER NOT NULL DEFAULT 0,
    scheduled_days INTEGER NOT NULL DEFAULT 0,
    review_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- High Performance Indexes
CREATE INDEX IF NOT EXISTS idx_note_deck_id ON note(deck_id);
CREATE INDEX IF NOT EXISTS idx_card_deck_id ON card(deck_id);
CREATE INDEX IF NOT EXISTS idx_card_note_id ON card(note_id);
CREATE INDEX IF NOT EXISTS idx_review_state_card_id ON review_state(card_id);
CREATE INDEX IF NOT EXISTS idx_review_state_due ON review_state(due, state);
CREATE INDEX IF NOT EXISTS idx_review_log_card_id ON review_log(card_id);
