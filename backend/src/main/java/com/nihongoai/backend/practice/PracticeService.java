package com.nihongoai.backend.practice;

import com.nihongoai.backend.ai.AiProvider;
import com.nihongoai.backend.ai.AiProviderFactory;
import com.nihongoai.backend.ai.EvaluationResultDto;
import com.nihongoai.backend.ai.PracticeQuestionDto;
import com.nihongoai.backend.entity.GrammarEntity;
import com.nihongoai.backend.entity.VocabularyEntity;
import com.nihongoai.backend.repository.GrammarRepository;
import com.nihongoai.backend.repository.VocabularyRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class PracticeService {

    private final AiProviderFactory aiProviderFactory;
    private final VocabularyRepository vocabularyRepository;
    private final GrammarRepository grammarRepository;

    public PracticeService(
            AiProviderFactory aiProviderFactory,
            VocabularyRepository vocabularyRepository,
            GrammarRepository grammarRepository
    ) {
        this.aiProviderFactory = aiProviderFactory;
        this.vocabularyRepository = vocabularyRepository;
        this.grammarRepository = grammarRepository;
    }

    public PracticeQuestionDto generatePractice(String level) {
        String targetLevel = (level != null && !level.isBlank()) ? level.toUpperCase() : "N4";
        List<VocabularyEntity> vocabs = vocabularyRepository.findByJlptLevel(targetLevel);
        List<GrammarEntity> grammars = grammarRepository.findByJlptLevel(targetLevel);

        List<String> targetVocabWords = new ArrayList<>();
        if (!vocabs.isEmpty()) {
            List<String> vocabPool = new ArrayList<>(vocabs.stream().map(VocabularyEntity::getWord).toList());
            Collections.shuffle(vocabPool);
            targetVocabWords = vocabPool.stream().limit(3).toList();
        }

        List<String> targetGrammarPatterns = new ArrayList<>();
        if (!grammars.isEmpty()) {
            List<String> grammarPool = new ArrayList<>(grammars.stream().map(GrammarEntity::getPattern).toList());
            Collections.shuffle(grammarPool);
            targetGrammarPatterns = grammarPool.stream().limit(2).toList();
        }

        AiProvider provider = aiProviderFactory.getProvider();
        return provider.generateExercise(targetVocabWords, targetGrammarPatterns, targetLevel);
    }

    public EvaluationResultDto evaluatePractice(String sentenceVi, String exampleJa, String userAnswer, String level) {
        AiProvider provider = aiProviderFactory.getProvider();
        return provider.evaluateAnswer(sentenceVi, exampleJa, userAnswer, level);
    }

    public com.nihongoai.backend.ai.KanjiLookupDto lookupKanji(String word) {
        if (word == null || word.isBlank()) {
            return new com.nihongoai.backend.ai.KanjiLookupDto("", "", "---", "", "N4", List.of());
        }
        String cleanWord = word.trim();

        // 1. Check local SQLite vocabulary repository first
        List<VocabularyEntity> existing = vocabularyRepository.searchVocabularies(cleanWord);
        for (VocabularyEntity v : existing) {
            if (v.getWord() != null && v.getWord().equalsIgnoreCase(cleanWord)) {
                String sino = (v.getPartOfSpeech() != null && v.getPartOfSpeech().startsWith("Hán Việt:"))
                        ? v.getPartOfSpeech().replace("Hán Việt:", "").trim()
                        : "---";
                return new com.nihongoai.backend.ai.KanjiLookupDto(
                        v.getWord(),
                        v.getReading(),
                        sino,
                        v.getMeaningVi(),
                        v.getJlptLevel(),
                        List.of()
                );
            }
        }

        // 2. Query AI provider (Gemini or FreeLLMAPI)
        AiProvider provider = aiProviderFactory.getProvider();
        com.nihongoai.backend.ai.KanjiLookupDto result = provider.lookupKanji(cleanWord);

        // 3. Auto-cache into local SQLite database for future instant lookup
        if (result != null && result.word() != null && !result.word().isBlank() && !"---".equals(result.sinoVietnamese())) {
            try {
                VocabularyEntity entity = new VocabularyEntity();
                entity.setWord(result.word());
                entity.setReading(result.reading() != null && !result.reading().isBlank() ? result.reading() : result.word());
                entity.setMeaningVi(result.meaningVi());
                entity.setJlptLevel(result.jlptLevel() != null ? result.jlptLevel() : "N4");
                entity.setPartOfSpeech(result.sinoVietnamese() != null ? "Hán Việt: " + result.sinoVietnamese() : "Từ vựng");
                vocabularyRepository.save(entity);
            } catch (Exception ignored) {
            }
        }

        return result;
    }
}
