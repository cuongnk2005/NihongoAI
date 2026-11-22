-- ============================================================================
-- V5__seed_essential_vocabulary.sql
-- Seed essential JLPT N5/N4 vocabulary pool for PvP and AI Practice
-- ============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS uidx_vocabulary_word_reading ON vocabulary(word, reading);

INSERT OR IGNORE INTO vocabulary (word, reading, meaning_vi, part_of_speech, jlpt_level, example_ja, example_vi) VALUES
-- N5 Verbs & Daily Words
('飲む', 'のむ', 'uống', 'Động từ nhóm 1', 'N5', '毎日水をたくさん飲みます。', 'Mỗi ngày tôi uống nhiều nước.'),
('聞く', 'きく', 'nghe, hỏi', 'Động từ nhóm 1', 'N5', '毎晩日本の音楽を聞きます。', 'Mỗi tối tôi đều nghe nhạc Nhật Bản.'),
('読む', 'よむ', 'đọc', 'Động từ nhóm 1', 'N5', '図書館で日本語の本を読みます。', 'Tôi đọc sách tiếng Nhật ở thư viện.'),
('書く', 'かく', 'viết', 'Động từ nhóm 1', 'N5', '先生に手紙を書きました。', 'Tôi đã viết thư cho thầy giáo.'),
('話す', 'はなす', 'nói chuyện', 'Động từ nhóm 1', 'N5', '日本語で話しましょう。', 'Hãy cùng nói chuyện bằng tiếng Nhật.'),
('行く', 'いく', 'đi', 'Động từ nhóm 1', 'N5', '来週京都へ行きます。', 'Tuần sau tôi sẽ đi Kyoto.'),
('来る', 'くる', 'đến', 'Động từ nhóm 3', 'N5', '明日友達が家に来ます。', 'Ngày mai bạn tôi sẽ đến nhà.'),
('帰る', 'かえる', 'trở về, về nhà', 'Động từ nhóm 1', 'N5', '午後六時にうちへ帰ります。', 'Tôi về nhà lúc 6 giờ chiều.'),
('買う', 'かう', 'mua', 'Động từ nhóm 1', 'N5', 'スーパーで野菜を買いました。', 'Tôi đã mua rau ở siêu thị.'),
('勉強', 'べんきょう', 'học tập', 'Danh từ', 'N5', '毎日日本語を勉強します。', 'Mỗi ngày tôi đều học tiếng Nhật.'),
-- N5 Nouns & Transport
('先生', 'せんせい', 'giáo viên, thầy cô', 'Danh từ', 'N5', '日本語の先生はとても優しいです。', 'Giáo viên tiếng Nhật rất hiền.'),
('学生', 'がくせい', 'học sinh, sinh viên', 'Danh từ', 'N5', '私は大学の学生です。', 'Tôi là sinh viên đại học.'),
('会社', 'かいしゃ', 'công ty', 'Danh từ', 'N5', '八時に会社へ行きます。', 'Tôi đi đến công ty lúc 8 giờ.'),
('病院', 'びょういん', 'bệnh viện', 'Danh từ', 'N5', '病院へ行って薬をもらいました。', 'Tôi đã đến bệnh viện và lấy thuốc.'),
('家族', 'かぞく', 'gia đình', 'Danh từ', 'N5', '私の家族は四人です。', 'Gia đình tôi có bốn người.'),
('電車', 'でんしゃ', 'tàu điện', 'Danh từ', 'N5', '電車で学校へ通っています。', 'Tôi đi học bằng tàu điện.'),
('車', 'くるま', 'xe hơi, ô tô', 'Danh từ', 'N5', '父は新しい車を買いました。', 'Bố tôi đã mua một chiếc xe hơi mới.'),
('映画', 'えいが', 'phim ảnh, bộ phim', 'Danh từ', 'N5', '週末に映画を見に行きます。', 'Cuối tuần tôi đi xem phim.'),
('音楽', 'おんがく', 'âm nhạc', 'Danh từ', 'N5', '音楽を聴くのが好きです。', 'Tôi thích nghe âm nhạc.'),
('時間', 'じかん', 'thời gian, giờ giấc', 'Danh từ', 'N5', '勉強する時間があまりありません。', 'Tôi không có nhiều thời gian để học.'),
('天気', 'てんき', 'thời tiết', 'Danh từ', 'N5', '今日の天気はとてもいいですね。', 'Thời tiết hôm nay thật đẹp nhỉ.'),
('雨', 'あめ', 'mưa', 'Danh từ', 'N5', '午後から雨が降るそうです。', 'Nghe nói từ chiều trời sẽ mưa.'),
-- N5 Adjectives
('新しい', 'あたらしい', 'mới', 'Tính từ đuôi い', 'N5', '新しい靴を買いました。', 'Tôi đã mua một đôi giày mới.'),
('古い', 'ふるい', 'cũ', 'Tính từ đuôi い', 'N5', 'この時計はとても古いです。', 'Chiếc đồng hồ này rất cũ.'),
('大きい', 'おおきい', 'to, lớn', 'Tính từ đuôi い', 'N5', '公園に大きい木があります。', 'Trong công viên có một cái cây to.'),
('小さい', 'ちいさい', 'nhỏ, bé', 'Tính từ đuôi い', 'N5', 'このカバンは少し小さいです。', 'Chiếc túi này hơi nhỏ một chút.'),
('高い', 'たかい', 'cao, đắt', 'Tính từ đuôi い', 'N5', 'この料理はとても美味しいですが高いです。', 'Món này rất ngon nhưng đắt.'),
-- N4 Vocabulary
('案内', 'あんない', 'hướng dẫn, chỉ dẫn', 'Danh từ', 'N4', '京都の町を案内してもらいました。', 'Tôi đã được hướng dẫn tham quan phố Kyoto.'),
('連絡', 'れんらく', 'liên lạc', 'Danh từ', 'N4', '後で電話で連絡します。', 'Lát nữa tôi sẽ liên lạc qua điện thoại.'),
('準備', 'じゅんび', 'chuẩn bị', 'Danh từ', 'N4', '旅行の準備はもう終わりました。', 'Việc chuẩn bị cho chuyến du lịch đã xong rồi.'),
('予定', 'よてい', 'dự định, kế hoạch', 'Danh từ', 'N4', '明日の予定を教えてください。', 'Hãy cho tôi biết dự định ngày mai nhé.'),
('経験', 'けいけん', 'kinh nghiệm', 'Danh từ', 'N4', '日本でいろいろな経験をしました。', 'Tôi đã có nhiều kinh nghiệm phong phú ở Nhật Bản.'),
('習慣', 'しゅうかん', 'thói quen, tập quán', 'Danh từ', 'N4', '早起きの習慣をつけたいです。', 'Tôi muốn tạo thói quen dậy sớm.'),
('世話', 'せわ', 'chăm sóc, giúp đỡ', 'Danh từ', 'N4', '先生には大変お世話になりました。', 'Tôi đã được thầy cô giúp đỡ rất nhiều.'),
('説明', 'せつめい', 'giải thích, thuyết minh', 'Danh từ', 'N4', '使い方の説明をよく読みました。', 'Tôi đã đọc kỹ phần giải thích cách sử dụng.'),
('複雑', 'ふくざつ', 'phức tạp', 'Tính từ đuôi な', 'N4', 'この文法は少し複雑です。', 'Ngữ pháp này hơi phức tạp một chút.'),
('簡単', 'かんたん', 'đơn giản, dễ dàng', 'Tính từ đuôi な', 'N4', 'この問題はとても簡単です。', 'Câu hỏi này rất đơn giản.'),
('親切', 'しんせつ', 'tốt bụng, thân thiện', 'Tính từ đuôi な', 'N4', '駅の人は親切に教えてくれました。', 'Nhân viên ở nhà ga đã chỉ dẫn rất nhiệt tình.'),
('丁寧', 'ていねい', 'lịch sự, cẩn thận', 'Tính từ đuôi な', 'N4', '手紙は丁寧に書きましょう。', 'Hãy viết thư một cách cẩn thận và lịch sự.');
