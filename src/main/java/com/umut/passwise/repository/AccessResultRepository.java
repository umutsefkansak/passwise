package com.umut.passwise.repository;

import com.umut.passwise.entities.AccessResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccessResultRepository extends JpaRepository<AccessResult,Long> {
    Optional<AccessResult> findByName(String name);
}
