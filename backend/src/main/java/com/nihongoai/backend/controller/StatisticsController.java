package com.nihongoai.backend.controller;

import com.nihongoai.backend.service.StatisticsService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {
    private final StatisticsService service;
    public StatisticsController(StatisticsService service) {
        this.service = service;
    }
    public record Activity(
        @NotBlank @Pattern(regexp="[a-zA-Z0-9-]{1,64}") String id,
        @NotBlank @Size(max=300) String cardKey,
        @NotNull @Pattern(regexp="AGAIN|HARD|GOOD|EASY") String rating,
        @NotNull @Min(0) @Max(86400000) Long durationMs) {}
    @GetMapping public StatisticsService.Summary summary() { return service.summary(); }
    @PostMapping("/activities") public void record(@Valid @RequestBody Activity activity) {
        service.record(activity.id(), activity.cardKey(), activity.rating(), activity.durationMs());
    }
    @DeleteMapping("/activities/{id}") public void undo(@PathVariable String id) { service.undo(id); }
}
