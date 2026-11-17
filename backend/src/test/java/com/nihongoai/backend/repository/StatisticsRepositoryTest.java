package com.nihongoai.backend.repository;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;
import static org.junit.jupiter.api.Assertions.*;
class StatisticsRepositoryTest {
    @Test void readsLegacyTimestampsAndNewActivitiesAndSupportsIdempotentUndo() {
        var source = new SingleConnectionDataSource("jdbc:sqlite::memory:", true);
        try {
            var jdbc = new JdbcTemplate(source);
            for (String table : java.util.List.of("review_log", "grammar_review_log"))
                jdbc.execute("CREATE TABLE " + table + "(review_time TIMESTAMP,rating TEXT,duration_ms INTEGER)");
            jdbc.execute("CREATE TABLE study_activity(id TEXT PRIMARY KEY,card_key TEXT,rating TEXT,duration_ms INTEGER,review_time TEXT)");
            jdbc.update("INSERT INTO grammar_review_log VALUES(?,?,?)", 1793709650112L, "Good", null);
            var repository = new StatisticsRepository(jdbc);
            repository.save("test", "deck:1", "EASY", 3000);
            repository.save("test", "deck:1", "EASY", 3000);
            var entries = repository.entries();
            assertEquals(2, entries.size()); assertEquals("GOOD",entries.get(0).rating());
            assertNull(entries.get(0).durationMs()); assertEquals(2026,entries.get(0).time().getYear());
            assertEquals(3000L,entries.get(1).durationMs());
            repository.delete("test"); repository.delete("test");
            assertEquals(1,repository.entries().size());
        } finally { source.destroy(); }
    }
}
