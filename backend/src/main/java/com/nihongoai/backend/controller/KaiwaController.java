package com.nihongoai.backend.controller;

import com.nihongoai.backend.ai.KaiwaResponseDto;
import com.nihongoai.backend.kaiwa.KaiwaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/kaiwa")
public class KaiwaController {

    private final KaiwaService kaiwaService;

    public KaiwaController(KaiwaService kaiwaService) {
        this.kaiwaService = kaiwaService;
    }

    @PostMapping("/chat")
    public ResponseEntity<KaiwaResponseDto> chat(@RequestBody Map<String, String> body) {
        String message = body.getOrDefault("message", "");
        String level = body.getOrDefault("level", "N4");
        return ResponseEntity.ok(kaiwaService.chat(message, level));
    }
}
