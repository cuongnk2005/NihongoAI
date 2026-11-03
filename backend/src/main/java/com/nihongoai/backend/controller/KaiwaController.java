package com.nihongoai.backend.controller;

import com.nihongoai.backend.ai.KaiwaResponseDto;
import com.nihongoai.backend.dto.KaiwaChatRequestDto;
import com.nihongoai.backend.kaiwa.KaiwaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/kaiwa")
public class KaiwaController {

    private final KaiwaService kaiwaService;

    public KaiwaController(KaiwaService kaiwaService) {
        this.kaiwaService = kaiwaService;
    }

    @PostMapping("/chat")
    public ResponseEntity<KaiwaResponseDto> chat(@Valid @RequestBody KaiwaChatRequestDto request) {
        return ResponseEntity.ok(kaiwaService.chat(request.userMessage(), request.getEffectiveLevel()));
    }
}
