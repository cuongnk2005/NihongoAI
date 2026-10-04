/**
 * NihongoAI Prototype Mock Data
 * Realistic Japanese Learning Dataset (JLPT N5 / N4 / N3)
 */

const MOCK_DATA = {
  decks: [
    {
      id: "deck-1",
      name: "Minna no Nihongo (Bài 1 - 25)",
      description: "Từ vựng và mẫu câu sơ cấp nền tảng N5-N4",
      cardsCount: 44,
      isDefault: true
    },
    {
      id: "deck-2",
      name: "Kanji N4 Căn bản (150 chữ)",
      description: "Hán tự thường gặp trong kỳ thi JLPT N4",
      cardsCount: 18,
      isDefault: false
    },
    {
      id: "deck-3",
      name: "Mẫu câu Giao tiếp Hàng ngày",
      description: "Hội thoại ngắn, tình huống mua sắm, hỏi đường",
      cardsCount: 12,
      isDefault: false
    },
    {
      id: "deck-empty",
      name: "Bộ thẻ Mới tạo (Chưa có thẻ)",
      description: "Thử nghiệm trạng thái rỗng (Empty state)",
      cardsCount: 0,
      isDefault: false
    }
  ],

  cards: [
    {
      id: "c-101",
      deckId: "deck-1",
      status: "review", // new, learning, review, mastered
      word: "食べる",
      reading: "たべる • taberu",
      meaningVi: "ăn (dùng bữa, dùng cơm)",
      partOfSpeech: "Động từ nhóm 2",
      jlpt: "N5",
      exampleJa: "毎朝、パンと卵を食べます。",
      exampleVi: "Mỗi sáng tôi đều ăn bánh mì và trứng.",
      intervalDays: 4,
      reps: 6,
      lapses: 1
    },
    {
      id: "c-102",
      deckId: "deck-1",
      status: "review",
      word: "見る",
      reading: "みる • miru",
      meaningVi: "nhìn, xem, ngắm",
      partOfSpeech: "Động từ nhóm 2",
      jlpt: "N5",
      exampleJa: "昨日、友達と映画を見ました。",
      exampleVi: "Hôm qua tôi đã xem phim với bạn bè.",
      intervalDays: 3,
      reps: 5,
      lapses: 0
    },
    {
      id: "c-103",
      deckId: "deck-1",
      status: "learning",
      word: "～たことがある",
      reading: "～たことがある",
      meaningVi: "đã từng làm gì đó (biểu thị kinh nghiệm)",
      partOfSpeech: "Mẫu ngữ pháp",
      jlpt: "N4",
      exampleJa: "日本へ行ったことがありますか。",
      exampleVi: "Bạn đã từng đi Nhật Bản bao giờ chưa?",
      intervalDays: 1,
      reps: 2,
      lapses: 0
    },
    {
      id: "c-104",
      deckId: "deck-1",
      status: "new",
      word: "約束",
      reading: "やくそく • yakusoku",
      meaningVi: "lời hứa, cuộc hẹn",
      partOfSpeech: "Danh từ / Động từ nhóm 3",
      jlpt: "N4",
      exampleJa: "友達と約束があります。",
      exampleVi: "Tôi có một cuộc hẹn với bạn bè.",
      intervalDays: 0,
      reps: 0,
      lapses: 0
    },
    {
      id: "c-105",
      deckId: "deck-1",
      status: "new",
      word: "案内する",
      reading: "あんないする • annai suru",
      meaningVi: "hướng dẫn, chỉ đường",
      partOfSpeech: "Động từ nhóm 3",
      jlpt: "N4",
      exampleJa: "京都を案内してください。",
      exampleVi: "Xin hãy dẫn đường cho tôi ở Kyoto.",
      intervalDays: 0,
      reps: 0,
      lapses: 0
    },
    {
      id: "c-106",
      deckId: "deck-2",
      status: "mastered",
      word: "友達",
      reading: "ともだち • tomodachi",
      meaningVi: "bạn bè, bằng hữu",
      partOfSpeech: "Danh từ",
      jlpt: "N5",
      exampleJa: "友達と図書館で勉強します。",
      exampleVi: "Tôi học cùng bạn ở thư viện.",
      intervalDays: 30,
      reps: 12,
      lapses: 0
    }
  ],

  practiceExercises: [
    {
      id: "prac-1",
      sentenceVi: "Tôi đã từng xem bộ phim này cùng với bạn bè.",
      targetVocab: ["映画 (phim)", "見る (xem)", "友達 (bạn)"],
      targetGrammar: ["Vた + ことがある (đã từng)"],
      jlpt: "N4",
      suggestedAnswer: "友達とこの映画を見たことがあります。",
      hints: ["友達 (ともだち)", "映画 (えいが)", "見る (みる) -> thể Ta"]
    }
  ]
};

// Export to window
window.NIHONGO_MOCK = MOCK_DATA;
