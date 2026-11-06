package com.nihongoai.backend.controller;

import com.nihongoai.backend.pvp.PvpService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pvp/rooms")
public class PvpController {
    private final PvpService service;
    public PvpController(PvpService service) { this.service = service; }
    public record Create(String name, int count, String mode, String avatar, Integer seconds, PvpService.DeckSource source, PvpService.ExamSource exam) {}
    public record Join(String name, String avatar) {}
    public record Next(int round, String phase) {}
    public record Answer(int round, int choice) {}
    @PostMapping public PvpService.Session create(@RequestBody Create body) { return service.create(body.name(), body.count(), body.mode(), body.avatar(), body.seconds() == null ? 15 : body.seconds(), body.source(), body.exam()); }
    @PostMapping("/{code}/join") public PvpService.Session join(@PathVariable String code, @RequestBody Join body) { return service.join(code, body.name(), body.avatar()); }
    @PostMapping("/{code}/next") public PvpService.View next(@PathVariable String code, @RequestHeader("X-Player-Token") String token, @RequestBody Next body) { return service.next(code, token, body.round(), body.phase()); }
    @GetMapping("/{code}") public PvpService.View state(@PathVariable String code, @RequestHeader("X-Player-Token") String token) { return service.state(code, token); }
    @PostMapping("/{code}/start") public PvpService.View start(@PathVariable String code, @RequestHeader("X-Player-Token") String token) { return service.start(code, token); }
    @PostMapping("/{code}/answers") public PvpService.View answer(@PathVariable String code, @RequestHeader("X-Player-Token") String token, @RequestBody Answer body) { return service.answer(code, token, body.round(), body.choice()); }
}
