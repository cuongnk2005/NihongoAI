package com.nihongoai.backend.srs;

import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Component
public class FSRSScheduler {

    private static final double FACTOR = 0.19;
    private static final double DECAY = -0.5;

    public FSRSResult computeNextState(
            double currentStability,
            double currentDifficulty,
            int currentReps,
            int currentLapses,
            FSRSState currentState,
            LocalDateTime lastReview,
            FSRSRating rating,
            LocalDateTime now
    ) {
        if (now == null) now = LocalDateTime.now();

        // 1. New card first review: Anki learning steps (1m, 6m, 10m, 2d)
        if (currentState == FSRSState.NEW || currentReps == 0) {
            return computeInitialStep(rating, now);
        }

        // 2. Learning card second step (after seeing once): Graduates on GOOD (1d) or EASY (3d)
        if (currentState == FSRSState.LEARNING) {
            return computeLearningStep(currentStability, currentDifficulty, currentReps, currentLapses, rating, now);
        }

        // 3. Elapsed days calculation for REVIEW / RELEARNING cards
        long elapsedDays = 0;
        if (lastReview != null) {
            elapsedDays = Math.max(0, ChronoUnit.DAYS.between(lastReview, now));
        }

        // 4. Compute retrievability R(t, S)
        double r = Math.pow(1.0 + FACTOR * (Math.max(1, elapsedDays) / Math.max(0.1, currentStability)), DECAY);
        r = clamp(r, 0.01, 0.99);

        // 5. Update difficulty D'
        double deltaD = -0.8 * (rating.getValue() - 3);
        double nextDifficulty = clamp(currentDifficulty + deltaD, 1.0, 10.0);

        // 6. Update stability S' and state transition
        double nextStability;
        int nextReps = currentReps + 1;
        int nextLapses = currentLapses;
        FSRSState nextState;
        int intervalDays;

        if (rating == FSRSRating.AGAIN) {
            nextLapses++;
            nextState = FSRSState.RELEARNING;
            nextStability = Math.max(0.3, currentStability * 0.25);
            intervalDays = 0; // Due in 10 minutes
        } else {
            nextState = FSRSState.REVIEW;
            double hardPenalty = (rating == FSRSRating.HARD) ? 0.6 : 1.0;
            double easyBonus = (rating == FSRSRating.EASY) ? 1.3 : 1.0;

            double stabilityMultiplier = 1.0 + Math.exp(0.5) * (11.0 - nextDifficulty)
                    * Math.pow(Math.max(0.1, currentStability), -0.2)
                    * (Math.exp((1.0 - r) * 0.9) - 1.0) * hardPenalty * easyBonus;

            nextStability = Math.max(0.5, currentStability * stabilityMultiplier);

            intervalDays = (int) Math.round(nextStability);
            if (rating == FSRSRating.HARD) {
                intervalDays = Math.max(1, intervalDays / 2);
            } else if (rating == FSRSRating.EASY) {
                intervalDays = Math.max(3, (int) Math.round(intervalDays * 1.3));
            } else {
                intervalDays = Math.max(1, intervalDays);
            }
        }

        LocalDateTime nextDue = (intervalDays == 0) ? now.plusMinutes(10) : now.plusDays(intervalDays);

        return new FSRSResult(
                Math.round(nextStability * 100.0) / 100.0,
                Math.round(nextDifficulty * 100.0) / 100.0,
                nextReps,
                nextLapses,
                nextState,
                intervalDays,
                nextDue
        );
    }

    /**
     * Anki initial learning steps for a NEW card:
     * AGAIN -> 1 minute (LEARNING)
     * HARD  -> 6 minutes (LEARNING)
     * GOOD  -> 10 minutes (LEARNING - seen once, ready to graduate on next review)
     * EASY  -> 2 days (Graduates immediately to REVIEW)
     */
    private FSRSResult computeInitialStep(FSRSRating rating, LocalDateTime now) {
        double initStability = 1.0;
        double initDifficulty = 5.0;
        int intervalDays = 0;
        FSRSState nextState = FSRSState.LEARNING;
        LocalDateTime nextDue;

        switch (rating) {
            case AGAIN -> {
                initStability = 0.4;
                initDifficulty = 8.0;
                intervalDays = 0;
                nextState = FSRSState.LEARNING;
                nextDue = now.plusMinutes(1);
            }
            case HARD -> {
                initStability = 0.6;
                initDifficulty = 6.5;
                intervalDays = 0;
                nextState = FSRSState.LEARNING;
                nextDue = now.plusMinutes(6);
            }
            case GOOD -> {
                initStability = 1.0;
                initDifficulty = 4.8;
                intervalDays = 0;
                nextState = FSRSState.LEARNING;
                nextDue = now.plusMinutes(10);
            }
            case EASY -> {
                initStability = 2.0;
                initDifficulty = 3.0;
                intervalDays = 2;
                nextState = FSRSState.REVIEW;
                nextDue = now.plusDays(2);
            }
            default -> nextDue = now.plusMinutes(10);
        }

        return new FSRSResult(
                initStability,
                initDifficulty,
                1,
                (rating == FSRSRating.AGAIN ? 1 : 0),
                nextState,
                intervalDays,
                nextDue
        );
    }

    /**
     * Anki learning step once the card has been seen once (in LEARNING state):
     * AGAIN -> 1 minute (LEARNING)
     * HARD  -> 10 minutes (LEARNING)
     * GOOD  -> 1 day (Graduates to REVIEW)
     * EASY  -> 3 days (Graduates to REVIEW)
     */
    private FSRSResult computeLearningStep(
            double currentStability,
            double currentDifficulty,
            int currentReps,
            int currentLapses,
            FSRSRating rating,
            LocalDateTime now
    ) {
        int nextReps = currentReps + 1;
        switch (rating) {
            case AGAIN -> {
                return new FSRSResult(
                        0.4,
                        clamp(currentDifficulty + 0.6, 1.0, 10.0),
                        nextReps,
                        currentLapses + 1,
                        FSRSState.LEARNING,
                        0,
                        now.plusMinutes(1)
                );
            }
            case HARD -> {
                return new FSRSResult(
                        Math.max(0.6, currentStability),
                        clamp(currentDifficulty + 0.2, 1.0, 10.0),
                        nextReps,
                        currentLapses,
                        FSRSState.LEARNING,
                        0,
                        now.plusMinutes(10)
                );
            }
            case GOOD -> {
                return new FSRSResult(
                        2.5,
                        currentDifficulty,
                        nextReps,
                        currentLapses,
                        FSRSState.REVIEW,
                        1,
                        now.plusDays(1)
                );
            }
            case EASY -> {
                return new FSRSResult(
                        4.0,
                        clamp(currentDifficulty - 0.5, 1.0, 10.0),
                        nextReps,
                        currentLapses,
                        FSRSState.REVIEW,
                        3,
                        now.plusDays(3)
                );
            }
        }
        return new FSRSResult(2.5, currentDifficulty, nextReps, currentLapses, FSRSState.REVIEW, 1, now.plusDays(1));
    }

    private double clamp(double val, double min, double max) {
        return Math.max(min, Math.min(max, val));
    }
}
