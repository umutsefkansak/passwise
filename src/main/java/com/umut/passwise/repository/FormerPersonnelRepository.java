package com.umut.passwise.repository;

import com.umut.passwise.entities.FormerPersonnel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FormerPersonnelRepository extends JpaRepository<FormerPersonnel,Long> {
    Optional<FormerPersonnel> findByPersonnelId(Long personnelId);

}
