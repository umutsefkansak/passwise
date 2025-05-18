package com.umut.passwise.repository;

import com.umut.passwise.entities.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team,Long> {
    List<Team> findByDepartmentId(Long departmentId);
}
