package com.umut.passwise.controller;

import com.umut.passwise.dto.responses.dashboard.DashboardStatisticsDto;
import com.umut.passwise.dto.responses.dashboard.DoorUsageDto;
import com.umut.passwise.dto.responses.dashboard.AccessTrendDto;
import com.umut.passwise.dto.responses.dashboard.AccessDistributionDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final IDashboardService dashboardService;

    @Autowired
    public DashboardController(IDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/statistics")
    public ResponseEntity<DashboardStatisticsDto> getDashboardStatistics() {
        DashboardStatisticsDto statistics = dashboardService.getDashboardStatistics();
        return new ResponseEntity<>(statistics, HttpStatus.OK);
    }

    @GetMapping("/access-trend")
    public ResponseEntity<List<AccessTrendDto>> getAccessTrend() {
        List<AccessTrendDto> accessTrend = dashboardService.getAccessTrend();
        return new ResponseEntity<>(accessTrend, HttpStatus.OK);
    }

    @GetMapping("/door-usage")
    public ResponseEntity<List<DoorUsageDto>> getDoorUsage() {
        List<DoorUsageDto> doorUsage = dashboardService.getDoorUsage();
        return new ResponseEntity<>(doorUsage, HttpStatus.OK);
    }

    @GetMapping("/access-distribution")
    public ResponseEntity<List<AccessDistributionDto>> getAccessDistribution() {
        List<AccessDistributionDto> accessDistribution = dashboardService.getAccessDistribution();
        return new ResponseEntity<>(accessDistribution, HttpStatus.OK);
    }
}