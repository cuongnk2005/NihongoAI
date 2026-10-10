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

        List<String> targetVocabWords = vocabs.stream().map(VocabularyEntity::getWord).limit(3).toList();
        List<String> targetGrammarPatterns = grammars.stream().map(GrammarEntity::getPattern).limit(2).toList();

        AiProvider provider = aiProviderFactory.getProvider();
        return provider.generateExercise(targetVocabWords, targetGrammarPatterns, targetLevel);
    }

    public EvaluationResultDto evaluatePractice(String sentenceVi, String exampleJa, String userAnswer, String level) {
        AiProvider provider = aiProviderFactory.getProvider();
        return provider.evaluateAnswer(sentenceVi, exampleJa, userAnswer, level);
    }
}
