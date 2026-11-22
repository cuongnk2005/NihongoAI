package com.nihongoai.backend.service;

import com.nihongoai.backend.dto.VocabularyDto;
import com.nihongoai.backend.entity.CardEntity;
import com.nihongoai.backend.entity.DeckEntity;
import com.nihongoai.backend.entity.NoteEntity;
import com.nihongoai.backend.entity.ReviewStateEntity;
import com.nihongoai.backend.repository.CardRepository;
import com.nihongoai.backend.repository.DeckRepository;
import com.nihongoai.backend.repository.NoteRepository;
import com.nihongoai.backend.repository.ReviewStateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class DeckService {

    private final DeckRepository deckRepository;
    private final NoteRepository noteRepository;
    private final CardRepository cardRepository;
    private final ReviewStateRepository reviewStateRepository;
    private final VocabularyService vocabularyService;

    public DeckService(
            DeckRepository deckRepository,
            NoteRepository noteRepository,
            CardRepository cardRepository,
            ReviewStateRepository reviewStateRepository,
            VocabularyService vocabularyService
    ) {
        this.deckRepository = deckRepository;
        this.noteRepository = noteRepository;
        this.cardRepository = cardRepository;
        this.reviewStateRepository = reviewStateRepository;
        this.vocabularyService = vocabularyService;
    }

    public List<DeckEntity> getAllDecks() {
        return deckRepository.findAll();
    }

    public Optional<DeckEntity> getDeckById(Long id) {
        return deckRepository.findById(id);
    }

    public DeckEntity createDeck(String name, String description) {
        DeckEntity deck = new DeckEntity(name, description);
        return deckRepository.save(deck);
    }

    public Optional<DeckEntity> updateDeck(Long id, String name, String description) {
        return deckRepository.findById(id).map(existing -> {
            existing.setName(name);
            existing.setDescription(description);
            return deckRepository.save(existing);
        });
    }

    public boolean deleteDeck(Long id) {
        if (deckRepository.existsById(id)) {
            deckRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Transactional
    public Map<String, Object> syncDeck(String name, String description, List<VocabularyDto> cards) {
        String cleanName = (name != null && !name.isBlank()) ? name.trim() : "Default Deck";
        DeckEntity deck = deckRepository.findByName(cleanName).orElseGet(() -> {
            DeckEntity newDeck = new DeckEntity(cleanName, description != null ? description.trim() : "");
            return deckRepository.save(newDeck);
        });

        int newCardsCount = 0;

        if (cards != null && !cards.isEmpty()) {
            // 1. Sync to vocabulary table for PvP and Practice AI
            vocabularyService.bulkImport(cards, false);

            // 2. Sync to Deck -> Note -> Card -> ReviewState
            for (VocabularyDto c : cards) {
                if (c.word() == null || c.word().isBlank()) continue;
                String word = c.word().trim();

                if (!cardRepository.existsByDeckIdAndFrontContent(deck.getId(), word)) {
                    NoteEntity note = new NoteEntity();
                    note.setDeckId(deck.getId());
                    note.setTags(c.jlptLevel() != null ? c.jlptLevel().trim() : "N5");
                    note = noteRepository.save(note);

                    String reading = c.reading() != null ? c.reading().trim() : "";
                    String meaningVi = c.meaningVi() != null ? c.meaningVi().trim() : "";
                    String back = reading.isEmpty() ? meaningVi : reading + " • " + meaningVi;

                    CardEntity card = new CardEntity(note.getId(), deck.getId(), "FORWARD", word, back);
                    card = cardRepository.save(card);

                    ReviewStateEntity state = new ReviewStateEntity(card.getId());
                    reviewStateRepository.save(state);
                    newCardsCount++;
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("deckId", deck.getId());
        result.put("name", deck.getName());
        result.put("totalCardsInRequest", cards != null ? cards.size() : 0);
        result.put("newCardsInserted", newCardsCount);
        result.put("message", String.format("Đồng bộ thành công bộ thẻ '%s': %d thẻ mới được thêm vào database.", deck.getName(), newCardsCount));
        return result;
    }
}
