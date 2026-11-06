package com.nihongoai.backend.pvp;

import com.nihongoai.backend.repository.VocabularyRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PvpExamSourceTest {
    private PvpService.ExamSource exam(int count) {
        var questions = new ArrayList<PvpService.ExamQuestion>();
        for (int i = 1; i <= count; i++) questions.add(new PvpService.ExamQuestion(i, "Kanji Reading", "問題【学校】 " + i,
            List.of("がっこう", "せんせい", "がくせい", "にほん"), 0));
        return new PvpService.ExamSource("N3 exam", questions, false);
    }
    @Test void sixtyQuestionExamPreservesContentAndDoesNotLeakCorrectAnswer() {
        var repo = mock(VocabularyRepository.class); var service = new PvpService(repo);
        var host = service.create("Host", 60, "QUIZ", "cat", 15, null, exam(60));
        assertEquals(60, host.room().total()); assertNull(host.room().question());
        var guest = service.join(host.room().code(), "Guest", "fox");
        var room = service.start(host.room().code(), host.token());
        assertEquals("IMPORTED", room.question().type()); assertEquals("問題【学校】 1", room.question().word());
        assertEquals("Kanji Reading", room.question().section()); assertEquals(exam(60).questions().get(0).options(), room.question().options());
        assertNull(room.question().correct());
        service.answer(room.code(), host.token(), 1, 0);
        var result = service.answer(room.code(), guest.token(), 1, 1);
        assertEquals("REVEAL", result.phase()); assertEquals(0, result.question().correct());
        assertTrue(result.players().get(0).earned() >= 500); assertEquals(0, result.players().get(1).earned());
        service.next(room.code(), host.token(), 1, "REVEAL");
        var next = service.next(room.code(), host.token(), 1, "RANKING");
        assertEquals("問題【学校】 2", next.question().word());
        verifyNoInteractions(repo);
    }
    @Test void importsCanBeSubsetShuffledOrSingleQuestionInDuel() {
        var service = new PvpService(mock(VocabularyRepository.class));
        var subset = service.create("Host", 10, "QUIZ", "cat", 15, null, new PvpService.ExamSource("Random", exam(60).questions(), true));
        assertEquals(10, subset.room().total());
        var single = service.create("Host", 1, "DUEL", "cat", 15, null, exam(1));
        assertEquals(1, single.room().total());
    }
    @Test void invalidImportedAnswersAndDuplicateNumbersAreRejected() {
        var service = new PvpService(mock(VocabularyRepository.class));
        var good = exam(1).questions().get(0);
        for (Integer correct : Arrays.asList(null, -1, 4)) {
            var bad = new PvpService.ExamQuestion(1, "", "Question", good.options(), correct);
            assertThrows(ResponseStatusException.class, () -> service.create("Host", 1, "QUIZ", "cat", 15, null,
                new PvpService.ExamSource("Bad", List.of(bad), false)));
        }
        assertThrows(ResponseStatusException.class, () -> service.create("Host", 2, "QUIZ", "cat", 15, null,
            new PvpService.ExamSource("Duplicate", List.of(good, good), false)));
        var duplicates = new PvpService.ExamQuestion(1, "", "Question", List.of("A", "A", "C", "D"), 0);
        assertThrows(ResponseStatusException.class, () -> service.create("Host", 1, "QUIZ", "cat", 15, null,
            new PvpService.ExamSource("Duplicate options", List.of(duplicates), false)));
        assertThrows(ResponseStatusException.class, () -> service.create("Host", 501, "QUIZ", "cat", 15, null, exam(501)));
    }
}
