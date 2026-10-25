import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/apiConfig';
import { PracticeQuestion, EvaluationResult } from '../../../types';

export interface UsePracticeReturn {
  level: string;
  setLevel: (level: string) => void;
  question: PracticeQuestion | null;
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
  isLoading: boolean;
  isEvaluating: boolean;
  evaluation: EvaluationResult | null;
  generateNewQuestion: () => Promise<void>;
  submitEvaluation: () => Promise<void>;
  playSpeech: (text: string) => void;
}

export const usePractice = (initialLevel: string = 'N4'): UsePracticeReturn => {
  const [level, setLevel] = useState<string>(initialLevel);
  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  const generateNewQuestion = useCallback(async () => {
    setIsLoading(true);
    setEvaluation(null);
    setUserAnswer('');
    try {
      const q = await api.generatePractice(level);
      setQuestion(q);
    } finally {
      setIsLoading(false);
    }
  }, [level]);

  useEffect(() => {
    generateNewQuestion();
  }, [generateNewQuestion]);

  const submitEvaluation = useCallback(async () => {
    if (!userAnswer.trim() || !question || isEvaluating) return;

    setIsEvaluating(true);
    try {
      const res = await api.evaluatePractice(userAnswer, question);
      setEvaluation(res);
    } finally {
      setIsEvaluating(false);
    }
  }, [userAnswer, question, isEvaluating]);

  const playSpeech = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
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
    generateNewQuestion,
    submitEvaluation,
    playSpeech,
  };
};
