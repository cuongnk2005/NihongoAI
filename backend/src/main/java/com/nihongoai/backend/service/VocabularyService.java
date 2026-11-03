package com.nihongoai.backend.service;

import com.nihongoai.backend.entity.VocabularyEntity;
import com.nihongoai.backend.repository.VocabularyRepository;
import org.springframework.stereotype.Service;
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
}
