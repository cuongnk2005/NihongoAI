package com.nihongoai.backend.service;

import com.nihongoai.backend.entity.DeckEntity;
import com.nihongoai.backend.repository.DeckRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class DeckService {

    private final DeckRepository deckRepository;

    public DeckService(DeckRepository deckRepository) {
        this.deckRepository = deckRepository;
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
}
