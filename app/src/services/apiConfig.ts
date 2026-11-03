import { Vocabulary, Grammar, PracticeQuestion, EvaluationResult } from '../types';

const BASE_URL = 'http://localhost:8088/api';

const LOCAL_PRACTICE_BANK: Record<string, PracticeQuestion[]> = {
  N5: [
    {
      sentenceVi: 'Mỗi sáng tôi đều uống cà phê rồi đi làm.',
      exampleAnswerJa: '毎朝コーヒーを飲んでから会社へ行きます。',
      targetVocabulary: ['毎朝 (まいあさ)', '飲む (のむ)', '会社 (かいしゃ)'],
      targetGrammar: ['～てから'],
      difficulty: 'N5',
      hintVi: 'Cấu trúc: [Động từ thể て] + から (Sau khi làm V1 thì làm V2).'
    },
    {
      sentenceVi: 'Cuối tuần trước tôi đã đi xem phim cùng với bạn bè.',
      exampleAnswerJa: '先週の週末、友達と映画を見に行きました。',
      targetVocabulary: ['週末 (しゅうまつ)', '友達 (ともだち)', '映画 (えいが)'],
      targetGrammar: ['～に行く'],
      difficulty: 'N5',
      hintVi: 'Cấu trúc chỉ mục đích di chuyển: [V-bỏ ます] + に行く (Đi để làm gì).'
    },
    {
      sentenceVi: 'Tối nay chúng ta cùng ăn món Nhật ở nhà hàng nhé?',
      exampleAnswerJa: '今晩、レストランで日本料理を食べませんか。',
      targetVocabulary: ['今晩 (こんばん)', '日本料理 (にほんりょうり)', '食べる (たべる)'],
      targetGrammar: ['～ませんか'],
      difficulty: 'N5',
      hintVi: 'Mẫu câu rủ rê lịch sự: [Động từ bỏ ます] + ませんか.'
    },
    {
      sentenceVi: 'Vì trời đang mưa nên tôi sẽ đi bằng tàu điện.',
      exampleAnswerJa: '雨が降っていますから、電車で行きます。',
      targetVocabulary: ['雨 (あめ)', '降る (ふる)', '電車 (でんしゃ)'],
      targetGrammar: ['～ています', '～から'],
      difficulty: 'N5',
      hintVi: 'Sử dụng 雨が降っています để diễn tả trời đang mưa và trợ từ で chỉ phương tiện.'
    },
    {
      sentenceVi: 'Tôi muốn mua một chiếc máy tính mới vào tháng sau.',
      exampleAnswerJa: '来月、新しいパソコンを買いたいです。',
      targetVocabulary: ['来月 (らいげつ)', '新しい (あたらしい)', 'パソコン'],
      targetGrammar: ['～たいです'],
      difficulty: 'N5',
      hintVi: 'Nói về mong muốn của bản thân: [Động từ bỏ ます] + たいです.'
    }
  ],
  N4: [
    {
      sentenceVi: 'Tôi đã từng xem bộ phim này cùng với bạn bè.',
      exampleAnswerJa: '友達とこの映画を見たことがあります。',
      targetVocabulary: ['友達 (ともだち)', '映画 (えいが)', '見る (みる)'],
      targetGrammar: ['～たことがある'],
      difficulty: 'N4',
      hintVi: 'Diễn tả kinh nghiệm trong quá khứ: [Động từ thể た] + ことがある.'
    },
    {
      sentenceVi: 'Kỳ nghỉ hè năm sau tôi dự định sẽ đi du lịch Nhật Bản.',
      exampleAnswerJa: '来年の夏休みに日本へ旅行に行くつもりです。',
      targetVocabulary: ['夏休み (なつやすみ)', '旅行 (りょこう)', '日本 (にほん)'],
      targetGrammar: ['～つもりです'],
      difficulty: 'N4',
      hintVi: 'Diễn tả dự định chắc chắn: [Động từ thể từ điển] + つもりです.'
    },
    {
      sentenceVi: 'Ngày mai tôi có cuộc hẹn quan trọng nên phải dậy sớm.',
      exampleAnswerJa: '明日は大切な約束があるので、早く起きなければなりません。',
      targetVocabulary: ['大切な (たいせつな)', '約束 (やくそく)', '起きる (おきる)'],
      targetGrammar: ['～ので', '～なければなりません'],
      difficulty: 'N4',
      hintVi: 'Bắt buộc phải làm gì: [Động từ thể ない bỏ い] + ければなりません.'
    },
    {
      sentenceVi: 'Nếu có thời gian rảnh, tôi muốn học cách nấu món ăn Nhật.',
      exampleAnswerJa: '暇な時間があったら、日本の料理の作り方を習いたいです。',
      targetVocabulary: ['時間 (じかん)', '料理 (りょうり)', '習う (ならう)'],
      targetGrammar: ['～たら', '～方 (かた)'],
      difficulty: 'N4',
      hintVi: 'Câu điều kiện giả định: [Thể た] + ら và cách làm gì đó: [V-bỏ ます] + 方.'
    },
    {
      sentenceVi: 'Bác sĩ khuyên tôi nên ăn nhiều rau và tập thể dục mỗi ngày.',
      exampleAnswerJa: '毎日もっと野菜を食べて、運動したほうがいいです。',
      targetVocabulary: ['野菜 (やさい)', '食べる (たべる)', '運動する (うんどうする)'],
      targetGrammar: ['～たほうがいいです'],
      difficulty: 'N4',
      hintVi: 'Lời khuyên nên làm gì: [Động từ thể た] + ほうがいいです.'
    }
  ],
  N3: [
    {
      sentenceVi: 'Nhờ có sự giúp đỡ của giáo viên mà tôi đã đỗ kỳ thi năng lực tiếng Nhật.',
      exampleAnswerJa: '先生のおかげで、日本語能力試験に合格することができました。',
      targetVocabulary: ['先生 (せんせい)', '試験 (しけん)', '合格する (ごうかくする)'],
      targetGrammar: ['～おかげで', '～ことができる'],
      difficulty: 'N3',
      hintVi: 'Nhờ vào (kết quả tích cực): [Danh từ + の] + おかげで.'
    },
    {
      sentenceVi: 'Dù công việc bận rộn đến mấy, tôi vẫn cố gắng học tiếng Nhật mỗi ngày.',
      exampleAnswerJa: 'どんなに仕事が忙しくても、毎日日本語を勉強するようにしています。',
      targetVocabulary: ['仕事 (しごと)', '忙しい (いそがしい)', '勉強する (べんきょうする)'],
      targetGrammar: ['どんなに～ても', '～ようにしている'],
      difficulty: 'N3',
      hintVi: 'Duy trì thói quen/cố gắng đều đặn: [Động từ thể từ điển] + ようにしている.'
    },
    {
      sentenceVi: 'So với năm ngoái, tiếng Nhật của bạn đã trở nên trôi chảy hơn nhiều.',
      exampleAnswerJa: '去年に比べて、日本語がずっと上手になりましたね。',
      targetVocabulary: ['去年 (きょねん)', '上手 (じょうず)', '日本語 (にほんご)'],
      targetGrammar: ['～に比べて', '～ようになる / ～くなる'],
      difficulty: 'N3',
      hintVi: 'So với: [Danh từ] + に比べて.'
    },
    {
      sentenceVi: 'Trong lúc đang nấu ăn thì có điện thoại gọi đến từ công ty.',
      exampleAnswerJa: '料理を作っている最中に、会社から電話がかかってきました。',
      targetVocabulary: ['料理 (りょうり)', '会社 (かいしゃ)', '電話 (でんわ)'],
      targetGrammar: ['～最中に (さいちゅうに)'],
      difficulty: 'N3',
      hintVi: 'Đúng lúc đang làm gì thì có sự việc bất ngờ xen vào: [V-ている] + 最中に.'
    }
  ],
  N2: [
    {
      sentenceVi: 'Không chỉ giỏi tiếng Anh mà anh ấy còn có thể nói thông thạo cả tiếng Nhật.',
      exampleAnswerJa: '彼は英語が話せるだけでなく、日本語も流暢に話すことができる。',
      targetVocabulary: ['英語 (えいご)', '流暢 (りゅうちょう)', '話す (はなす)'],
      targetGrammar: ['～だけでなく～も'],
      difficulty: 'N2',
      hintVi: 'Không những... mà còn...: [Thể thông thường] + だけでなく、[Danh từ] + も.'
    },
    {
      sentenceVi: 'Một khi đã hứa với khách hàng thì tuyệt đối không được phép thất hứa.',
      exampleAnswerJa: '一度お客様と約束したからには、絶対に守らなければならない。',
      targetVocabulary: ['お客様 (おきゃくさま)', '約束 (やくそく)', '守る (まもる)'],
      targetGrammar: ['～からには'],
      difficulty: 'N2',
      hintVi: 'Một khi đã...: [Động từ thể thông thường] + からには.'
    },
    {
      sentenceVi: 'Cùng với sự phát triển của công nghệ AI, cách làm việc của con người đang thay đổi lớn.',
      exampleAnswerJa: 'AI技術の発展に伴って、人々の働き方が大きく変わりつつある。',
      targetVocabulary: ['発展 (はってん)', '働き方 (はたらきかた)', '変わる (かわる)'],
      targetGrammar: ['～に伴って', '～つつある'],
      difficulty: 'N2',
      hintVi: 'Cùng với sự biến đổi: [Danh từ] + に伴って và đang dần chuyển biến: [V-bỏ ます] + つつある.'
    }
  ],
  N1: [
    {
      sentenceVi: 'Dù biết rõ sẽ gặp nhiều khó khăn nhưng anh ấy vẫn quyết tâm khởi nghiệp.',
      exampleAnswerJa: '多くの困難があることを知りつつも、彼は起業する決意を固めた。',
      targetVocabulary: ['困難 (こんなん)', '起業 (きぎょう)', '決意 (けつい)'],
      targetGrammar: ['～つつも'],
      difficulty: 'N1',
      hintVi: 'Mặc dù biết/làm A nhưng vẫn B: [Động từ bỏ ます] + つつ(も).'
    },
    {
      sentenceVi: 'Thành công của dự án này không thể có được nếu thiếu sự hợp tác của toàn bộ các thành viên.',
      exampleAnswerJa: 'このプロジェクトの成功は、メンバー全員の協力なしにはあり得なかった。',
      targetVocabulary: ['成功 (せいこう)', '協力 (きょうりょく)', 'あり得る (ありえる)'],
      targetGrammar: ['～なしには～ない'],
      difficulty: 'N1',
      hintVi: 'Nếu không có A thì không thể B: [Danh từ] + なしには + [Phủ định].'
    }
  ]
};

const levelIndices: Record<string, number> = { N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 };

function getNextLocalQuestion(level: string, currentSentenceVi?: string): PracticeQuestion {
  const key = LOCAL_PRACTICE_BANK[level] ? level : 'N4';
  const pool = LOCAL_PRACTICE_BANK[key];
  let idx = levelIndices[key] ?? 0;
  let candidate = pool[idx % pool.length];
  if (currentSentenceVi && pool.length > 1 && candidate.sentenceVi === currentSentenceVi) {
    idx++;
    candidate = pool[idx % pool.length];
  }
  levelIndices[key] = idx + 1;
  return candidate;
}

function normalizeJa(text: string): string {
  return text.replace(/[\s。、！？!?,\\.「」『』（）()]/g, '');
}

function computeBigramSimilarity(s1: string, s2: string): number {
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;
  if (s1.length < 2 || s2.length < 2) {
    return s1.includes(s2) || s2.includes(s1) ? 0.5 : 0;
  }
  const b1: string[] = [];
  for (let i = 0; i < s1.length - 1; i++) b1.push(s1.slice(i, i + 2));
  const b2: string[] = [];
  for (let i = 0; i < s2.length - 1; i++) b2.push(s2.slice(i, i + 2));
  const copy2 = [...b2];
  let matches = 0;
  for (const bg of b1) {
    const pos = copy2.indexOf(bg);
    if (pos !== -1) {
      matches++;
      copy2.splice(pos, 1);
    }
  }
  return (2 * matches) / (b1.length + b2.length);
}

export function evaluateLocally(userAnswer: string, question: PracticeQuestion): EvaluationResult {
  const expected = question.exampleAnswerJa;
  const actual = userAnswer.trim();
  const normExpected = normalizeJa(expected);
  const normActual = normalizeJa(actual);

  if (normActual && normActual === normExpected) {
    return {
      correct: true,
      score: 100,
      meaningScore: 100,
      grammarScore: 100,
      naturalnessScore: 98,
      grammarErrors: [],
      vocabularyErrors: [],
      suggestedAnswer: expected,
      explanationVi:
        'Xuất sắc! Câu dịch tiếng Nhật của bạn hoàn toàn chính xác cả về ý nghĩa, ngữ pháp lẫn cách diễn đạt tự nhiên của người bản xứ.'
    };
  }

  const charSim = computeBigramSimilarity(normExpected, normActual);
  const vocabularyErrors: string[] = [];
  const grammarErrors: string[] = [];

  let vocabMatched = 0;
  for (const vTag of question.targetVocabulary) {
    const head = vTag.split('(')[0].trim().replace(/する$/, '');
    const readingMatch = vTag.match(/\(([^)]+)\)/);
    const reading = readingMatch ? readingMatch[1].trim() : '';
    const stem = head.length > 1 ? head.slice(0, -1) : head;
    if (actual.includes(head) || actual.includes(stem) || (reading && actual.includes(reading))) {
      vocabMatched++;
    } else {
      vocabularyErrors.push(`Chưa sử dụng hoặc viết sai từ vựng mục tiêu: 「${vTag}」`);
    }
  }

  let grammarMatched = 0;
  for (const gTag of question.targetGrammar) {
    const cleaned = gTag.replace('～', '').replace(/\(.*?\)/g, '').split('/')[0].trim();
    const core = cleaned.length > 4 ? cleaned.slice(0, 4) : cleaned;
    if (core && actual.includes(core)) {
      grammarMatched++;
    } else {
      grammarErrors.push(`Cần áp dụng đúng mẫu ngữ pháp mục tiêu: 「${gTag}」`);
    }
  }

  if (expected.includes('を') && !actual.includes('を') && actual.length > 4) {
    grammarErrors.push('Thiếu trợ từ 「を」 chỉ tân ngữ trực tiếp của hành động.');
  }

  const vocabRatio = question.targetVocabulary.length > 0 ? vocabMatched / question.targetVocabulary.length : charSim;
  const grammarRatio = question.targetGrammar.length > 0 ? grammarMatched / question.targetGrammar.length : charSim;

  let meaningScore = Math.round(Math.min(100, Math.max(25, vocabRatio * 65 + charSim * 35)));
  let grammarScore = Math.round(Math.min(100, Math.max(20, grammarRatio * 65 + charSim * 35)));
  let naturalnessScore = Math.round(Math.min(100, Math.max(25, charSim * 75 + grammarRatio * 25)));

  if (charSim >= 0.72) {
    meaningScore = Math.max(meaningScore, 88);
    grammarScore = Math.max(grammarScore, 85);
    naturalnessScore = Math.max(naturalnessScore, 84);
  }

  const score = Math.round(meaningScore * 0.4 + grammarScore * 0.4 + naturalnessScore * 0.2);
  const correct = score >= 70;

  let explanationVi = '';
  if (score >= 90) {
    explanationVi = 'Câu dịch của bạn rất chuẩn xác và tự nhiên! Bạn đã vận dụng tốt cả từ vựng lẫn cấu trúc ngữ pháp mục tiêu của câu.';
  } else if (correct) {
    explanationVi =
      'Câu của bạn diễn đạt đúng ý chính và cấu trúc trọng tâm! Hãy lưu ý các điểm góp ý bên dưới để câu văn tự nhiên như người bản xứ hơn.';
  } else {
    explanationVi = `Câu trả lời của bạn chưa khớp với cấu trúc hoặc từ vựng yêu cầu. ${
      question.hintVi ? question.hintVi + ' ' : ''
    }Hãy đối chiếu với đáp án chuẩn 「${expected}」 và thử lại nhé!`;
  }

  return {
    correct,
    score,
    meaningScore,
    grammarScore,
    naturalnessScore,
    grammarErrors,
    vocabularyErrors,
    suggestedAnswer: expected,
    explanationVi
  };
}

export const api = {
  // Vocabulary APIs
  getVocabularies: async (): Promise<Vocabulary[]> => {
    try {
      const res = await fetch(`${BASE_URL}/vocabularies`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [
        { id: 1, word: '映画', reading: 'えいが', meaningVi: 'Bộ phim', jlptLevel: 'N4', partOfSpeech: 'Danh từ' },
        { id: 2, word: '見る', reading: 'みる', meaningVi: 'Xem / Nhìn', jlptLevel: 'N5', partOfSpeech: 'Động từ nhóm 2' },
        { id: 3, word: '友達', reading: 'ともだち', meaningVi: 'Bạn bè', jlptLevel: 'N5', partOfSpeech: 'Danh từ' }
      ];
    }
  },

  createVocabulary: async (vocab: Vocabulary): Promise<Vocabulary> => {
    const res = await fetch(`${BASE_URL}/vocabularies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vocab)
    });
    return await res.json();
  },

  deleteVocabulary: async (id: number): Promise<void> => {
    await fetch(`${BASE_URL}/vocabularies/${id}`, {
      method: 'DELETE'
    });
  },

  // Grammar APIs
  getGrammars: async (): Promise<Grammar[]> => {
    try {
      const res = await fetch(`${BASE_URL}/grammars`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [
        { id: 1, pattern: '～たことがある', meaningVi: 'Đã từng làm gì', structure: 'V-た + ことがある', jlptLevel: 'N4' },
        { id: 2, pattern: '～つもりです', meaningVi: 'Dự định làm gì', structure: 'V-plain + つもりです', jlptLevel: 'N4' }
      ];
    }
  },

  createGrammar: async (grammar: Partial<Grammar>): Promise<Grammar> => {
    try {
      const res = await fetch(`${BASE_URL}/grammars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(grammar)
      });
      return await res.json();
    } catch {
      return { id: Date.now(), pattern: grammar.pattern || '', meaningVi: grammar.meaningVi || '', structure: grammar.structure || '', jlptLevel: grammar.jlptLevel || 'N4' };
    }
  },

  deleteGrammar: async (id: number): Promise<void> => {
    try {
      await fetch(`${BASE_URL}/grammars/${id}`, {
        method: 'DELETE'
      });
    } catch {
      console.log('Deleted offline grammar', id);
    }
  },

  // Practice APIs
  generatePractice: async (level: string = 'N4', currentSentenceVi?: string): Promise<PracticeQuestion> => {
    try {
      const res = await fetch(`${BASE_URL}/practice/generate?level=${level}`, { method: 'POST' });
      if (res.ok) {
        const data: PracticeQuestion = await res.json();
        const isLegacyBrokenMock =
          data.sentenceVi.includes('bộ phim') &&
          data.targetVocabulary.some((v) => v.includes('約束'));
        const isDuplicate = currentSentenceVi && data.sentenceVi === currentSentenceVi;
        if (!isLegacyBrokenMock && !isDuplicate) {
          return data;
        }
      }
    } catch {
      // Fallback to curated local bank
    }
    return getNextLocalQuestion(level, currentSentenceVi);
  },

  evaluatePractice: async (userAnswer: string, question: PracticeQuestion): Promise<EvaluationResult> => {
    try {
      const res = await fetch(`${BASE_URL}/practice/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentenceVi: question.sentenceVi,
          exampleAnswerJa: question.exampleAnswerJa,
          userAnswer,
          targetVocabulary: question.targetVocabulary,
          targetGrammar: question.targetGrammar,
          difficulty: question.difficulty
        })
      });
      if (res.ok) {
        const data: EvaluationResult = await res.json();
        if (data.grammarErrors !== undefined) {
          return data;
        }
      }
    } catch {
      // Fallback to local linguistic evaluator
    }
    return evaluateLocally(userAnswer, question);
  },

  // Kaiwa APIs
  sendKaiwaMessage: async (userMessage: string, level: string = 'N4'): Promise<{ aiReply: string; correctionVi?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/kaiwa/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage, level })
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback response
    }
    return {
      aiReply: '京都へ行ったことがありますか。とてもきれいな街ですよ。',
      correctionVi: 'Câu của bạn khá tốt! AI gợi ý tự nhiên hơn: 「～へ行ったことがありますか」 sử dụng từ vựng đã học 京都.'
    };
  },

  // Settings APIs
  getSettings: async (): Promise<Record<string, string>> => {
    try {
      const res = await fetch(`${BASE_URL}/settings`);
      if (!res.ok) return {};
      const list: Array<{ settingKey: string; settingValue: string }> = await res.json();
      const map: Record<string, string> = {};
      list.forEach((item) => {
        map[item.settingKey] = item.settingValue;
      });
      return map;
    } catch {
      return {};
    }
  },

  saveSetting: async (key: string, value: string): Promise<void> => {
    try {
      await fetch(`${BASE_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
    } catch (e) {
      console.warn('Failed to save setting to backend:', e);
    }
  },

  // AI Kanji & Word Lookup
  lookupKanjiAi: async (word: string): Promise<{
    word: string;
    reading: string;
    sinoVietnamese: string;
    meaningVi: string;
    jlptLevel?: string;
    kanjiList?: Array<{ charStr?: string; char?: string; sino: string; meaning: string }>;
  } | null> => {
    try {
      const res = await fetch(`${BASE_URL}/practice/lookup-kanji?word=${encodeURIComponent(word)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('AI Kanji lookup failed:', e);
    }
    return null;
  }
};
