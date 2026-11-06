package com.nihongoai.backend.pvp;

import com.nihongoai.backend.entity.VocabularyEntity;
import com.nihongoai.backend.repository.VocabularyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.time.Clock;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PvpQuizTest {
    PvpService service;
    PvpService.Session host, first, second;
    long time = 100000;
    @BeforeEach void setup() {
        var repo = mock(VocabularyRepository.class); var clock = mock(Clock.class);
        when(clock.millis()).thenAnswer(i -> time);
        var bank = new ArrayList<VocabularyEntity>();
        for (int i = 0; i < 8; i++) {
            var v = new VocabularyEntity(); v.setWord("単語" + i); v.setMeaningVi("Meaning " + i); bank.add(v);
        }
        when(repo.findAll()).thenReturn(bank); service = new PvpService(repo, clock);
        host = service.create("Host", 5, "QUIZ", "owl", 30);
        first = service.join(host.room().code(), "First", "cat");
        second = service.join(host.room().code(), "Second", "panda");
    }
    int correct(PvpService.View view) {
        String prompt = view.question().word();
        String answer = view.question().type().equals("VIETNAMESE_TO_JAPANESE")
            ? "単語" + prompt.substring(8) : "Meaning " + prompt.substring(2);
        return view.question().options().indexOf(answer);
    }
    @Test void hostCanPlayButGuestsCannotControlQuiz() {
        assertEquals(2, second.room().you()); assertEquals("panda", second.room().players().get(2).avatar());
        assertThrows(ResponseStatusException.class, () -> service.start(host.room().code(), first.token()));
        var view = service.start(host.room().code(), host.token());
        assertEquals(time + 30000, view.deadline());
        int answer = correct(view);
        var answered = service.answer(view.code(), host.token(), 1, answer);
        assertTrue(answered.players().get(0).answered());
        assertNull(answered.question().correct());
        assertThrows(ResponseStatusException.class, () -> service.answer(view.code(), host.token(), 1, answer));
        assertThrows(ResponseStatusException.class, () -> service.next(view.code(), first.token(), 1, "PLAYING"));
        assertThrows(ResponseStatusException.class, () -> service.join(view.code(), "Late", "cat"));
    }
    @Test void waitsForAllPlayersAndHostControlsEveryTransition() {
        var view = service.start(host.room().code(), host.token()); int answer = correct(view);
        var partial = service.answer(view.code(), first.token(), 1, answer);
        assertEquals("PLAYING", partial.phase()); assertEquals(0L, partial.players().get(1).elapsedMs());
        assertEquals(answer, partial.players().get(1).choice());
        var hostView = service.state(view.code(), host.token());
        assertNull(hostView.players().get(1).choice()); assertNull(hostView.players().get(1).elapsedMs());
        assertEquals(0, partial.players().get(1).score());
        time += 15000;
        var reveal = service.answer(view.code(), second.token(), 1, answer);
        assertEquals("PLAYING", reveal.phase());
        reveal = service.answer(view.code(), host.token(), 1, answer);
        assertEquals("REVEAL", reveal.phase()); assertEquals(1000, reveal.players().get(1).score());
        assertEquals(750, reveal.players().get(0).score());
        assertEquals(15000L, reveal.players().get(0).elapsedMs());
        assertEquals(750, reveal.players().get(2).score()); assertEquals(15000L, reveal.players().get(2).elapsedMs());
        time += 1000;
        assertEquals("REVEAL", service.state(view.code(), first.token()).phase());
        var ranking = service.next(view.code(), host.token(), 1, "REVEAL");
        assertEquals("RANKING", ranking.phase());
        assertThrows(ResponseStatusException.class, () -> service.next(view.code(), host.token(), 1, "REVEAL"));
        assertThrows(ResponseStatusException.class, () -> service.answer(view.code(), first.token(), 1, answer));
        var next = service.next(view.code(), host.token(), 1, "RANKING");
        assertEquals(2, next.round()); assertEquals("PLAYING", next.phase());
        assertFalse(next.players().get(1).answered()); assertNull(next.question().correct());
        assertEquals(1000, next.players().get(1).score());
    }
    @Test void quizAutomaticallyAdvancesUnlessHostOpensRanking() {
        var view = service.start(host.room().code(), host.token());
        service.next(view.code(), host.token(), 1, "PLAYING");
        time += 3000;
        var next = service.state(view.code(), first.token());
        assertEquals(2, next.round()); assertEquals("PLAYING", next.phase());
        service.next(view.code(), host.token(), 2, "PLAYING");
        service.next(view.code(), host.token(), 2, "REVEAL");
        time += 60000;
        var paused = service.state(view.code(), first.token());
        assertEquals("RANKING", paused.phase()); assertEquals(2, paused.round());
        assertEquals("PLAYING", service.next(view.code(), host.token(), 2, "RANKING").phase());
    }
    @Test void hostCanEndQuestionEarlyAndCompleteMatchWithTimeouts() {
        var view = service.start(host.room().code(), host.token());
        for (int round = 1; round <= 5; round++) {
            if (round == 1) service.next(view.code(), host.token(), round, "PLAYING");
            else { time += 30000; assertEquals("REVEAL", service.state(view.code(), first.token()).phase()); }
            var reveal = service.state(view.code(), first.token());
            assertNull(reveal.players().get(1).elapsedMs()); assertEquals(0, reveal.players().get(1).score());
            service.next(view.code(), host.token(), round, "REVEAL");
            view = service.next(view.code(), host.token(), round, "RANKING");
        }
        assertEquals("FINISHED", view.phase());
    }
    @Test void validatesSettingsAndEnforcesFiftyPlayerLimit() {
        assertThrows(ResponseStatusException.class, () -> service.create("Host", 5, "INVALID", "cat", 15));
        assertThrows(ResponseStatusException.class, () -> service.create("Host", 5, "QUIZ", "invalid", 15));
        assertThrows(ResponseStatusException.class, () -> service.create("Host", 5, "QUIZ", "cat", 0));
        for (int i = 2; i < 50; i++) service.join(host.room().code(), "Player " + i, "fox");
        assertEquals(51, service.state(host.room().code(), host.token()).players().size());
        assertThrows(ResponseStatusException.class, () -> service.join(host.room().code(), "Extra", "cat"));
    }
}
