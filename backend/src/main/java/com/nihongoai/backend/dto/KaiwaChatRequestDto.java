package com.nihongoai.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record KaiwaChatRequestDto(
        @NotBlank(message = "Tin nhắn của người học không được để trống")
        String userMessage,

        String level
) {
    public String getEffectiveLevel() {
        return (level != null && !level.isBlank()) ? level : "N4";
    }
}
