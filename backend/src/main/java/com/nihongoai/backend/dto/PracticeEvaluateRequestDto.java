package com.nihongoai.backend.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record PracticeEvaluateRequestDto(
        @NotBlank(message = "Câu tiếng Việt mục tiêu không được để trống")
        String sentenceVi,

        String exampleAnswerJa,

        @NotBlank(message = "Câu trả lời của người học không được để trống")
        String userAnswer,

        List<String> targetVocabulary,

        List<String> targetGrammar,

        String difficulty
) {
    public String getEffectiveDifficulty() {
        return (difficulty != null && !difficulty.isBlank()) ? difficulty : "N4";
    }
}
