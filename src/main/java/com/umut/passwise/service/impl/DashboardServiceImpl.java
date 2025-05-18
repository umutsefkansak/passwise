
package com.umut.passwise.service.impl;

import com.umut.passwise.dto.responses.dashboard.DashboardStatisticsDto;
import com.umut.passwise.dto.responses.dashboard.DoorUsageDto;
import com.umut.passwise.dto.responses.dashboard.AccessTrendDto;
import com.umut.passwise.dto.responses.dashboard.AccessDistributionDto;
import com.umut.passwise.repository.AccessLogRepository;
import com.umut.passwise.repository.PersonnelRepository;
import com.umut.passwise.repository.DoorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class DashboardServiceImpl implements IDashboardService {

    private final AccessLogRepository accessLogRepository;
    private final PersonnelRepository personnelRepository;
    private final DoorRepository doorRepository;

    @Autowired
    public DashboardServiceImpl(AccessLogRepository accessLogRepository,
                                PersonnelRepository personnelRepository,
                                DoorRepository doorRepository) {
        this.accessLogRepository = accessLogRepository;
        this.personnelRepository = personnelRepository;
        this.doorRepository = doorRepository;
    }

    @Override
    public DashboardStatisticsDto getDashboardStatistics() {
        // Bugünün başlangıç ve bitiş zamanını belirle
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        Timestamp startTimestamp = Timestamp.valueOf(startOfDay);
        Timestamp endTimestamp = Timestamp.valueOf(endOfDay);

        // Günlük geçiş sayısı
        int dailyAccessCount = accessLogRepository.countByAccessTimestampBetween(startTimestamp, endTimestamp);

        // Aktif personel sayısı
        int activePersonnelCount = personnelRepository.countByIsActiveTrueAndPersonTypeNameNot("ZİYARETÇİ");

        // Aktif ziyaretçi sayısı
        int activeVisitorsCount = personnelRepository.countByIsActiveTrueAndPersonTypeName("ZİYARETÇİ");

        // Yetkisiz giriş sayısı (bugün)
        int unauthorizedAttempts = accessLogRepository.countByAccessTimestampBetweenAndAccessResultName(
                startTimestamp, endTimestamp, "YETKİSİZ");

        return DashboardStatisticsDto.builder()
                .dailyAccessCount(dailyAccessCount)
                .activePersonnelCount(activePersonnelCount)
                .activeVisitorsCount(activeVisitorsCount)
                .unauthorizedAttempts(unauthorizedAttempts)
                .build();
    }

    @Override
    public List<AccessTrendDto> getAccessTrend() {
        // Son 7 günlük trend verisi
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(6);

        List<AccessTrendDto> result = new ArrayList<>();

        // Günleri Türkçe kısaltmaları ile belirtmek için
        String[] dayNames = {"Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"};

        for (int i = 0; i < 7; i++) {
            LocalDate date = startDate.plusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

            Timestamp start = Timestamp.valueOf(startOfDay);
            Timestamp end = Timestamp.valueOf(endOfDay);

            // Personel geçişleri
            int personelCount = accessLogRepository.countByAccessTimestampBetweenAndPersonnelPersonTypeNameNot(
                    start, end, "ZİYARETÇİ");

            // Ziyaretçi geçişleri
            int ziyaretciCount = accessLogRepository.countByAccessTimestampBetweenAndPersonnelPersonTypeName(
                    start, end, "ZİYARETÇİ");

            AccessTrendDto dayData = AccessTrendDto.builder()
                    .name(dayNames[date.getDayOfWeek().getValue() % 7])
                    .personel(personelCount)
                    .ziyaretci(ziyaretciCount)
                    .build();

            result.add(dayData);
        }

        return result;
    }

    @Override
    public List<DoorUsageDto> getDoorUsage() {
        // Son 30 gündeki kapı kullanım verilerini getir
        LocalDateTime startOfMonth = LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        Timestamp start = Timestamp.valueOf(startOfMonth);
        Timestamp end = Timestamp.valueOf(endOfDay);

        // Kapılara göre kullanım istatistiklerini getir
        List<Object[]> doorUsageData = accessLogRepository.countAccessByDoorBetweenDates(start, end);

        List<DoorUsageDto> result = new ArrayList<>();

        for (Object[] data : doorUsageData) {
            DoorUsageDto doorUsage = DoorUsageDto.builder()
                    .name((String) data[0])
                    .value(((Number) data[1]).intValue())
                    .build();

            result.add(doorUsage);
        }

        return result;
    }

    @Override
    public List<AccessDistributionDto> getAccessDistribution() {
        // Son 30 gündeki personel/ziyaretçi dağılımını getir
        LocalDateTime startOfMonth = LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        Timestamp start = Timestamp.valueOf(startOfMonth);
        Timestamp end = Timestamp.valueOf(endOfDay);

        // Personel geçişleri
        int personelCount = accessLogRepository.countByAccessTimestampBetweenAndPersonnelPersonTypeNameNot(
                start, end, "ZİYARETÇİ");

        // Ziyaretçi geçişleri
        int ziyaretciCount = accessLogRepository.countByAccessTimestampBetweenAndPersonnelPersonTypeName(
                start, end, "ZİYARETÇİ");

        List<AccessDistributionDto> result = new ArrayList<>();

        result.add(AccessDistributionDto.builder()
                .name("Personel")
                .value(personelCount)
                .build());

        result.add(AccessDistributionDto.builder()
                .name("Ziyaretçi")
                .value(ziyaretciCount)
                .build());

        return result;
    }
}