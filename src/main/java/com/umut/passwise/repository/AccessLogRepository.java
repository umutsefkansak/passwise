package com.umut.passwise.repository;

import com.umut.passwise.entities.AccessLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public interface AccessLogRepository extends JpaRepository<AccessLog,Long> {
    // Belirli bir zaman aralığındaki geçiş sayısını sayar
    int countByAccessTimestampBetween(Timestamp startDate, Timestamp endDate);

    // Belirli bir zaman aralığında ve sonuca göre geçiş sayısını sayar
    int countByAccessTimestampBetweenAndAccessResultName(
            Timestamp startDate, Timestamp endDate, String resultName);

    // Belirli bir zaman aralığında, ziyaretçi olmayan personel geçişlerini sayar
    int countByAccessTimestampBetweenAndPersonnelPersonTypeNameNot(
            Timestamp startDate, Timestamp endDate, String personTypeName);

    // Belirli bir zaman aralığında, belirli bir personel tipine göre geçişleri sayar
    int countByAccessTimestampBetweenAndPersonnelPersonTypeName(
            Timestamp startDate, Timestamp endDate, String personTypeName);

    // Belirli bir zaman aralığında kapılara göre kullanım sayısını getirir
    @Query("SELECT d.name, COUNT(a) FROM AccessLog a JOIN a.door d " +
            "WHERE a.accessTimestamp BETWEEN :startDate AND :endDate " +
            "GROUP BY d.name ORDER BY COUNT(a) DESC")
    List<Object[]> countAccessByDoorBetweenDates(
            @Param("startDate") Timestamp startDate,
            @Param("endDate") Timestamp endDate);

    // Son birkaç kayıt getirir
    @Query("SELECT a FROM AccessLog a ORDER BY a.accessTimestamp DESC")
    List<AccessLog> findRecentAccessLogs(Pageable pageable);
}
