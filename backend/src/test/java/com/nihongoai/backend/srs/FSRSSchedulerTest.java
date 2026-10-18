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
    @DisplayName("New card first review with GOOD rating transitions to REVIEW state")
    void testNewCardGoodRating() {
        LocalDateTime now = LocalDateTime.now();
        FSRSResult result = scheduler.computeNextState(
                0.0, 5.0, 0, 0, FSRSState.NEW, null, FSRSRating.GOOD, now
        );

        assertNotNull(result);
        assertEquals(FSRSState.REVIEW, result.state());
        assertEquals(2.5, result.stability());
        assertEquals(4.8, result.difficulty());
        assertEquals(1, result.reps());
        assertEquals(0, result.lapses());
        assertTrue(result.scheduledDays() >= 1);
        assertTrue(result.nextDue().isAfter(now));
    }

    @Test
    @DisplayName("New card first review with AGAIN rating transitions to LEARNING state")
    void testNewCardAgainRating() {
        LocalDateTime now = LocalDateTime.now();
        FSRSResult result = scheduler.computeNextState(
                0.0, 5.0, 0, 0, FSRSState.NEW, null, FSRSRating.AGAIN, now
        );

        assertNotNull(result);
        assertEquals(FSRSState.LEARNING, result.state());
        assertEquals(0.4, result.stability());
        assertEquals(8.0, result.difficulty());
        assertEquals(1, result.lapses());
        assertEquals(0, result.scheduledDays());
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
