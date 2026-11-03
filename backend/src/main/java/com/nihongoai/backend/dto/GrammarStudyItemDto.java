package com.nihongoai.backend.dto;

import java.time.LocalDateTime;

public record GrammarStudyItemDto(
        Long id,
        String pattern,
        String meaningVi,
        String structure,
        String explanation,
        String jlptLevel,
        String state,
        int reps,
        double stability,
        double difficulty,
        LocalDateTime due
) {}

