package com.nihongoai.backend.dto;

public record HeatmapDayDto(
        int day,
        String date,
        long count
) {}
