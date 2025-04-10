package com.umut.passwise.repository;

import com.umut.passwise.entities.AccessResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccessResultRepository extends JpaRepository<AccessResult,Long> {
}
