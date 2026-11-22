package com.nihongoai.backend.dto;

public record DashboardSummaryDto(
        long dueCardsCount,
        long vocabularyCount,
        long grammarCount,
        long totalReviewsCompleted,
        long newCardsCount,
        long learningCardsCount
) {}
