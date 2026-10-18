package com.nihongoai.backend.controller;

import com.nihongoai.backend.entity.GrammarEntity;
import com.nihongoai.backend.service.GrammarService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grammars")
public class GrammarController {

    private final GrammarService grammarService;

    public GrammarController(GrammarService grammarService) {
        this.grammarService = grammarService;
    }

    @GetMapping
    public ResponseEntity<List<GrammarEntity>> getGrammars(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String q
    ) {
        return ResponseEntity.ok(grammarService.getAllGrammars(level, q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GrammarEntity> getGrammarById(@PathVariable Long id) {
        return grammarService.getGrammarById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<GrammarEntity> createGrammar(@RequestBody GrammarEntity grammar) {
        GrammarEntity created = grammarService.createGrammar(grammar);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGrammar(@PathVariable Long id) {
        if (grammarService.deleteGrammar(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
