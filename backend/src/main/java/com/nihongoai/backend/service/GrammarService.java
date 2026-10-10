package com.nihongoai.backend.service;

import com.nihongoai.backend.entity.GrammarEntity;
import com.nihongoai.backend.repository.GrammarRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class GrammarService {

    private final GrammarRepository grammarRepository;

    public GrammarService(GrammarRepository grammarRepository) {
        this.grammarRepository = grammarRepository;
    }

    public List<GrammarEntity> getAllGrammars(String level, String query) {
        if (query != null && !query.trim().isEmpty()) {
            return grammarRepository.searchGrammars(query.trim());
        }
        if (level != null && !level.equalsIgnoreCase("ALL")) {
            return grammarRepository.findByJlptLevel(level.toUpperCase());
        }
        return grammarRepository.findAll();
    }

    public Optional<GrammarEntity> getGrammarById(Long id) {
        return grammarRepository.findById(id);
    }

    public GrammarEntity createGrammar(GrammarEntity grammar) {
        return grammarRepository.save(grammar);
    }

    public boolean deleteGrammar(Long id) {
        if (grammarRepository.existsById(id)) {
            grammarRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
