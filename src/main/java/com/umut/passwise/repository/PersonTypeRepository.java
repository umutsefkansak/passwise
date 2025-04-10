package com.umut.passwise.repository;

import com.umut.passwise.entities.PersonType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonTypeRepository extends JpaRepository<PersonType,Long> {
}
