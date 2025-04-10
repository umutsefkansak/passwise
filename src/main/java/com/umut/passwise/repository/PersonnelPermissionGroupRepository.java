package com.umut.passwise.repository;


import com.umut.passwise.entities.PersonnelPermissionGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonnelPermissionGroupRepository extends JpaRepository<PersonnelPermissionGroup, Long> {
}
