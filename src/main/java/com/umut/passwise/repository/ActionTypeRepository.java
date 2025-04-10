package com.umut.passwise.repository;

import com.umut.passwise.entities.ActionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActionTypeRepository extends JpaRepository<ActionType,Long> {
}
