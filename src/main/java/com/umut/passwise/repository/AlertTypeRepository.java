package com.umut.passwise.repository;

import com.umut.passwise.entities.AlertType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AlertTypeRepository extends JpaRepository<AlertType,Long> {
    Optional<AlertType> findByName(String name);
}
