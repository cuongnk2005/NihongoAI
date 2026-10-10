package com.nihongoai.backend.srs;

import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Component
public class FSRSScheduler {

    private static final double REQUEST_RETENTION = 0.90;
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

        // 1. New card first review
        if (currentState == FSRSState.NEW || currentReps == 0) {
            return computeInitialStep(rating, now);
        }

        // 2. Elapsed days calculation
        long elapsedDays = 0;
        if (lastReview != null) {
            elapsedDays = Math.max(0, ChronoUnit.DAYS.between(lastReview, now));
        }

        // 3. Compute retrievability R(t, S)
        double r = Math.pow(1.0 + FACTOR * (Math.max(1, elapsedDays) / Math.max(0.1, currentStability)), DECAY);
        r = clamp(r, 0.01, 0.99);

        // 4. Update difficulty D'
        double deltaD = -0.8 * (rating.getValue() - 3);
        double nextDifficulty = clamp(currentDifficulty + deltaD, 1.0, 10.0);

        // 5. Update stability S' and state transition
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
            // Recall stability formula
            double hardPenalty = (rating == FSRSRating.HARD) ? 0.6 : 1.0;
            double easyBonus = (rating == FSRSRating.EASY) ? 1.3 : 1.0;

            double stabilityMultiplier = 1.0 + Math.exp(0.5) * (11.0 - nextDifficulty) 
                    * Math.pow(Math.max(0.1, currentStability), -0.2) 
                    * (Math.exp((1.0 - r) * 0.9) - 1.0) * hardPenalty * easyBonus;

            nextStability = Math.max(0.5, currentStability * stabilityMultiplier);

            // Compute interval from stability targeting REQUEST_RETENTION (0.90)
            intervalDays = (int) Math.round(nextStability);
            if (rating == FSRSRating.HARD) {
                intervalDays = Math.max(1, intervalDays / 2);
            } else if (rating == FSRSRating.EASY) {
                intervalDays = Math.max(3, (int) Math.round(intervalDays * 1.3));
            } else {
                intervalDays = Math.max(1, intervalDays);
            }
        }

        LocalDateTime nextDue;
        if (intervalDays == 0) {
            nextDue = now.plusMinutes(10);
        } else {
            nextDue = now.plusDays(intervalDays);
        }

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

    private FSRSResult computeInitialStep(FSRSRating rating, LocalDateTime now) {
        double initStability = 2.5;
        double initDifficulty = 4.8;
        int intervalDays = 1;
        FSRSState nextState = FSRSState.REVIEW;

        switch (rating) {
            case AGAIN -> {
                initStability = 0.4;
                initDifficulty = 8.0;
                intervalDays = 0; // 10 minutes
                nextState = FSRSState.LEARNING;
            }
            case HARD -> {
                initStability = 0.9;
                initDifficulty = 6.5;
                intervalDays = 1;
                nextState = FSRSState.LEARNING;
            }
            case GOOD -> {
                initStability = 2.5;
                initDifficulty = 4.8;
                intervalDays = 1;
                nextState = FSRSState.REVIEW;
            }
            case EASY -> {
                initStability = 5.5;
                initDifficulty = 3.0;
                intervalDays = 3;
                nextState = FSRSState.REVIEW;
            }
        }

        LocalDateTime nextDue = (intervalDays == 0) ? now.plusMinutes(10) : now.plusDays(intervalDays);

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

    private double clamp(double val, double min, double max) {
        return Math.max(min, Math.min(max, val));
    }
}
