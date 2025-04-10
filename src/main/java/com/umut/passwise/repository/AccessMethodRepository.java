package com.umut.passwise.repository;

import com.umut.passwise.entities.AccessMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccessMethodRepository extends JpaRepository<AccessMethod,Long> {
}
