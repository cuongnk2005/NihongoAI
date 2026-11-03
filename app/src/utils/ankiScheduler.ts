import { Flashcard, AnkiCardState } from '../types';

export type RatingType = 'again' | 'hard' | 'good' | 'easy';

export interface ButtonIntervals {
  again: string;
  hard: string;
  good: string;
  easy: string;
}

export interface ScheduleOutcome {
  updatedCard: Flashcard;
  /**
   * True if the card is scheduled for a future day (>= 1 day) and leaves today's queue.
   * False if the card is in a minute-based learning step (1m, 6m, 10m) and stays in the session queue.
   */
  graduatedForToday: boolean;
  /**
   * Number of cards ahead in the active session queue to re-insert this card when graduatedForToday is false.
   */
  requeueOffset: number;
}

/**
 * Determines the current Anki state of a flashcard.
 */
export function resolveCardState(card: Flashcard): AnkiCardState {
  if (card.cardState) {
    return card.cardState;
  }
  const reps = card.reps || 0;
  const interval = card.intervalDays || 0;
  if (reps === 0) {
    return 'new';
  }
  if (interval < 1) {
    return 'learning';
  }
  return 'review';
}

/**
 * Computes the next Review intervals (in days) for a graduated card (state === 'review')
 * using FSRS / Anki interval expansion formulas.
 */
function computeReviewDayIntervals(card: Flashcard): {
  hardDays: number;
  goodDays: number;
  easyDays: number;
  nextStabilityGood: number;
  nextDifficultyGood: number;
} {
  const currentInterval = Math.max(1, card.intervalDays || 1);
  const difficulty = Math.min(10.0, Math.max(1.0, card.difficulty || 5.0));

  // Ease factor derived from FSRS difficulty (around 2.5 for D=5.0, lower for harder cards)
  const easeFactor = Math.max(1.3, 2.5 - (difficulty - 5.0) * 0.15);

  const hardDays = Math.max(currentInterval + 1, Math.round(currentInterval * 1.2));
  const goodDays = Math.max(hardDays + 1, Math.round(currentInterval * easeFactor));
  const easyDays = Math.max(goodDays + 1, Math.round(currentInterval * easeFactor * 1.35));

  return {
    hardDays,
    goodDays,
    easyDays,
    nextStabilityGood: goodDays,
    nextDifficultyGood: difficulty
  };
}

/**
 * Returns the 4 interval labels displayed on Again / Hard / Good / Easy buttons
 * matching Anki's exact Learning Steps (1m, 6m, 10m, 2d) for New cards,
 * graduating steps (1m, 10m, 1d, 3d) once seen once (step 1),
 * and FSRS/Anki day intervals for Review cards.
 */
export function getButtonIntervals(card: Flashcard): ButtonIntervals {
  const state = resolveCardState(card);
  const step = card.learningStep || 0;

  // 1. NEW card or LEARNING Step 0 (chưa qua bước 10 phút)
  // Anki standard: Again = 1 phút, Hard = 6 phút, Good = 10 phút, Easy = 2 ngày
  if (state === 'new' || (state === 'learning' && step === 0)) {
    return {
      again: '1 phút',
      hard: '6 phút',
      good: '10 phút',
      easy: '2 ngày'
    };
  }

  // 2. LEARNING Step >= 1 (đã xem qua 1 lần ở mức 10 phút) hoặc RELEARNING
  // Nhấn Good sẽ chính thức tốt nghiệp (Graduate) sang 1 ngày để bắt đầu tính theo thuật toán lặp lại ngắt quãng
  if (state === 'learning' || state === 'relearning') {
    const relearnGradDays = state === 'relearning' ? Math.max(1, Math.round((card.intervalDays || 2) * 0.5)) : 1;
    const relearnEasyDays = Math.max(relearnGradDays + 2, 3);
    return {
      again: '1 phút',
      hard: '10 phút',
      good: `${relearnGradDays} ngày`,
      easy: `${relearnEasyDays} ngày`
    };
  }

  // 3. REVIEW card (Thẻ đã tốt nghiệp từ trước, tính theo thuật toán FSRS / Anki)
  const { hardDays, goodDays, easyDays } = computeReviewDayIntervals(card);
  return {
    again: '10 phút',
    hard: `${hardDays} ngày`,
    good: `${goodDays} ngày`,
    easy: `${easyDays} ngày`
  };
}

/**
 * Applies a learner rating (Again, Hard, Good, Easy) to a card and returns the next state.
 */
export function applyAnkiRating(card: Flashcard, rating: RatingType): ScheduleOutcome {
  const state = resolveCardState(card);
  const step = card.learningStep || 0;
  const reps = (card.reps || 0) + 1;
  const lapses = card.lapses || 0;
  const currentDiff = card.difficulty || 5.0;

  // CASE 1: NEW card or LEARNING Step 0
  if (state === 'new' || (state === 'learning' && step === 0)) {
    if (rating === 'again') {
      return {
        updatedCard: {
          ...card,
          cardState: 'learning',
          learningStep: 0,
          intervalDays: 0,
          reps,
          difficulty: Math.min(10, currentDiff + 0.6),
          lastIntervalLabel: '1 phút'
        },
        graduatedForToday: false,
        requeueOffset: 2
      };
    }

    if (rating === 'hard') {
      return {
        updatedCard: {
          ...card,
          cardState: 'learning',
          learningStep: 0,
          intervalDays: 0,
          reps,
          difficulty: Math.min(10, currentDiff + 0.3),
          lastIntervalLabel: '6 phút'
        },
        graduatedForToday: false,
        requeueOffset: 3
      };
    }

    if (rating === 'good') {
      // Advances to learningStep = 1 (10 phút: đã xem qua 1 lần, chờ xác nhận tốt nghiệp)
      return {
        updatedCard: {
          ...card,
          cardState: 'learning',
          learningStep: 1,
          intervalDays: 0,
          reps,
          difficulty: currentDiff,
          lastIntervalLabel: '10 phút'
        },
        graduatedForToday: false,
        requeueOffset: 5
      };
    }

    // rating === 'easy' -> Graduates immediately to 2 days!
    return {
      updatedCard: {
        ...card,
        cardState: 'review',
        learningStep: 0,
        intervalDays: 2,
        stability: 2.0,
        difficulty: Math.max(1, currentDiff - 0.5),
        reps,
        lastIntervalLabel: '2 ngày'
      },
      graduatedForToday: true,
      requeueOffset: 0
    };
  }

  // CASE 2: LEARNING Step >= 1 (Đã xem qua 1 lần ở mức 10 phút) or RELEARNING
  if (state === 'learning' || state === 'relearning') {
    if (rating === 'again') {
      return {
        updatedCard: {
          ...card,
          cardState: 'learning',
          learningStep: 0,
          intervalDays: 0,
          reps,
          difficulty: Math.min(10, currentDiff + 0.6),
          lastIntervalLabel: '1 phút'
        },
        graduatedForToday: false,
        requeueOffset: 2
      };
    }

    if (rating === 'hard') {
      return {
        updatedCard: {
          ...card,
          cardState: state,
          learningStep: 1,
          intervalDays: 0,
          reps,
          difficulty: Math.min(10, currentDiff + 0.2),
          lastIntervalLabel: '10 phút'
        },
        graduatedForToday: false,
        requeueOffset: 4
      };
    }

    if (rating === 'good') {
      const gradDays = state === 'relearning' ? Math.max(1, Math.round((card.intervalDays || 2) * 0.5)) : 1;
      return {
        updatedCard: {
          ...card,
          cardState: 'review',
          learningStep: 0,
          intervalDays: gradDays,
          stability: gradDays,
          difficulty: currentDiff,
          reps,
          lastIntervalLabel: `${gradDays} ngày`
        },
        graduatedForToday: true,
        requeueOffset: 0
      };
    }

    // rating === 'easy'
    const easyGradDays = state === 'relearning' ? Math.max(3, Math.round((card.intervalDays || 2) * 0.8)) : 3;
    return {
      updatedCard: {
        ...card,
        cardState: 'review',
        learningStep: 0,
        intervalDays: easyGradDays,
        stability: easyGradDays,
        difficulty: Math.max(1, currentDiff - 0.5),
        reps,
        lastIntervalLabel: `${easyGradDays} ngày`
      },
      graduatedForToday: true,
      requeueOffset: 0
    };
  }

  // CASE 3: REVIEW card (Graduated card)
  const { hardDays, goodDays, easyDays } = computeReviewDayIntervals(card);

  if (rating === 'again') {
    return {
      updatedCard: {
        ...card,
        cardState: 'relearning',
        learningStep: 1,
        reps,
        lapses: lapses + 1,
        difficulty: Math.min(10, currentDiff + 0.8),
        stability: Math.max(0.5, (card.stability || 1) * 0.3),
        lastIntervalLabel: '10 phút'
      },
      graduatedForToday: false,
      requeueOffset: 4
    };
  }

  if (rating === 'hard') {
    return {
      updatedCard: {
        ...card,
        cardState: 'review',
        learningStep: 0,
        intervalDays: hardDays,
        stability: hardDays,
        difficulty: Math.min(10, currentDiff + 0.3),
        reps,
        lastIntervalLabel: `${hardDays} ngày`
      },
      graduatedForToday: true,
      requeueOffset: 0
    };
  }

  if (rating === 'good') {
    return {
      updatedCard: {
        ...card,
        cardState: 'review',
        learningStep: 0,
        intervalDays: goodDays,
        stability: goodDays,
        difficulty: currentDiff,
        reps,
        lastIntervalLabel: `${goodDays} ngày`
      },
      graduatedForToday: true,
      requeueOffset: 0
    };
  }

  // rating === 'easy'
  return {
    updatedCard: {
      ...card,
      cardState: 'review',
      learningStep: 0,
      intervalDays: easyDays,
      stability: easyDays,
      difficulty: Math.max(1, currentDiff - 0.4),
      reps,
      lastIntervalLabel: `${easyDays} ngày`
    },
    graduatedForToday: true,
    requeueOffset: 0
  };
}
