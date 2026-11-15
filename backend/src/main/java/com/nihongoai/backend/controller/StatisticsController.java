package com.nihongoai.backend.controller;

import com.nihongoai.backend.dto.DashboardSummaryDto;
import com.nihongoai.backend.dto.StatisticsDetailDto;
import com.nihongoai.backend.service.StatisticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummaryDto> getDashboardSummary() {
        return ResponseEntity.ok(statisticsService.getDashboardSummary());
    }

    @GetMapping("/detail")
    public ResponseEntity<StatisticsDetailDto> getStatisticsDetail() {
        return ResponseEntity.ok(statisticsService.getStatisticsDetail());
    }
}
