package com.nihongoai.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record BulkImportVocabularyRequestDto(
        @NotEmpty(message = "Danh sách từ vựng không được rỗng")
        List<@Valid VocabularyDto> items,
        boolean overwriteExisting
) {}
