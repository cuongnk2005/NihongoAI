package com.nihongoai.backend.ai;

public record EvaluationResultDto(
    boolean correct,
    int score,
    int meaningScore,
    int grammarScore,
    int naturalnessScore,
    String suggestedAnswer,
    String explanationVi
) {}
