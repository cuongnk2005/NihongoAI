package com.nihongoai.backend.service;

import com.nihongoai.backend.dto.DashboardSummaryDto;
import com.nihongoai.backend.dto.HeatmapDayDto;
import com.nihongoai.backend.dto.RatingDistributionDto;
import com.nihongoai.backend.dto.StatisticsDetailDto;
import com.nihongoai.backend.entity.GrammarReviewLogEntity;
import com.nihongoai.backend.entity.ReviewLogEntity;
import com.nihongoai.backend.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardStatisticsService {

    private final ReviewStateRepository reviewStateRepository;
    private final ReviewLogRepository reviewLogRepository;
    private final GrammarReviewStateRepository grammarReviewStateRepository;
    private final GrammarReviewLogRepository grammarReviewLogRepository;
    private final VocabularyRepository vocabularyRepository;
    private final GrammarRepository grammarRepository;

    public DashboardStatisticsService(
            ReviewStateRepository reviewStateRepository,
            ReviewLogRepository reviewLogRepository,
            GrammarReviewStateRepository grammarReviewStateRepository,
            GrammarReviewLogRepository grammarReviewLogRepository,
            VocabularyRepository vocabularyRepository,
            GrammarRepository grammarRepository
    ) {
        this.reviewStateRepository = reviewStateRepository;
        this.reviewLogRepository = reviewLogRepository;
        this.grammarReviewStateRepository = grammarReviewStateRepository;
        this.grammarReviewLogRepository = grammarReviewLogRepository;
        this.vocabularyRepository = vocabularyRepository;
        this.grammarRepository = grammarRepository;
    }

    public DashboardSummaryDto getDashboardSummary() {
        LocalDateTime now = LocalDateTime.now();
        long dueCards = reviewStateRepository.countDueCards(now) + grammarReviewStateRepository.countDueGrammars(now);
        long vocabCount = vocabularyRepository.count();
        long grammarCount = grammarRepository.count();
        long totalReviews = reviewLogRepository.count() + grammarReviewLogRepository.count();
        long newCards = reviewStateRepository.countNewCards();
        long learningCards = reviewStateRepository.countLearningCards();

        return new DashboardSummaryDto(dueCards, vocabCount, grammarCount, totalReviews, newCards, learningCards);
    }

    public StatisticsDetailDto getStatisticsDetail() {
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = today.atStartOfDay();

        List<ReviewLogEntity> allReviewLogs = reviewLogRepository.findAll();
        List<GrammarReviewLogEntity> allGrammarLogs = grammarReviewLogRepository.findAll();

        // 1. Today reviews count
        long todayReviews = allReviewLogs.stream().filter(l -> l.getReviewTime() != null && l.getReviewTime().isAfter(todayStart)).count()
                + allGrammarLogs.stream().filter(l -> l.getReviewTime() != null && l.getReviewTime().isAfter(todayStart)).count();

        // 2. Rating distribution & Retention rate
        long again = 0, hard = 0, good = 0, easy = 0;

        for (ReviewLogEntity log : allReviewLogs) {
            String r = log.getRating() != null ? log.getRating().toUpperCase() : "";
            switch (r) {
                case "AGAIN" -> again++;
                case "HARD" -> hard++;
                case "GOOD" -> good++;
                case "EASY" -> easy++;
            }
        }

        for (GrammarReviewLogEntity log : allGrammarLogs) {
            String r = log.getRating() != null ? log.getRating().toUpperCase() : "";
            switch (r) {
                case "AGAIN" -> again++;
                case "HARD" -> hard++;
                case "GOOD" -> good++;
                case "EASY" -> easy++;
            }
        }

        long totalRatings = again + hard + good + easy;
        double retentionRate = totalRatings == 0 ? 100.0 : Math.round((double) (good + easy) / totalRatings * 1000.0) / 10.0;

        RatingDistributionDto distribution = new RatingDistributionDto(
                again, totalRatings == 0 ? 0.0 : Math.round((double) again / totalRatings * 1000.0) / 10.0,
                hard, totalRatings == 0 ? 0.0 : Math.round((double) hard / totalRatings * 1000.0) / 10.0,
                good, totalRatings == 0 ? 0.0 : Math.round((double) good / totalRatings * 1000.0) / 10.0,
                easy, totalRatings == 0 ? 0.0 : Math.round((double) easy / totalRatings * 1000.0) / 10.0
        );

        // 3. Streak calculation
        Set<LocalDate> studyDates = new HashSet<>();
        allReviewLogs.stream().filter(l -> l.getReviewTime() != null).forEach(l -> studyDates.add(l.getReviewTime().toLocalDate()));
        allGrammarLogs.stream().filter(l -> l.getReviewTime() != null).forEach(l -> studyDates.add(l.getReviewTime().toLocalDate()));

        int streak = 0;
        LocalDate cursor = studyDates.contains(today) ? today : (studyDates.contains(today.minusDays(1)) ? today.minusDays(1) : null);
        if (cursor != null) {
            while (studyDates.contains(cursor)) {
                streak++;
                cursor = cursor.minusDays(1);
            }
        }

        // 4. 28-day Heatmap
        LocalDateTime since28Days = today.minusDays(27).atStartOfDay();
        List<ReviewLogEntity> reviewLogs28 = reviewLogRepository.findAllSince(since28Days);
        List<GrammarReviewLogEntity> grammarLogs28 = grammarReviewLogRepository.findAllSince(since28Days);

        Map<LocalDate, Long> dayCounts = new HashMap<>();
        reviewLogs28.stream().filter(l -> l.getReviewTime() != null)
                .forEach(l -> dayCounts.merge(l.getReviewTime().toLocalDate(), 1L, Long::sum));
        grammarLogs28.stream().filter(l -> l.getReviewTime() != null)
                .forEach(l -> dayCounts.merge(l.getReviewTime().toLocalDate(), 1L, Long::sum));

        List<HeatmapDayDto> heatmap = new ArrayList<>(28);
        for (int i = 0; i < 28; i++) {
            LocalDate date = today.minusDays(27 - i);
            long count = dayCounts.getOrDefault(date, 0L);
            heatmap.add(new HeatmapDayDto(i + 1, date.toString(), count));
        }

        return new StatisticsDetailDto(
                todayReviews,
                retentionRate,
                streak,
                6.5,
                heatmap,
                distribution
        );
    }
}
