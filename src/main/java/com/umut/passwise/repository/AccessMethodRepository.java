package com.umut.passwise.repository;

import com.umut.passwise.entities.AccessMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccessMethodRepository extends JpaRepository<AccessMethod,Long> {
    Optional<AccessMethod> findByName(String name);
}
