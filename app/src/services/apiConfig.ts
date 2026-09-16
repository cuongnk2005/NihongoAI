import { Vocabulary, Grammar, PracticeQuestion, EvaluationResult } from '../types';

const BASE_URL = 'http://localhost:8080/api';

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
        { id: 2, word: '見る', reading: 'みる', meaningVi: 'Xem / Nhìn', jlptLevel: 'N5', partOfSpeech: 'Động từ nhốm 2' },
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
  generatePractice: async (level: string = 'N4'): Promise<PracticeQuestion> => {
    try {
      const res = await fetch(`${BASE_URL}/practice/generate?level=${level}`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {
      // Fallback structured question
    }
    return {
      sentenceVi: 'Tôi đã từng xem bộ phim này với bạn bè.',
      exampleAnswerJa: '友達とこの映画を見たことがあります。',
      targetVocabulary: ['映画', '見る', '友達'],
      targetGrammar: ['～たことがある'],
      difficulty: level
    };
  },

  evaluatePractice: async (userAnswer: string, question: PracticeQuestion): Promise<EvaluationResult> => {
    try {
      const res = await fetch(`${BASE_URL}/practice/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAnswer, question })
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback structured evaluation
    }
    const isGood = userAnswer.includes('映画') || userAnswer.includes('たことがある');
    return {
      correct: isGood,
      score: isGood ? 90 : 60,
      meaningScore: isGood ? 95 : 65,
      grammarScore: isGood ? 90 : 55,
      naturalnessScore: isGood ? 85 : 60,
      suggestedAnswer: question.exampleAnswerJa,
      explanationVi: isGood
        ? 'Câu của bạn chính xác! Bạn đã sử dụng đúng mẫu ngữ pháp ～たことがある và các từ vựng mục tiêu (映画, 見る, 友達).'
        : 'Câu của bạn cần điều chỉnh. Lưu ý cấu trúc quá khứ kinh nghiệm: V-た + ことがある.'
    };
  }
};
