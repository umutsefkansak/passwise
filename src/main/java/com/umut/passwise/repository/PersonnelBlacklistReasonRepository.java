package com.umut.passwise.repository;

import com.umut.passwise.entities.PersonnelBlacklistReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonnelBlacklistReasonRepository extends JpaRepository<PersonnelBlacklistReason,Long> {
}
