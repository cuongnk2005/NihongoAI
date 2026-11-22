package com.nihongoai.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record VocabularyDto(
        Long id,
        @NotBlank(message = "Từ vựng tiếng Nhật không được để trống")
        String word,
        String reading,
        @NotBlank(message = "Ý nghĩa tiếng Việt không được để trống")
        String meaningVi,
        String meaningEn,
        String partOfSpeech,
        String jlptLevel,
        String exampleJa,
        String exampleVi
) {}
