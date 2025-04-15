package com.umut.passwise.repository;

import com.umut.passwise.entities.LoginActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoginActivityLogRepository extends JpaRepository<LoginActivityLog, Long> {
}