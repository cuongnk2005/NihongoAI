package com.nihongoai.backend.srs;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class FSRSSchedulerTest {

    private FSRSScheduler scheduler;

    @BeforeEach
    void setUp() {
        scheduler = new FSRSScheduler();
    }

    @Test
    @DisplayName("New card first review follows Anki 1m, 6m, 10m, 2d learning steps")
    void testNewCardAnkiLearningSteps() {
        LocalDateTime now = LocalDateTime.now();

        // AGAIN -> 1 minute (LEARNING)
        FSRSResult againResult = scheduler.computeNextState(0.0, 5.0, 0, 0, FSRSState.NEW, null, FSRSRating.AGAIN, now);
        assertEquals(FSRSState.LEARNING, againResult.state());
        assertEquals(0, againResult.scheduledDays());
        assertEquals(now.plusMinutes(1), againResult.nextDue());

        // HARD -> 6 minutes (LEARNING)
        FSRSResult hardResult = scheduler.computeNextState(0.0, 5.0, 0, 0, FSRSState.NEW, null, FSRSRating.HARD, now);
        assertEquals(FSRSState.LEARNING, hardResult.state());
        assertEquals(0, hardResult.scheduledDays());
        assertEquals(now.plusMinutes(6), hardResult.nextDue());

        // GOOD -> 10 minutes (LEARNING)
        FSRSResult goodResult = scheduler.computeNextState(0.0, 5.0, 0, 0, FSRSState.NEW, null, FSRSRating.GOOD, now);
        assertEquals(FSRSState.LEARNING, goodResult.state());
        assertEquals(0, goodResult.scheduledDays());
        assertEquals(now.plusMinutes(10), goodResult.nextDue());

        // EASY -> 2 days (REVIEW)
        FSRSResult easyResult = scheduler.computeNextState(0.0, 5.0, 0, 0, FSRSState.NEW, null, FSRSRating.EASY, now);
        assertEquals(FSRSState.REVIEW, easyResult.state());
        assertEquals(2, easyResult.scheduledDays());
        assertEquals(now.plusDays(2), easyResult.nextDue());
    }

    @Test
    @DisplayName("Learning card seen once graduates to REVIEW (1 day) on GOOD rating")
    void testLearningCardGraduatesOnGood() {
        LocalDateTime now = LocalDateTime.now();
        FSRSResult result = scheduler.computeNextState(
                1.0, 4.8, 1, 0, FSRSState.LEARNING, now.minusMinutes(10), FSRSRating.GOOD, now
        );

        assertNotNull(result);
        assertEquals(FSRSState.REVIEW, result.state());
        assertEquals(1, result.scheduledDays());
        assertEquals(2, result.reps());
    }

    @Test
    @DisplayName("Review card with EASY rating increases interval and stability")
    void testReviewCardEasyRating() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastReview = now.minusDays(3);

        FSRSResult result = scheduler.computeNextState(
                3.0, 4.5, 3, 0, FSRSState.REVIEW, lastReview, FSRSRating.EASY, now
        );

        assertNotNull(result);
        assertEquals(FSRSState.REVIEW, result.state());
        assertTrue(result.stability() > 3.0);
        assertTrue(result.scheduledDays() >= 3);
        assertEquals(4, result.reps());
    }
}
