package com.umut.passwise.repository;

import com.umut.passwise.entities.AccessDirection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccessDirectionRepository extends JpaRepository<AccessDirection,Long> {
}
