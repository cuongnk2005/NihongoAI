package com.nihongoai.backend.dto;

public record RatingDistributionDto(
        long againCount,
        double againPercent,
        long hardCount,
        double hardPercent,
        long goodCount,
        double goodPercent,
        long easyCount,
        double easyPercent
) {}
