package com.umut.passwise.repository;

import com.umut.passwise.entities.AuthLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthLogRepository extends JpaRepository<AuthLog,Long> {
}
