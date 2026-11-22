package com.nihongoai.backend.dto;

import java.util.List;

public record StatisticsDetailDto(
        long todayReviews,
        double retentionRate,
        int streakDays,
        double averageSpeedSeconds,
        List<HeatmapDayDto> heatmap,
        RatingDistributionDto distribution
) {}
