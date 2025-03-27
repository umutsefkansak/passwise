package com.umut.passwise.repository;

import com.umut.passwise.entities.PersonnelBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonnelBlacklistRepository extends JpaRepository<PersonnelBlacklist,Long> {

}
