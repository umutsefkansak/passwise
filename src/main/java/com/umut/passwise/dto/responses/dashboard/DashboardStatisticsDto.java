package com.umut.passwise.dto.responses.dashboard;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatisticsDto {
    private int dailyAccessCount;
    private int activeVisitorsCount;
    private int activePersonnelCount;
    private int unauthorizedAttempts;


    public int getDailyAccessCount() {
        return dailyAccessCount;
    }

    public void setDailyAccessCount(int dailyAccessCount) {
        this.dailyAccessCount = dailyAccessCount;
    }

    public int getActiveVisitorsCount() {
        return activeVisitorsCount;
    }

    public void setActiveVisitorsCount(int activeVisitorsCount) {
        this.activeVisitorsCount = activeVisitorsCount;
    }

    public int getActivePersonnelCount() {
        return activePersonnelCount;
    }

    public void setActivePersonnelCount(int activePersonnelCount) {
        this.activePersonnelCount = activePersonnelCount;
    }

    public int getUnauthorizedAttempts() {
        return unauthorizedAttempts;
    }

    public void setUnauthorizedAttempts(int unauthorizedAttempts) {
        this.unauthorizedAttempts = unauthorizedAttempts;
    }
}