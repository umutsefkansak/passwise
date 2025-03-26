package com.umut.passwise.repository;

import com.umut.passwise.entities.DoorType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoorTypeRepository extends JpaRepository<DoorType,Long> {
}
