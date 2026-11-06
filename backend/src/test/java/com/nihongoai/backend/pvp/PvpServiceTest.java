package com.nihongoai.backend.pvp;

import com.nihongoai.backend.entity.VocabularyEntity;
import com.nihongoai.backend.repository.VocabularyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.time.Clock;
import java.util.ArrayList;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PvpServiceTest {
    VocabularyRepository repository;
    Clock clock;
    PvpService service;
    PvpService.Session host, guest;
    long time;
    @BeforeEach void setup() {
        repository = mock(VocabularyRepository.class); clock = mock(Clock.class);
        time = 100000; when(clock.millis()).thenAnswer(i -> time);
        var words = new ArrayList<VocabularyEntity>();
        for (int i = 0; i < 8; i++) {
            var word = new VocabularyEntity(); word.setWord("単語" + i); word.setMeaningVi("Nghĩa " + i); words.add(word);
        }
        when(repository.findAll()).thenReturn(words); service = new PvpService(repository, clock);
        host = service.create("Chủ phòng", 5); guest = service.join(host.room().code(), "Khách");
    }
    int correct(PvpService.View view) {
        String prompt = view.question().word();
        String answer = view.question().type().equals("VIETNAMESE_TO_JAPANESE")
            ? "単語" + prompt.substring("Nghĩa ".length()) : "Nghĩa " + prompt.substring(2);
        return view.question().options().indexOf(answer);
    }
    @Test void roomMembershipAndHostControl() {
        assertNull(host.room().question());
        assertThrows(ResponseStatusException.class, () -> service.join(host.room().code(), "Thứ ba"));
        assertThrows(ResponseStatusException.class, () -> service.start(host.room().code(), guest.token()));
        assertThrows(ResponseStatusException.class, () -> service.state(host.room().code(), "wrong-token"));
    }
    @Test void speedScoringHiddenAnswersAndDuplicateProtection() {
        var view = service.start(host.room().code(), host.token()); int choice = correct(view);
        assertNull(view.question().correct());
        var first = service.answer(view.code(), host.token(), 1, choice);
        assertEquals(choice, first.players().get(0).choice()); assertEquals(0L, first.players().get(0).elapsedMs());
        assertEquals(0, first.players().get(0).score());
        var opponentView = service.state(view.code(), guest.token());
        assertNull(opponentView.players().get(0).choice());
        assertNull(opponentView.players().get(0).elapsedMs());
        assertNull(opponentView.question().correct());
        assertThrows(ResponseStatusException.class, () -> service.answer(view.code(), host.token(), 1, choice));
        time += 7500;
        var result = service.answer(view.code(), guest.token(), 1, choice);
        assertEquals("REVEAL", result.phase()); assertEquals(choice, result.question().correct());
        assertEquals(1000, result.players().get(0).score()); assertEquals(750, result.players().get(1).score());
        time += 3000; var next = service.state(view.code(), host.token());
        assertEquals(2, next.round()); assertFalse(next.players().get(0).answered());
        assertThrows(ResponseStatusException.class, () -> service.answer(view.code(), host.token(), 1, choice));
    }
    @Test void timeoutRejectsLateAnswerAndFinishesMatch() {
        var view = service.start(host.room().code(), host.token());
        for (int i = 1; i <= 5; i++) {
            time += 15000;
            int round = i;
            assertThrows(ResponseStatusException.class, () -> service.answer(host.room().code(), host.token(), round, 0));
            assertEquals("REVEAL", service.state(view.code(), host.token()).phase());
            time += 3000; view = service.state(view.code(), host.token());
        }
        assertEquals("FINISHED", view.phase()); assertEquals(0, view.players().get(0).score());
    }
    @Test void invalidBankAndNamesAreRejected() {
        when(repository.findAll()).thenReturn(new ArrayList<>());
        assertThrows(ResponseStatusException.class, () -> service.create("Host", 5));
        assertThrows(ResponseStatusException.class, () -> service.create(" ", 5));
        assertThrows(ResponseStatusException.class, () -> service.create("Host", 999));
    }
}
