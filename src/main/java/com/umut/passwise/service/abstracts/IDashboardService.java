package com.umut.passwise.service.abstracts;

import com.umut.passwise.dto.responses.dashboard.DashboardStatisticsDto;
import com.umut.passwise.dto.responses.dashboard.DoorUsageDto;
import com.umut.passwise.dto.responses.dashboard.AccessTrendDto;
import com.umut.passwise.dto.responses.dashboard.AccessDistributionDto;
import com.umut.passwise.dto.responses.AccessLogResponseDto;

import java.util.List;

public interface IDashboardService {

    /**
     * Dashboard için temel istatistikleri getirir
     * @return Dashboard istatistik DTO'su
     */
    DashboardStatisticsDto getDashboardStatistics();

    /**
     * Son 7 günlük erişim trendini getirir
     * @return Günlük erişim trendi listesi
     */
    List<AccessTrendDto> getAccessTrend();

    /**
     * Kapılara göre kullanım istatistiklerini getirir
     * @return Kapı kullanım istatistikleri listesi
     */
    List<DoorUsageDto> getDoorUsage();

    /**
     * Personel/Ziyaretçi geçiş dağılımını getirir
     * @return Geçiş dağılımı listesi
     */
    List<AccessDistributionDto> getAccessDistribution();


}