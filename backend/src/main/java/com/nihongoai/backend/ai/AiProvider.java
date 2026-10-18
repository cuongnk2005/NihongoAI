package com.nihongoai.backend.ai;

import java.util.List;

public interface AiProvider {

    String getProviderName();

    PracticeQuestionDto generateExercise(List<String> targetVocab, List<String> targetGrammar, String level);

    EvaluationResultDto evaluateAnswer(String sentenceVi, String exampleJa, String userAnswer, String level);

    KaiwaResponseDto chatKaiwa(String userMessage, String level);
}
