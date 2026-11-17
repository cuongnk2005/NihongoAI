package com.nihongoai.backend.service;

import com.nihongoai.backend.repository.StatisticsRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.*;

@Service
public class StatisticsService {
    private final StatisticsRepository repository;
    public StatisticsService(StatisticsRepository repository) { this.repository = repository; }
    public void record(String id, String cardKey, String rating, long durationMs) {
        repository.save(id, cardKey, rating, durationMs);
    }
    public void undo(String id) { repository.delete(id); }
    public record Day(LocalDate date, long count) {}
    public record Summary(long todayReviews, long totalReviews, Double retentionPercent,
        int streakDays, Double averageSeconds, long timedReviews, List<Day> days, Map<String, Long> ratings) {}
    public Summary summary() { return summarize(repository.entries(), LocalDate.now()); }
    static Summary summarize(List<StatisticsRepository.Entry> entries, LocalDate today) {
        LocalDate start = today.minusDays(27);
        Map<LocalDate, Long> daily = new HashMap<>();
        Map<String, Long> ratings = new LinkedHashMap<>();
        for (String r : List.of("EASY", "GOOD", "HARD", "AGAIN")) ratings.put(r, 0L);
        long total = 0, timed = 0, duration = 0;
        for (var entry : entries) {
            LocalDate date = entry.time().toLocalDate();
            if (date.isAfter(today)) continue;
            daily.merge(date, 1L, Long::sum);
            if (date.isBefore(start)) continue;
            total++;
            ratings.computeIfPresent(entry.rating(), (key, count) -> count + 1);
            if (entry.durationMs() != null && entry.durationMs() >= 0) {
                timed++; duration += entry.durationMs();
            }
        }
        List<Day> days = new ArrayList<>();
        for (int i = 0; i < 28; i++) {
            LocalDate date = start.plusDays(i);
            days.add(new Day(date, daily.getOrDefault(date, 0L)));
        }
        int streak = 0;
        LocalDate cursor = daily.containsKey(today) ? today : today.minusDays(1);
        while (daily.containsKey(cursor)) { streak++; cursor = cursor.minusDays(1); }
        return new Summary(daily.getOrDefault(today, 0L), total,
            total == 0 ? null : (total - ratings.get("AGAIN")) * 100.0 / total,
            streak, timed == 0 ? null : duration / (timed * 1000.0), timed, days, ratings);
    }
}
