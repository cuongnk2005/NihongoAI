package com.nihongoai.backend.service;
import com.nihongoai.backend.repository.StatisticsRepository.Entry;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
class StatisticsServiceTest {
    private final LocalDate today = LocalDate.of(2026,11,17);
    private Entry entry(int daysAgo, String rating, Long ms) {
        return new Entry(today.minusDays(daysAgo).atTime(12,0), rating, ms);
    }
    @Test void emptyHistoryHasNoInventedMetrics() {
        var s = StatisticsService.summarize(List.of(),today);
        assertEquals(0,s.todayReviews()); assertNull(s.retentionPercent()); assertNull(s.averageSeconds());
        assertEquals(28,s.days().size()); assertEquals(today.minusDays(27),s.days().get(0).date());
        assertEquals(today,s.days().get(27).date()); assertEquals(0,s.streakDays());
    }
    @Test void includesBoundariesExcludesFutureAndHandlesLegacyTimings() {
        var s = StatisticsService.summarize(List.of(entry(0,"GOOD",2000L),entry(0,"AGAIN",4000L),
            entry(1,"HARD",null),entry(27,"EASY",null),entry(28,"AGAIN",9000L),entry(-1,"GOOD",1000L)),today);
        assertEquals(2,s.todayReviews()); assertEquals(4,s.totalReviews());
        assertEquals(75.0,s.retentionPercent()); assertEquals(3.0,s.averageSeconds());
        assertEquals(2,s.timedReviews()); assertEquals(2,s.streakDays());
        assertEquals(1,s.days().get(0).count()); assertEquals(2,s.days().get(27).count());
    }
    @Test void streakSurvivesUntilEndOfTodayAndIsNotLimitedToHeatmap() {
        var entries = java.util.stream.IntStream.rangeClosed(1,40).mapToObj(i -> entry(i,"GOOD",null)).toList();
        assertEquals(40,StatisticsService.summarize(entries,today).streakDays());
        assertEquals(0,StatisticsService.summarize(List.of(entry(2,"GOOD",null)),today).streakDays());
    }
}
