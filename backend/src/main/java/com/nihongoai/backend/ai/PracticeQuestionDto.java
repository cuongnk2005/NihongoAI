package com.nihongoai.backend.ai;

import java.util.List;

public record PracticeQuestionDto(
    String sentenceVi,
    String exampleAnswerJa,
    List<String> targetVocabulary,
    List<String> targetGrammar,
    String difficulty,
    String hintVi
) {
    public PracticeQuestionDto(
        String sentenceVi,
        String exampleAnswerJa,
        List<String> targetVocabulary,
        List<String> targetGrammar,
        String difficulty
    ) {
        this(sentenceVi, exampleAnswerJa, targetVocabulary, targetGrammar, difficulty, null);
    }
}
