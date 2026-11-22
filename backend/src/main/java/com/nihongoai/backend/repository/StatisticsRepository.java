package com.nihongoai.backend.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public class StatisticsRepository {
    private final JdbcTemplate jdbc;
    public StatisticsRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public record Entry(LocalDateTime time, String rating, Long durationMs) {}
    public List<Entry> entries() {
        return jdbc.query("""
            SELECT review_time, rating, duration_ms FROM review_log
            UNION ALL SELECT review_time, rating, duration_ms FROM grammar_review_log
            UNION ALL SELECT review_time, rating, duration_ms FROM study_activity
            """, (rs, n) -> new Entry(
                rs.getObject(1) instanceof Number ? rs.getTimestamp(1).toLocalDateTime()
                    : LocalDateTime.parse(rs.getString(1).replace(' ', 'T')),
                rs.getString(2).toUpperCase(java.util.Locale.ROOT),
                rs.getObject(3) == null ? null : rs.getLong(3)));
    }
    public void save(String id, String cardKey, String rating, long durationMs) {
        jdbc.update("INSERT INTO study_activity(id,card_key,rating,duration_ms,review_time) VALUES(?,?,?,?,?) ON CONFLICT(id) DO NOTHING",
            id, cardKey, rating, durationMs, LocalDateTime.now().toString());
    }
    public void delete(String id) { jdbc.update("DELETE FROM study_activity WHERE id = ?", id); }
}
