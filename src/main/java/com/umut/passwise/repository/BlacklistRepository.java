package com.umut.passwise.repository;

import com.umut.passwise.entities.Blacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlacklistRepository extends JpaRepository<Blacklist,Long> {
}
