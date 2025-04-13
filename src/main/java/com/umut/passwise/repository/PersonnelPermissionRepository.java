package com.umut.passwise.repository;

import com.umut.passwise.entities.Door;
import com.umut.passwise.entities.Personnel;
import com.umut.passwise.entities.PersonnelPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonnelPermissionRepository extends JpaRepository<PersonnelPermission,Long> {
    boolean existsByPersonnelAndDoor(Personnel personnel, Door door);
    void deleteByPersonnelAndDoor(Personnel personnel, Door door);
}
