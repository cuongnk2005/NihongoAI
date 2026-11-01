package com.nihongoai.backend.ai;

import java.util.List;

public record EvaluationResultDto(
    boolean correct,
    int score,
    int meaningScore,
    int grammarScore,
    int naturalnessScore,
    List<String> grammarErrors,
    List<String> vocabularyErrors,
    String suggestedAnswer,
    String explanationVi
) {
    public EvaluationResultDto(
        boolean correct,
        int score,
        int meaningScore,
        int grammarScore,
        int naturalnessScore,
        String suggestedAnswer,
        String explanationVi
    ) {
        this(correct, score, meaningScore, grammarScore, naturalnessScore, List.of(), List.of(), suggestedAnswer, explanationVi);
    }
}
