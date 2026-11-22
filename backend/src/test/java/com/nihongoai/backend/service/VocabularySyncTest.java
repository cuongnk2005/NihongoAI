package com.nihongoai.backend.service;

import com.nihongoai.backend.dto.BulkImportResultDto;
import com.nihongoai.backend.dto.VocabularyDto;
import com.nihongoai.backend.entity.DeckEntity;
import com.nihongoai.backend.entity.VocabularyEntity;
import com.nihongoai.backend.repository.CardRepository;
import com.nihongoai.backend.repository.DeckRepository;
import com.nihongoai.backend.repository.NoteRepository;
import com.nihongoai.backend.repository.ReviewStateRepository;
import com.nihongoai.backend.repository.VocabularyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class VocabularySyncTest {

    private VocabularyRepository vocabularyRepository;
    private DeckRepository deckRepository;
    private NoteRepository noteRepository;
    private CardRepository cardRepository;
    private ReviewStateRepository reviewStateRepository;

    private VocabularyService vocabularyService;
    private DeckService deckService;

    @BeforeEach
    void setUp() {
        vocabularyRepository = mock(VocabularyRepository.class);
        deckRepository = mock(DeckRepository.class);
        noteRepository = mock(NoteRepository.class);
        cardRepository = mock(CardRepository.class);
        reviewStateRepository = mock(ReviewStateRepository.class);

        vocabularyService = new VocabularyService(vocabularyRepository);
        deckService = new DeckService(deckRepository, noteRepository, cardRepository, reviewStateRepository, vocabularyService);
    }

    @Test
    void testBulkImportNewWords() {
        when(vocabularyRepository.findFirstByWordAndReading("約束", "やくそく")).thenReturn(Optional.empty());
        when(vocabularyRepository.save(any(VocabularyEntity.class))).thenAnswer(i -> i.getArgument(0));

        List<VocabularyDto> list = List.of(
                new VocabularyDto(null, "約束", "やくそく", "lời hứa", null, "Danh từ", "N4", "約束を守る。", "Giữ lời hứa.")
        );

        BulkImportResultDto result = vocabularyService.bulkImport(list, false);

        assertEquals(1, result.total());
        assertEquals(1, result.inserted());
        assertEquals(0, result.updated());
        assertEquals(0, result.skipped());
        verify(vocabularyRepository, times(1)).save(any(VocabularyEntity.class));
    }

    @Test
    void testBulkImportDuplicateSkipAndOverwrite() {
        VocabularyEntity existing = new VocabularyEntity();
        existing.setId(10L);
        existing.setWord("食べる");
        existing.setReading("たべる");
        existing.setMeaningVi("ăn cơm");

        when(vocabularyRepository.findFirstByWordAndReading("食べる", "たべる")).thenReturn(Optional.of(existing));

        List<VocabularyDto> list = List.of(
                new VocabularyDto(null, "食べる", "たべる", "dùng bữa", null, "Động từ", "N5", null, null)
        );

        // 1. Without overwrite -> should skip
        BulkImportResultDto skipResult = vocabularyService.bulkImport(list, false);
        assertEquals(1, skipResult.skipped());
        assertEquals(0, skipResult.updated());

        // 2. With overwrite -> should update
        BulkImportResultDto overwriteResult = vocabularyService.bulkImport(list, true);
        assertEquals(1, overwriteResult.updated());
        assertEquals(0, overwriteResult.skipped());
        assertEquals("dùng bữa", existing.getMeaningVi());
    }

    @Test
    void testSyncDeckCreatesDeckAndCards() {
        DeckEntity mockDeck = new DeckEntity("Minna Bài 1", "Bài học số 1");
        mockDeck.setId(1L);

        when(deckRepository.findByName("Minna Bài 1")).thenReturn(Optional.empty());
        when(deckRepository.save(any(DeckEntity.class))).thenReturn(mockDeck);
        when(cardRepository.existsByDeckIdAndFrontContent(eq(1L), anyString())).thenReturn(false);
        when(noteRepository.save(any())).thenAnswer(i -> {
            var n = i.getArgument(0, com.nihongoai.backend.entity.NoteEntity.class);
            n.setId(101L);
            return n;
        });
        when(cardRepository.save(any())).thenAnswer(i -> {
            var c = i.getArgument(0, com.nihongoai.backend.entity.CardEntity.class);
            c.setId(201L);
            return c;
        });

        List<VocabularyDto> cards = List.of(
                new VocabularyDto(null, "本", "ほん", "quyển sách", null, "Danh từ", "N5", null, null),
                new VocabularyDto(null, "辞書", "じしょ", "từ điển", null, "Danh từ", "N5", null, null)
        );

        Map<String, Object> result = deckService.syncDeck("Minna Bài 1", "Bài học số 1", cards);

        assertNotNull(result);
        assertEquals(1L, result.get("deckId"));
        assertEquals("Minna Bài 1", result.get("name"));
        assertEquals(2, result.get("newCardsInserted"));

        verify(noteRepository, times(2)).save(any());
        verify(cardRepository, times(2)).save(any());
        verify(reviewStateRepository, times(2)).save(any());
    }
}
