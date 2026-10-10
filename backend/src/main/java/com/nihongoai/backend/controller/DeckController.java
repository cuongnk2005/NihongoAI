package com.nihongoai.backend.controller;

import com.nihongoai.backend.entity.DeckEntity;
import com.nihongoai.backend.service.DeckService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/decks")
public class DeckController {

    private final DeckService deckService;

    public DeckController(DeckService deckService) {
        this.deckService = deckService;
    }

    @GetMapping
    public ResponseEntity<List<DeckEntity>> getAllDecks() {
        return ResponseEntity.ok(deckService.getAllDecks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeckEntity> getDeckById(@PathVariable Long id) {
        return deckService.getDeckById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<DeckEntity> createDeck(@RequestBody Map<String, String> body) {
        String name = body.getOrDefault("name", "New Deck");
        String description = body.getOrDefault("description", "");
        DeckEntity created = deckService.createDeck(name, description);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeckEntity> updateDeck(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String name = body.getOrDefault("name", "Updated Deck");
        String description = body.getOrDefault("description", "");
        return deckService.updateDeck(id, name, description)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeck(@PathVariable Long id) {
        if (deckService.deleteDeck(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
