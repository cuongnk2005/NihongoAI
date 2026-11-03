-- ============================================================================
-- V3__knowledge_and_practice.sql
-- Structured Knowledge (Vocabulary, Grammar) & System Settings & Seed Data
-- ============================================================================

CREATE TABLE IF NOT EXISTS vocabulary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT NOT NULL,
    reading TEXT NOT NULL,
    meaning_vi TEXT NOT NULL,
    meaning_en TEXT,
    part_of_speech TEXT,
    jlpt_level TEXT NOT NULL DEFAULT 'N5',
    example_ja TEXT,
    example_vi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grammar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern TEXT NOT NULL,
    meaning_vi TEXT NOT NULL,
    structure TEXT,
    explanation TEXT,
    jlpt_level TEXT NOT NULL DEFAULT 'N5',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grammar_example (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grammar_id INTEGER NOT NULL REFERENCES grammar(id) ON DELETE CASCADE,
    sentence_ja TEXT NOT NULL,
    sentence_vi TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS system_setting (
    setting_key TEXT PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vocabulary_word ON vocabulary(word);
CREATE INDEX IF NOT EXISTS idx_vocabulary_level ON vocabulary(jlpt_level);
CREATE INDEX IF NOT EXISTS idx_grammar_pattern ON grammar(pattern);
CREATE INDEX IF NOT EXISTS idx_grammar_level ON grammar(jlpt_level);

-- Initial System Settings
INSERT INTO system_setting (setting_key, setting_value) VALUES 
('ai.provider', 'gemini'),
('ai.gemini.model', 'gemini-1.5-flash'),
('learner.level', 'N4');

-- Initial JLPT Seed Knowledge
INSERT INTO vocabulary (word, reading, meaning_vi, part_of_speech, jlpt_level, example_ja, example_vi) VALUES
('食べる', 'たべる', 'ăn (dùng bữa)', 'Động từ nhóm 2', 'N5', '毎朝、パンを食べます。', 'Mỗi sáng tôi ăn bánh mì.'),
('見る', 'みる', 'xem, nhìn, ngắm', 'Động từ nhóm 2', 'N5', '昨日、友達と映画を見ました。', 'Hôm qua tôi đã xem phim với bạn.'),
('友達', 'ともだち', 'bạn bè, người bạn', 'Danh từ', 'N5', '友達と旅行に行きます。', 'Tôi đi du lịch cùng bạn bè.'),
('約束', 'やくそく', 'lời hứa, cuộc hẹn', 'Danh từ', 'N4', '明日、友達と約束があります。', 'Ngày mai tôi có hẹn với bạn.'),
('美しい', 'うつくしい', 'đẹp đẽ, tuyệt mỹ', 'Tính từ đuôi い', 'N3', '富士山は本当に美しいです。', 'Núi Phú Sĩ thực sự rất đẹp.');

INSERT INTO grammar (pattern, meaning_vi, structure, explanation, jlpt_level) VALUES
('～たことがある', 'Đã từng làm gì đó', 'V-た + ことがある', 'Dùng để diễn tả kinh nghiệm hoặc trải nghiệm trong quá khứ.', 'N4'),
('～つもりです', 'Dự định làm gì đó', 'V-plain + つもりです', 'Dùng để nói về ý định, kế hoạch của bản thân trong tương lai.', 'N4'),
('～ながら', 'Vừa làm A vừa làm B', 'V-masu (bỏ masu) + ながら', 'Hai hành động diễn ra đồng thời cùng một chủ ngữ.', 'N4');

-- Initial Demo Card Seed Linked to Default Deck (deck_id = 1)
INSERT INTO note (id, deck_id, fields_json, tags) VALUES (1, 1, '{"word":"食べる","reading":"たべる","meaningVi":"ăn"}', 'N5,Minna');
INSERT INTO card (id, note_id, deck_id, card_type, front_content, back_content) VALUES 
(1, 1, 1, 'FORWARD', '食べる', 'たべる • ăn\nVí dụ: 毎朝、パンを食べます。');
INSERT INTO review_state (card_id, stability, difficulty, reps, lapses, state, due) VALUES 
(1, 2.5, 4.8, 3, 0, 'REVIEW', CURRENT_TIMESTAMP);
