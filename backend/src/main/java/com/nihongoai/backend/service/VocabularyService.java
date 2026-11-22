package com.nihongoai.backend.service;

import com.nihongoai.backend.dto.BulkImportResultDto;
import com.nihongoai.backend.dto.VocabularyDto;
import com.nihongoai.backend.entity.VocabularyEntity;
import com.nihongoai.backend.repository.VocabularyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class VocabularyService {

    private final VocabularyRepository vocabularyRepository;

    public VocabularyService(VocabularyRepository vocabularyRepository) {
        this.vocabularyRepository = vocabularyRepository;
    }

    public List<VocabularyEntity> getAllVocabularies(String level, String query) {
        if (query != null && !query.trim().isEmpty()) {
            return vocabularyRepository.searchVocabularies(query.trim());
        }
        if (level != null && !level.equalsIgnoreCase("ALL")) {
            return vocabularyRepository.findByJlptLevel(level.toUpperCase());
        }
        return vocabularyRepository.findAll();
    }

    public Optional<VocabularyEntity> getVocabularyById(Long id) {
        return vocabularyRepository.findById(id);
    }

    public VocabularyEntity createVocabulary(VocabularyEntity vocab) {
        return vocabularyRepository.save(vocab);
    }

    public boolean deleteVocabulary(Long id) {
        if (vocabularyRepository.existsById(id)) {
            vocabularyRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Transactional
    public BulkImportResultDto bulkImport(List<VocabularyDto> items, boolean overwriteExisting) {
        if (items == null || items.isEmpty()) {
            return new BulkImportResultDto(0, 0, 0, 0, "Không có từ vựng nào để nhập.");
        }

        int inserted = 0;
        int updated = 0;
        int skipped = 0;

        for (VocabularyDto dto : items) {
            if (dto.word() == null || dto.word().isBlank() || dto.meaningVi() == null || dto.meaningVi().isBlank()) {
                skipped++;
                continue;
            }

            String word = dto.word().trim();
            String reading = dto.reading() != null ? dto.reading().trim() : "";
            String meaningVi = dto.meaningVi().trim();

            Optional<VocabularyEntity> existing = reading.isEmpty()
                    ? vocabularyRepository.findFirstByWord(word)
                    : vocabularyRepository.findFirstByWordAndReading(word, reading);

            if (existing.isPresent()) {
                if (overwriteExisting) {
                    VocabularyEntity entity = existing.get();
                    if (!reading.isEmpty()) entity.setReading(reading);
                    entity.setMeaningVi(meaningVi);
                    if (dto.meaningEn() != null) entity.setMeaningEn(dto.meaningEn().trim());
                    if (dto.partOfSpeech() != null) entity.setPartOfSpeech(dto.partOfSpeech().trim());
                    if (dto.jlptLevel() != null && !dto.jlptLevel().isBlank()) entity.setJlptLevel(dto.jlptLevel().trim().toUpperCase());
                    if (dto.exampleJa() != null) entity.setExampleJa(dto.exampleJa().trim());
                    if (dto.exampleVi() != null) entity.setExampleVi(dto.exampleVi().trim());
                    vocabularyRepository.save(entity);
                    updated++;
                } else {
                    skipped++;
                }
            } else {
                VocabularyEntity entity = new VocabularyEntity();
                entity.setWord(word);
                entity.setReading(reading.isEmpty() ? word : reading);
                entity.setMeaningVi(meaningVi);
                if (dto.meaningEn() != null) entity.setMeaningEn(dto.meaningEn().trim());
                if (dto.partOfSpeech() != null) entity.setPartOfSpeech(dto.partOfSpeech().trim());
                entity.setJlptLevel((dto.jlptLevel() != null && !dto.jlptLevel().isBlank()) ? dto.jlptLevel().trim().toUpperCase() : "N5");
                if (dto.exampleJa() != null) entity.setExampleJa(dto.exampleJa().trim());
                if (dto.exampleVi() != null) entity.setExampleVi(dto.exampleVi().trim());
                vocabularyRepository.save(entity);
                inserted++;
            }
        }

        String msg = String.format("Nhập thành công: %d thêm mới, %d cập nhật, %d bỏ qua.", inserted, updated, skipped);
        return new BulkImportResultDto(items.size(), inserted, updated, skipped, msg);
    }
}
