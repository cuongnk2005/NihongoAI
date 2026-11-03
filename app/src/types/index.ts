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
  hintVi?: string;
}

export interface EvaluationResult {
  correct: boolean;
  score: number;
  meaningScore: number;
  grammarScore: number;
  naturalnessScore: number;
  grammarErrors?: string[];
  vocabularyErrors?: string[];
  suggestedAnswer: string;
  explanationVi: string;
}

export type CardType = 'vocab' | 'typing_2way' | 'basic' | 'reversed' | 'cloze';

export type TypingDirection = 'kanji_to_reading' | 'meaning_to_ja';

export type AnkiCardState = 'new' | 'learning' | 'review' | 'relearning';

export interface Flashcard {
  id: number;
  word: string;
  reading?: string;
  meaningVi?: string;
  sinoVietnamese?: string;
  audioUrl?: string;
  partOfSpeech?: string;
  jlptLevel?: string;
  exampleSentenceJa?: string;
  exampleSentenceVi?: string;
  intervalDays?: number;
  reps?: number;
  lapses?: number;
  stability?: number;
  difficulty?: number;
  cardState?: AnkiCardState;
  learningStep?: number;
  lastIntervalLabel?: string;
  deckId?: string;
  deckName?: string;
  cardType?: CardType;
  typingDirection?: TypingDirection;
  frontContent?: string;
  backContent?: string;
  clozeHint?: string;
}

export interface GrammarStudyItem extends Grammar {
  id: number;
  state: string;
  reps: number;
  stability: number;
  difficulty: number;
  due: string;
}