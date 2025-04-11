package com.umut.passwise.repository;

import com.umut.passwise.entities.Personnel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonnelRepository extends JpaRepository<Personnel,Long> {
    List<Personnel> findAllByIsActiveTrue();
    List<Personnel> findAllByIsActiveFalse();


}
