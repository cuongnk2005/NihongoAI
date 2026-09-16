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
