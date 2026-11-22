package com.nihongoai.backend.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record SyncDeckRequestDto(
        @NotBlank(message = "Tên bộ thẻ không được để trống")
        String name,
        String description,
        List<VocabularyDto> cards
) {}
