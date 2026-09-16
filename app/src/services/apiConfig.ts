import { Vocabulary, Grammar } from '../types';

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
  }
};
