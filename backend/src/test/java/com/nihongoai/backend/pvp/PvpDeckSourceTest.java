package com.nihongoai.backend.pvp;

import com.nihongoai.backend.repository.VocabularyRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PvpDeckSourceTest {
    private List<PvpService.DeckWord> cards() {
        return List.of(new PvpService.DeckWord("学校", "がっこう", "Trường học"),
            new PvpService.DeckWord("先生", "せんせい", "Giáo viên"),
            new PvpService.DeckWord("学生", "がくせい", "Học sinh"),
            new PvpService.DeckWord("日本", "にほん", "Nhật Bản"),
            new PvpService.DeckWord("本", "ほん", "Sách"));
    }
    @Test void uploadedDeckIsUsedWithoutReadingOrWritingSharedVocabulary() {
        var repository = mock(VocabularyRepository.class); var service = new PvpService(repository);
        for (String mode : List.of("QUIZ", "DUEL")) {
            var host = service.create("Host", 10, mode, "cat", 15, new PvpService.DeckSource("Bộ riêng", cards()));
            assertEquals(5, host.room().total()); assertEquals("Bộ riêng", host.room().sourceName());
            assertNull(host.room().question());
            service.join(host.room().code(), "Guest", "fox");
            var room = service.start(host.room().code(), host.token());
            assertNull(room.question().correct());
            var content = new HashSet<String>();
            cards().forEach(c -> { content.add(c.word()); content.add(c.reading()); content.add(c.meaningVi()); });
            assertTrue(content.contains(room.question().word()));
            assertTrue(content.containsAll(room.question().options()));
        }
        verifyNoInteractions(repository);
    }
    @Test void rejectsEmptyOversizedAndInsufficientDecksWithoutFallback() {
        var repository = mock(VocabularyRepository.class); var service = new PvpService(repository);
        assertThrows(ResponseStatusException.class, () -> service.create("Host", 5, "QUIZ", "cat", 15,
            new PvpService.DeckSource("Empty", List.of())));
        assertThrows(ResponseStatusException.class, () -> service.create("Host", 5, "QUIZ", "cat", 15,
            new PvpService.DeckSource("Too small", cards().subList(0, 3))));
        assertThrows(ResponseStatusException.class, () -> service.create("Host", 5, "QUIZ", "cat", 15,
            new PvpService.DeckSource("Too big", Collections.nCopies(5001, cards().get(0)))));
        assertThrows(ResponseStatusException.class, () -> service.create("Host", 5, "QUIZ", "cat", 15,
            new PvpService.DeckSource("Bad card", Collections.singletonList(new PvpService.DeckWord("", "", "")))));
        verifyNoInteractions(repository);
    }
}
