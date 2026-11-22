package com.nihongoai.backend.dto;

public record BulkImportResultDto(
        int total,
        int inserted,
        int updated,
        int skipped,
        String message
) {}
