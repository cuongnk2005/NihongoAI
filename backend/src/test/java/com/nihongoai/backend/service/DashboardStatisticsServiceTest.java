package com.nihongoai.backend.service;

import com.nihongoai.backend.dto.DashboardSummaryDto;
import com.nihongoai.backend.dto.StatisticsDetailDto;
import com.nihongoai.backend.entity.ReviewLogEntity;
import com.nihongoai.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class DashboardStatisticsServiceTest {

    private ReviewStateRepository reviewStateRepository;
    private ReviewLogRepository reviewLogRepository;
    private GrammarReviewStateRepository grammarReviewStateRepository;
    private GrammarReviewLogRepository grammarReviewLogRepository;
    private VocabularyRepository vocabularyRepository;
    private GrammarRepository grammarRepository;

    private DashboardStatisticsService statisticsService;

    @BeforeEach
    void setUp() {
        reviewStateRepository = mock(ReviewStateRepository.class);
        reviewLogRepository = mock(ReviewLogRepository.class);
        grammarReviewStateRepository = mock(GrammarReviewStateRepository.class);
        grammarReviewLogRepository = mock(GrammarReviewLogRepository.class);
        vocabularyRepository = mock(VocabularyRepository.class);
        grammarRepository = mock(GrammarRepository.class);

        statisticsService = new DashboardStatisticsService(
                reviewStateRepository,
                reviewLogRepository,
                grammarReviewStateRepository,
                grammarReviewLogRepository,
                vocabularyRepository,
                grammarRepository
        );
    }

    @Test
    void testGetDashboardSummary() {
        when(reviewStateRepository.countDueCards(any())).thenReturn(5L);
        when(grammarReviewStateRepository.countDueGrammars(any())).thenReturn(2L);
        when(vocabularyRepository.count()).thenReturn(45L);
        when(grammarRepository.count()).thenReturn(15L);
        when(reviewLogRepository.count()).thenReturn(100L);
        when(grammarReviewLogRepository.count()).thenReturn(20L);
        when(reviewStateRepository.countNewCards()).thenReturn(10L);
        when(reviewStateRepository.countLearningCards()).thenReturn(8L);

        DashboardSummaryDto summary = statisticsService.getDashboardSummary();

        assertNotNull(summary);
        assertEquals(7L, summary.dueCardsCount());
        assertEquals(45L, summary.vocabularyCount());
        assertEquals(15L, summary.grammarCount());
        assertEquals(120L, summary.totalReviewsCompleted());
        assertEquals(10L, summary.newCardsCount());
        assertEquals(8L, summary.learningCardsCount());
    }

    @Test
    void testGetStatisticsDetailCalculatesMetrics() {
        ReviewLogEntity log1 = new ReviewLogEntity();
        log1.setRating("GOOD");
        log1.setReviewTime(java.time.LocalDate.now().atStartOfDay().plusSeconds(1));

        ReviewLogEntity log2 = new ReviewLogEntity();
        log2.setRating("EASY");
        log2.setReviewTime(java.time.LocalDate.now().atStartOfDay().plusSeconds(2));

        ReviewLogEntity log3 = new ReviewLogEntity();
        log3.setRating("AGAIN");
        log3.setReviewTime(LocalDateTime.now().minusDays(1));

        when(reviewLogRepository.findAll()).thenReturn(List.of(log1, log2, log3));
        when(reviewLogRepository.findAllSince(any())).thenReturn(List.of(log1, log2, log3));
        when(grammarReviewLogRepository.findAll()).thenReturn(List.of());
        when(grammarReviewLogRepository.findAllSince(any())).thenReturn(List.of());

        StatisticsDetailDto detail = statisticsService.getStatisticsDetail();

        assertNotNull(detail);
        assertEquals(2L, detail.todayReviews());
        assertEquals(66.7, detail.retentionRate());
        assertEquals(2, detail.streakDays());
        assertEquals(28, detail.heatmap().size());

        assertEquals(1L, detail.distribution().againCount());
        assertEquals(1L, detail.distribution().goodCount());
        assertEquals(1L, detail.distribution().easyCount());
        assertEquals(0L, detail.distribution().hardCount());
    }
}
