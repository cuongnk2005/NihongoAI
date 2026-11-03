-- ============================================================================
-- V4__grammar_srs.sql
-- Grammar Spaced Repetition (GrammarReviewState, GrammarReviewLog)
-- ============================================================================

CREATE TABLE IF NOT EXISTS grammar_review_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grammar_id INTEGER NOT NULL UNIQUE REFERENCES grammar(id) ON DELETE CASCADE,
    stability REAL NOT NULL DEFAULT 0.0,
    difficulty REAL NOT NULL DEFAULT 5.0,
    reps INTEGER NOT NULL DEFAULT 0,
    lapses INTEGER NOT NULL DEFAULT 0,
    state TEXT NOT NULL DEFAULT 'NEW',
    due TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_review TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grammar_review_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grammar_id INTEGER NOT NULL REFERENCES grammar(id) ON DELETE CASCADE,
    rating TEXT NOT NULL,
    stability_before REAL NOT NULL DEFAULT 0.0,
    difficulty_before REAL NOT NULL DEFAULT 5.0,
    elapsed_days INTEGER NOT NULL DEFAULT 0,
    scheduled_days INTEGER NOT NULL DEFAULT 0,
    review_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_grammar_review_state_grammar_id ON grammar_review_state(grammar_id);
CREATE INDEX IF NOT EXISTS idx_grammar_review_state_due ON grammar_review_state(due, state);
CREATE INDEX IF NOT EXISTS idx_grammar_review_log_grammar_id ON grammar_review_log(grammar_id);

