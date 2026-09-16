export interface Vocabulary {
  id?: number;
  word: string;
  reading: string;
  meaningVi: string;
  jlptLevel: string;
  partOfSpeech?: string;
  exampleSentenceJa?: string;
  exampleSentenceVi?: string;
}

export interface Grammar {
  id?: number;
  pattern: string;
  meaningVi: string;
  structure: string;
  explanation?: string;
  jlptLevel: string;
}

export interface Deck {
  id: number;
  name: string;
  description: string;
  newCount: number;
  dueCount: number;
}

export interface PracticeQuestion {
  sentenceVi: string;
  exampleAnswerJa: string;
  targetVocabulary: string[];
  targetGrammar: string[];
  difficulty: string;
}

export interface EvaluationResult {
  correct: boolean;
  score: number;
  meaningScore: number;
  grammarScore: number;
  naturalnessScore: number;
  suggestedAnswer: string;
  explanationVi: string;
}
