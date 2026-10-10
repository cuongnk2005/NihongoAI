package com.nihongoai.backend.controller;

import com.nihongoai.backend.entity.SystemSettingEntity;
import com.nihongoai.backend.repository.SystemSettingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingController {

    private final SystemSettingRepository settingRepository;

    public SettingController(SystemSettingRepository settingRepository) {
        this.settingRepository = settingRepository;
    }

    @GetMapping
    public ResponseEntity<List<SystemSettingEntity>> getSettings() {
        return ResponseEntity.ok(settingRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<SystemSettingEntity> updateSetting(@RequestBody Map<String, String> body) {
        String key = body.getOrDefault("key", "");
        String value = body.getOrDefault("value", "");
        SystemSettingEntity entity = new SystemSettingEntity(key, value);
        return ResponseEntity.ok(settingRepository.save(entity));
    }
}
