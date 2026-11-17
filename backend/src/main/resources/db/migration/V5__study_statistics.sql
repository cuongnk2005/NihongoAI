ALTER TABLE review_log ADD COLUMN duration_ms INTEGER;
ALTER TABLE grammar_review_log ADD COLUMN duration_ms INTEGER;
CREATE TABLE study_activity (
    id TEXT PRIMARY KEY,
    card_key TEXT NOT NULL,
    rating TEXT NOT NULL CHECK(rating IN ('AGAIN','HARD','GOOD','EASY')),
    duration_ms INTEGER NOT NULL CHECK(duration_ms >= 0),
    review_time TEXT NOT NULL
);
CREATE INDEX idx_study_activity_time ON study_activity(review_time);
CREATE INDEX idx_review_log_time ON review_log(review_time);
CREATE INDEX idx_grammar_review_log_time ON grammar_review_log(review_time);
