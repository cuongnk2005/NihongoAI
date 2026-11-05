package com.nihongoai.backend.controller;

import com.nihongoai.backend.pvp.PvpService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pvp/rooms")
public class PvpController {
    private final PvpService service;
    public PvpController(PvpService service) { this.service = service; }
    public record Create(String name, int count) {}
    public record Join(String name) {}
    public record Answer(int round, int choice) {}
    @PostMapping public PvpService.Session create(@RequestBody Create body) { return service.create(body.name(), body.count()); }
    @PostMapping("/{code}/join") public PvpService.Session join(@PathVariable String code, @RequestBody Join body) { return service.join(code, body.name()); }
    @GetMapping("/{code}") public PvpService.View state(@PathVariable String code, @RequestHeader("X-Player-Token") String token) { return service.state(code, token); }
    @PostMapping("/{code}/start") public PvpService.View start(@PathVariable String code, @RequestHeader("X-Player-Token") String token) { return service.start(code, token); }
    @PostMapping("/{code}/answers") public PvpService.View answer(@PathVariable String code, @RequestHeader("X-Player-Token") String token, @RequestBody Answer body) { return service.answer(code, token, body.round(), body.choice()); }
}
