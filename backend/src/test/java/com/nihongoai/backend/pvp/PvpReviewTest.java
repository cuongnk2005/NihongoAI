package com.nihongoai.backend.pvp;

import com.nihongoai.backend.repository.VocabularyRepository;
import org.junit.jupiter.api.Test;
import java.time.Clock;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PvpReviewTest {
    @Test void finishedReviewIsPersonalIncludesTimeoutAndIsRecordedOnlyOnce() {
        var clock = mock(Clock.class); long[] now = { 100000 };
        when(clock.millis()).thenAnswer(i -> now[0]);
        var service = new PvpService(mock(VocabularyRepository.class), clock);
        var exam = new PvpService.ExamSource("Review test", List.of(
            new PvpService.ExamQuestion(1, "Reading", "学校", List.of("がっこう", "せんせい", "みず", "ほん"), 0),
            new PvpService.ExamQuestion(2, "Reading", "先生", List.of("せんせい", "がっこう", "みず", "ほん"), 0),
            new PvpService.ExamQuestion(3, "Meaning", "水", List.of("Nước", "Sách", "Trường", "Giáo viên"), 0)), false);
        var host = service.create("Host", 3, "QUIZ", "cat", 15, null, exam);
        var guest = service.join(host.room().code(), "Guest", "fox");
        var state = service.start(host.room().code(), host.token());
        assertTrue(state.review().isEmpty());
        for (int round = 1; round <= 3; round++) {
            if (round != 2) service.answer(state.code(), host.token(), round, round == 1 ? 1 : 0);
            service.answer(state.code(), guest.token(), round, round == 1 ? 0 : 1);
            if (round == 2) now[0] += 15000;
            var revealed = service.state(state.code(), host.token());
            assertEquals("REVEAL", revealed.phase()); assertTrue(revealed.review().isEmpty());
            service.next(state.code(), host.token(), round, "REVEAL");
            for (int repeat = 0; repeat < 3; repeat++) service.state(state.code(), host.token());
            state = service.next(state.code(), host.token(), round, "RANKING");
        }
        assertEquals("FINISHED", state.phase()); assertEquals(3, state.review().size());
        assertEquals(1, state.review().get(0).choice()); assertEquals(0, state.review().get(0).correct());
        assertNull(state.review().get(1).choice()); assertEquals(0, state.review().get(1).earned());
        assertEquals(0, state.review().get(2).choice()); assertEquals("Meaning", state.review().get(2).section());
        assertEquals(2, state.review().stream().filter(q -> q.choice() == null || q.choice() != q.correct()).count());
        var other = service.state(state.code(), guest.token());
        assertEquals(0, other.review().get(0).choice()); assertEquals(1, other.review().get(1).choice());
        assertEquals(3, service.state(state.code(), host.token()).review().size());
    }

    @Test void autoFinishedDuelHasReviewEvenIfNoOneAnswers() {
        var clock = mock(Clock.class); long[] now = {100000};
        when(clock.millis()).thenAnswer(i -> now[0]);
        var service = new PvpService(mock(VocabularyRepository.class), clock);
        var question = new PvpService.ExamQuestion(1, "", "Question", List.of("A", "B", "C", "D"), 2);
        var host = service.create("Host", 1, "DUEL", "cat", 15, null, new PvpService.ExamSource("Duel", List.of(question), false));
        service.join(host.room().code(), "Guest", "fox"); service.start(host.room().code(), host.token());
        now[0] += 15000; service.state(host.room().code(), host.token());
        now[0] += 3000;
        var finished = service.state(host.room().code(), host.token());
        assertEquals("FINISHED", finished.phase()); assertEquals(1, finished.review().size());
        assertNull(finished.review().get(0).choice()); assertEquals(2, finished.review().get(0).correct());
    }
}
