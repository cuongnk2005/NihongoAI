package com.nihongoai.backend.controller;

import com.nihongoai.backend.dto.BulkImportResultDto;
import com.nihongoai.backend.dto.BulkImportVocabularyRequestDto;
import com.nihongoai.backend.entity.VocabularyEntity;
import com.nihongoai.backend.service.VocabularyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vocabularies")
public class VocabularyController {

    private final VocabularyService vocabularyService;

    public VocabularyController(VocabularyService vocabularyService) {
        this.vocabularyService = vocabularyService;
    }

    @GetMapping
    public ResponseEntity<List<VocabularyEntity>> getVocabularies(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String q
    ) {
        return ResponseEntity.ok(vocabularyService.getAllVocabularies(level, q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VocabularyEntity> getVocabularyById(@PathVariable Long id) {
        return vocabularyService.getVocabularyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<VocabularyEntity> createVocabulary(@RequestBody VocabularyEntity vocab) {
        VocabularyEntity created = vocabularyService.createVocabulary(vocab);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/bulk")
    public ResponseEntity<BulkImportResultDto> bulkImportVocabularies(
            @Valid @RequestBody BulkImportVocabularyRequestDto request
    ) {
        BulkImportResultDto result = vocabularyService.bulkImport(request.items(), request.overwriteExisting());
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVocabulary(@PathVariable Long id) {
        if (vocabularyService.deleteVocabulary(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
