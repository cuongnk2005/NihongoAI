import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../../services/apiConfig';
import { PracticeQuestion, EvaluationResult } from '../../../types';

export interface PracticeSessionItem {
  id: number;
  question: PracticeQuestion;
  userAnswer: string;
  evaluation: EvaluationResult;
}

export interface UsePracticeReturn {
  level: string;
  setLevel: (level: string) => void;
  question: PracticeQuestion | null;
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
  isLoading: boolean;
  isEvaluating: boolean;
  evaluation: EvaluationResult | null;
  sessionHistory: PracticeSessionItem[];
  generateNewQuestion: () => Promise<void>;
  submitEvaluation: () => Promise<void>;
  retryCurrentQuestion: () => void;
  insertToken: (rawTag: string) => void;
  playSpeech: (text: string) => void;
}

export const usePractice = (initialLevel: string = 'N4'): UsePracticeReturn => {
  const [level, setLevel] = useState<string>(initialLevel);
  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [sessionHistory, setSessionHistory] = useState<PracticeSessionItem[]>([]);
  const currentSentenceRef = useRef<string | undefined>(undefined);

  const generateNewQuestion = useCallback(async () => {
    setIsLoading(true);
    setEvaluation(null);
    setUserAnswer('');
    try {
      const q = await api.generatePractice(level, currentSentenceRef.current);
      currentSentenceRef.current = q.sentenceVi;
      setQuestion(q);
    } finally {
      setIsLoading(false);
    }
  }, [level]);

  useEffect(() => {
    currentSentenceRef.current = undefined;
    generateNewQuestion();
  }, [generateNewQuestion]);

  const submitEvaluation = useCallback(async () => {
    if (!userAnswer.trim() || !question || isEvaluating) return;

    setIsEvaluating(true);
    try {
      const res = await api.evaluatePractice(userAnswer, question);
      setEvaluation(res);
      setSessionHistory((prev) => [
        {
          id: Date.now(),
          question,
          userAnswer: userAnswer.trim(),
          evaluation: res
        },
        ...prev
      ]);
    } finally {
      setIsEvaluating(false);
    }
  }, [userAnswer, question, isEvaluating]);

  const retryCurrentQuestion = useCallback(() => {
    setEvaluation(null);
  }, []);

  const insertToken = useCallback((rawTag: string) => {
    const cleaned = rawTag
      .replace(/^～/, '')
      .split('(')[0]
      .split('/')[0]
      .trim();
    if (!cleaned) return;
    setUserAnswer((prev) => prev + cleaned);
  }, []);

  const playSpeech = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return {
    level,
    setLevel,
    question,
    userAnswer,
    setUserAnswer,
    isLoading,
    isEvaluating,
    evaluation,
    sessionHistory,
    generateNewQuestion,
    submitEvaluation,
    retryCurrentQuestion,
    insertToken,
    playSpeech
  };
};
