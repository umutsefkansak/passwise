package com.umut.passwise.repository;


import com.umut.passwise.entities.PermissionGroup;
import com.umut.passwise.entities.Personnel;
import com.umut.passwise.entities.PersonnelPermissionGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonnelPermissionGroupRepository extends JpaRepository<PersonnelPermissionGroup, Long> {
    void deleteByPersonnelAndPermissionGroup(Personnel personnel, PermissionGroup permissionGroup);
    boolean existsByPersonnelAndPermissionGroup(Personnel personnel, PermissionGroup permissionGroup);
}
