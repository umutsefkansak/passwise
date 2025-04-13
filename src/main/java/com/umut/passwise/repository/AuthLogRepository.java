package com.umut.passwise.repository;

import com.umut.passwise.entities.AuthLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuthLogRepository extends JpaRepository<AuthLog,Long> {
    List<AuthLog> findAllByOrderByAuthDateDesc(Pageable pageable);
}
